from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import Category, MenuItem, Order, OrderItem, Reservation
from .serializers import (
    UserSerializer, CategorySerializer, MenuItemSerializer,
    OrderSerializer, ReservationSerializer
)
from accounts.models import UserProfile


def get_data(request):
    """Helper function to get data from request"""
    if hasattr(request, 'data'):
        return request.data
    return request.POST


def is_admin(user):
    """Check if user is admin"""
    return user.is_staff or user.is_superuser


# ============================
# ADMIN AUTHENTICATION
# ============================

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """Login for admin users only"""
    data = get_data(request)
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return Response({
            'error': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Find user by email - handle multiple users with same email
    try:
        # First try to find an admin user with this email
        user_obj = User.objects.filter(email__iexact=email).filter(
            Q(is_staff=True) | Q(is_superuser=True)
        ).first()
        
        if not user_obj:
            # No admin found, check if any user exists with this email
            user_obj = User.objects.filter(email__iexact=email).first()
            
            if not user_obj:
                return Response({
                    'error': 'Invalid credentials. No user found with this email.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # User exists but is not admin
            return Response({
                'error': 'You are not authorized to access admin panel'
            }, status=status.HTTP_403_FORBIDDEN)
            
    except Exception as e:
        return Response({
            'error': f'Error finding user: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Authenticate user
    authenticated_user = authenticate(username=user_obj.username, password=password)

    if not authenticated_user:
        return Response({
            'error': 'Invalid credentials. Please check your password.'
        }, status=status.HTTP_401_UNAUTHORIZED)

    # Check if user account is active
    if not authenticated_user.is_active:
        return Response({
            'error': 'Your account has been disabled.'
        }, status=status.HTTP_403_FORBIDDEN)

    # Get or create token
    token, _ = Token.objects.get_or_create(user=authenticated_user)

    return Response({
        'success': True,
        'message': 'Login successful!',
        'token': token.key,
        'user_id': authenticated_user.id,
        'username': authenticated_user.username,
        'email': authenticated_user.email,
        'is_staff': authenticated_user.is_staff,
        'is_superuser': authenticated_user.is_superuser,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_logout(request):
    """Logout admin user"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_admin(request):
    """Check if current user is admin"""
    user = request.user

    if not is_admin(user):
        return Response({
            'error': 'Not authorized'
        }, status=status.HTTP_403_FORBIDDEN)

    return Response({
        'is_admin': True,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'username': user.username,
        'email': user.email,
    })


# ============================
# DASHBOARD STATS
# ============================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    # Orders stats
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='pending').count()
    today_orders = Order.objects.filter(created_at__date=today).count()
    completed_orders = Order.objects.filter(status='delivered').count()

    # Revenue stats
    total_revenue = Order.objects.filter(
        payment_status='paid'
    ).aggregate(Sum('total'))['total__sum'] or Decimal('0.00')
    
    today_revenue = Order.objects.filter(
        payment_status='paid',
        created_at__date=today
    ).aggregate(Sum('total'))['total__sum'] or Decimal('0.00')
    
    week_revenue = Order.objects.filter(
        payment_status='paid',
        created_at__date__gte=week_ago
    ).aggregate(Sum('total'))['total__sum'] or Decimal('0.00')

    # Reservations stats
    total_reservations = Reservation.objects.count()
    pending_reservations = Reservation.objects.filter(status='pending').count()
    today_reservations = Reservation.objects.filter(date=today).count()

    # Menu stats
    total_menu_items = MenuItem.objects.count()
    active_menu_items = MenuItem.objects.filter(is_available=True).count()
    featured_items = MenuItem.objects.filter(is_featured=True).count()

    # User stats
    total_users = User.objects.filter(is_staff=False, is_superuser=False).count()
    new_users_week = User.objects.filter(
        is_staff=False, 
        is_superuser=False,
        date_joined__date__gte=week_ago
    ).count()
    active_users = User.objects.filter(is_active=True, is_staff=False, is_superuser=False).count()

    # Recent orders
    recent_orders = Order.objects.all()[:5]
    recent_orders_data = OrderSerializer(recent_orders, many=True).data

    # Recent reservations
    recent_reservations = Reservation.objects.all()[:5]
    recent_reservations_data = ReservationSerializer(recent_reservations, many=True).data

    return Response({
        'orders': {
            'total': total_orders,
            'pending': pending_orders,
            'today': today_orders,
            'completed': completed_orders,
        },
        'revenue': {
            'total': float(total_revenue),
            'today': float(today_revenue),
            'week': float(week_revenue),
        },
        'reservations': {
            'total': total_reservations,
            'pending': pending_reservations,
            'today': today_reservations,
        },
        'menu': {
            'total': total_menu_items,
            'active': active_menu_items,
            'featured': featured_items,
        },
        'users': {
            'total': total_users,
            'new_this_week': new_users_week,
            'active': active_users,
        },
        'recent_orders': recent_orders_data,
        'recent_reservations': recent_reservations_data,
    })


# ============================
# CATEGORY MANAGEMENT
# ============================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def category_list(request):
    """List all categories or create new one"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def category_detail(request, pk):
    """Get, update or delete a category"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        category = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CategorySerializer(category)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        category.delete()
        return Response({'message': 'Category deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# ============================
# MENU ITEM MANAGEMENT
# ============================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def menu_item_list(request):
    """List all menu items or create new one"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        items = MenuItem.objects.all()
        
        # Filters
        category = request.query_params.get('category')
        is_available = request.query_params.get('is_available')
        is_featured = request.query_params.get('is_featured')
        search = request.query_params.get('search')

        if category:
            items = items.filter(category__slug=category)
        if is_available is not None:
            items = items.filter(is_available=is_available.lower() == 'true')
        if is_featured is not None:
            items = items.filter(is_featured=is_featured.lower() == 'true')
        if search:
            items = items.filter(name__icontains=search)

        serializer = MenuItemSerializer(items, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = MenuItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def menu_item_detail(request, pk):
    """Get, update or delete a menu item"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        item = MenuItem.objects.get(pk=pk)
    except MenuItem.DoesNotExist:
        return Response({'error': 'Menu item not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MenuItemSerializer(item)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = MenuItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        item.delete()
        return Response({'message': 'Menu item deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# ============================
# ORDER MANAGEMENT
# ============================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_list(request):
    """List all orders or create new one"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        orders = Order.objects.all()
        
        # Filters
        status_filter = request.query_params.get('status')
        payment_status = request.query_params.get('payment_status')
        order_type = request.query_params.get('order_type')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if status_filter:
            orders = orders.filter(status=status_filter)
        if payment_status:
            orders = orders.filter(payment_status=payment_status)
        if order_type:
            orders = orders.filter(order_type=order_type)
        if date_from:
            orders = orders.filter(created_at__date__gte=date_from)
        if date_to:
            orders = orders.filter(created_at__date__lte=date_to)

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):
    """Get, update or delete an order"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        order.delete()
        return Response({'message': 'Order deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_order_status(request, pk):
    """Update order status"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    payment_status = request.data.get('payment_status')
    
    if new_status:
        order.status = new_status
        
        # Automatically update payment status when order is delivered
        # For COD orders, mark as paid when delivered
        if new_status == 'delivered' and order.payment_status == 'pending':
            order.payment_status = 'paid'
        
        # If order is cancelled, mark payment as refunded if it was paid
        if new_status == 'cancelled' and order.payment_status == 'paid':
            order.payment_status = 'refunded'
        
        order.save()
        return Response({
            'message': f'Order status updated to {new_status}',
            'status': new_status,
            'payment_status': order.payment_status
        })
    
    # Allow updating payment status directly
    if payment_status:
        order.payment_status = payment_status
        order.save()
        return Response({
            'message': f'Payment status updated to {payment_status}',
            'status': order.status,
            'payment_status': payment_status
        })
    
    return Response({'error': 'Status or payment_status is required'}, status=status.HTTP_400_BAD_REQUEST)


# ============================
# RESERVATION MANAGEMENT
# ============================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def reservation_list(request):
    """List all reservations or create new one"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        reservations = Reservation.objects.all()
        
        # Filters
        status_filter = request.query_params.get('status')
        date = request.query_params.get('date')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if status_filter:
            reservations = reservations.filter(status=status_filter)
        if date:
            reservations = reservations.filter(date=date)
        if date_from:
            reservations = reservations.filter(date__gte=date_from)
        if date_to:
            reservations = reservations.filter(date__lte=date_to)

        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ReservationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def reservation_detail(request, pk):
    """Get, update or delete a reservation"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        reservation = Reservation.objects.get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ReservationSerializer(reservation)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ReservationSerializer(reservation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        reservation.delete()
        return Response({'message': 'Reservation deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_reservation_status(request, pk):
    """Update reservation status"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        reservation = Reservation.objects.get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    table_number = request.data.get('table_number')

    if new_status:
        reservation.status = new_status
    if table_number:
        reservation.table_number = table_number
    reservation.save()

    return Response({
        'message': f'Reservation updated successfully',
        'status': reservation.status,
        'table_number': reservation.table_number
    })


# ============================
# USER MANAGEMENT
# ============================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """List all users"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.filter(is_superuser=False).order_by('-date_joined')
    
    # Filters
    is_active = request.query_params.get('is_active')
    is_staff = request.query_params.get('is_staff')
    search = request.query_params.get('search')

    if is_active is not None:
        users = users.filter(is_active=is_active.lower() == 'true')
    if is_staff is not None:
        users = users.filter(is_staff=is_staff.lower() == 'true')
    if search:
        users = users.filter(username__icontains=search) | users.filter(email__icontains=search)

    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    """Get, update or delete a user"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = request.data
        
        # Update user fields
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'is_staff' in data:
            user.is_staff = data['is_staff']
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        
        user.save()

        # Update profile if exists
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if 'phone' in data:
            profile.phone = data['phone']
        if 'address' in data:
            profile.address = data['address']
        profile.save()

        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        if user.is_superuser:
            return Response({'error': 'Cannot delete superuser'}, status=status.HTTP_403_FORBIDDEN)
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def toggle_user_status(request, pk):
    """Toggle user active status (ban/unban)"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if user.is_superuser:
        return Response({'error': 'Cannot modify superuser'}, status=status.HTTP_403_FORBIDDEN)

    user.is_active = not user.is_active
    user.save()

    status_text = 'activated' if user.is_active else 'deactivated'
    return Response({
        'message': f'User {status_text} successfully',
        'is_active': user.is_active
    })


# ============================
# REPORTS
# ============================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_report(request):
    """Get sales report"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    days = int(request.query_params.get('days', 30))
    start_date = timezone.now().date() - timedelta(days=days)

    # Daily revenue
    daily_revenue = []
    for i in range(days):
        date = start_date + timedelta(days=i)
        revenue = Order.objects.filter(
            payment_status='paid',
            created_at__date=date
        ).aggregate(Sum('total'))['total__sum'] or Decimal('0.00')
        
        orders_count = Order.objects.filter(created_at__date=date).count()
        
        daily_revenue.append({
            'date': date.isoformat(),
            'revenue': float(revenue),
            'orders': orders_count
        })

    # Top selling items
    top_items = OrderItem.objects.values('item_name').annotate(
        total_quantity=Sum('quantity'),
        total_revenue=Sum('subtotal')
    ).order_by('-total_quantity')[:10]

    # Order types distribution
    order_types = Order.objects.values('order_type').annotate(
        count=Count('id'),
        revenue=Sum('total')
    )

    return Response({
        'daily_revenue': daily_revenue,
        'top_items': list(top_items),
        'order_types': list(order_types),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def popular_items(request):
    """Get popular menu items"""
    if not is_admin(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    limit = int(request.query_params.get('limit', 10))

    items = OrderItem.objects.values('item_name', 'menu_item').annotate(
        total_orders=Count('id'),
        total_quantity=Sum('quantity'),
        total_revenue=Sum('subtotal')
    ).order_by('-total_quantity')[:limit]

    return Response(list(items))

