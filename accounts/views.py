import json
import re
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .serializers import UserSerializer
from .models import EmailVerificationToken, UserProfile, PasswordResetToken
from .utils import send_verification_email, resend_verification_email, send_password_reset_email

def get_data(request):
    """Helper function to handle data whether it comes as dict or string"""
    data = request.data
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError:
            data = {}
    return data if isinstance(data, dict) else {}


def validate_password(password):
    """
    Validate password strength:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter.")
    
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter.")
    
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one digit.")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]', password):
        errors.append("Password must contain at least one special character (!@#$%^&* etc.).")
    
    return errors


def validate_email(email):
    """Validate email format"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        return "Please enter a valid email address."
    return None


def validate_username(username):
    """Validate username"""
    errors = []
    
    if len(username) < 3:
        errors.append("Username must be at least 3 characters long.")
    
    if len(username) > 30:
        errors.append("Username must be less than 30 characters.")
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        errors.append("Username can only contain letters, numbers, and underscores.")
    
    return errors


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = get_data(request)
    
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    # Validate username
    if not username:
        return Response({
            'error': 'missing_username',
            'message': 'Username is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    username_errors = validate_username(username)
    if username_errors:
        return Response({
            'error': 'invalid_username',
            'message': username_errors[0],
            'details': username_errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate email
    if not email:
        return Response({
            'error': 'missing_email',
            'message': 'Email is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    email_error = validate_email(email)
    if email_error:
        return Response({
            'error': 'invalid_email',
            'message': email_error
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password
    if not password:
        return Response({
            'error': 'missing_password',
            'message': 'Password is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if (password_errors := validate_password(password)):
        return Response({
            'error': 'weak_password',
            'message': password_errors[0],
            'details': password_errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if username already exists
    if User.objects.filter(username__iexact=username).exists():
        return Response({
            'error': 'username_exists',
            'message': 'A user with this username already exists.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email already exists
    if User.objects.filter(email__iexact=email).exists():
        return Response({
            'error': 'email_exists',
            'message': 'A user with this email already exists.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Send verification email
        email_sent = send_verification_email(user)
        
        return Response({
            'success': True,
            'message': 'Registration successful! Please check your email to verify your account.',
            'email_sent': email_sent,
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_201_CREATED)
    
    # Handle other validation errors
    error_message = 'Registration failed. Please check your details.'
    if 'username' in serializer.errors:
        error_message = serializer.errors['username'][0]
    elif 'email' in serializer.errors:
        error_message = serializer.errors['email'][0]
    elif 'password' in serializer.errors:
        error_message = serializer.errors['password'][0]
    
    return Response({
        'error': 'validation_error',
        'message': error_message,
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    data = get_data(request)
    
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email:
        return Response({
            'error': 'missing_email',
            'message': 'Email is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not password:
        return Response({
            'error': 'missing_password',
            'message': 'Password is required.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Validate email format
    if (email_error := validate_email(email)):
        return Response({
            'error': 'invalid_email',
            'message': email_error
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if any user exists with this email
    try:
        user_obj = User.objects.get(email__iexact=email)
        username = user_obj.username
    except User.DoesNotExist:
        return Response({
            'error': 'not_registered',
            'message': 'No account found with this email. Please register first.'
        }, status=status.HTTP_404_NOT_FOUND)

    # Check if email is verified
    try:
        profile = user_obj.profile
        if not profile.email_verified:
            return Response({
                'error': 'email_not_verified',
                'message': 'Please verify your email before logging in. Check your inbox for the verification link.',
                'email': user_obj.email
            }, status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        UserProfile.objects.create(user=user_obj, email_verified=False)
        return Response({
            'error': 'email_not_verified',
            'message': 'Please verify your email before logging in. Check your inbox for the verification link.',
            'email': user_obj.email
        }, status=status.HTTP_403_FORBIDDEN)

    # User exists, now check password
    user = authenticate(username=username, password=password)

    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'success': True,
            'message': 'Login successful!',
            'token': token.key,
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'invalid_credentials',
        'message': 'Invalid credentials. Please check your password.'
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    request.user.auth_token.delete()
    return Response({
        'success': True,
        'message': 'Successfully logged out.'
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        data = get_data(request)
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully.',
                'data': serializer.data
            })
        return Response({
            'error': 'validation_error',
            'message': 'Failed to update profile.',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    """Verify user's email using the token from the email link"""
    try:
        verification = EmailVerificationToken.objects.get(token=token)
        
        if verification.is_expired():
            return Response({
                'error': 'token_expired',
                'message': 'Verification link has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if verification.is_verified:
            return Response({
                'success': True,
                'message': 'Email already verified. You can now login.',
                'already_verified': True
            }, status=status.HTTP_200_OK)
        
        verification.is_verified = True
        verification.save()
        
        user = verification.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.email_verified = True
        profile.save()
        
        return Response({
            'success': True,
            'message': 'Email verified successfully! You can now login.',
            'username': user.username
        }, status=status.HTTP_200_OK)
        
    except EmailVerificationToken.DoesNotExist:
        return Response({
            'error': 'invalid_token',
            'message': 'Invalid verification link.'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification(request):
    """Resend verification email to user"""
    data = get_data(request)
    email = data.get('email', '').strip()
    
    if not email:
        return Response({
            'error': 'missing_email',
            'message': 'Please provide your email address.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email__iexact=email)
        
        try:
            profile = user.profile
            if profile.email_verified:
                return Response({
                    'error': 'already_verified',
                    'message': 'Your email is already verified. You can login.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            pass
        
        email_sent = resend_verification_email(user)
        
        if email_sent:
            return Response({
                'success': True,
                'message': 'Verification email sent! Please check your inbox.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'email_failed',
                'message': 'Failed to send verification email. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except User.DoesNotExist:
        return Response({
            'error': 'user_not_found',
            'message': 'No account found with this email address.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send password reset email to user"""
    data = get_data(request)
    email = data.get('email', '').strip()
    
    if not email:
        return Response({
            'error': 'missing_email',
            'message': 'Please provide your email address.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email__iexact=email)
        
        email_sent = send_password_reset_email(user)
        
        if email_sent:
            return Response({
                'success': True,
                'message': 'Password reset link sent! Please check your email.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'email_failed',
                'message': 'Failed to send reset email. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except User.DoesNotExist:
        return Response({
            'success': True,
            'message': 'If an account with this email exists, you will receive a password reset link.'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request, token):
    """Reset user's password using the token from email"""
    data = get_data(request)
    new_password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')
    
    if not new_password:
        return Response({
            'error': 'missing_password',
            'message': 'Please provide a new password.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password strength
    password_errors = validate_password(new_password)
    if password_errors:
        return Response({
            'error': 'weak_password',
            'message': password_errors[0],
            'details': password_errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({
            'error': 'password_mismatch',
            'message': 'Passwords do not match.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        reset_token = PasswordResetToken.objects.get(token=token)
        
        if reset_token.is_expired():
            return Response({
                'error': 'token_expired',
                'message': 'Password reset link has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if reset_token.is_used:
            return Response({
                'error': 'token_used',
                'message': 'This password reset link has already been used.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        reset_token.is_used = True
        reset_token.save()
        
        Token.objects.filter(user=user).delete()
        
        return Response({
            'success': True,
            'message': 'Password reset successfully! You can now login with your new password.'
        }, status=status.HTTP_200_OK)
        
    except PasswordResetToken.DoesNotExist:
        return Response({
            'error': 'invalid_token',
            'message': 'Invalid password reset link.'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_reset_token(request, token):
    """Verify if a password reset token is valid"""
    try:
        reset_token = PasswordResetToken.objects.get(token=token)
        
        if reset_token.is_expired():
            return Response({
                'valid': False,
                'error': 'token_expired',
                'message': 'Password reset link has expired.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if reset_token.is_used:
            return Response({
                'valid': False,
                'error': 'token_used',
                'message': 'This link has already been used.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'valid': True,
            'message': 'Token is valid.'
        }, status=status.HTTP_200_OK)
        
    except PasswordResetToken.DoesNotExist:
        return Response({
            'valid': False,
            'error': 'invalid_token',
            'message': 'Invalid password reset link.'
        }, status=status.HTTP_400_BAD_REQUEST)
