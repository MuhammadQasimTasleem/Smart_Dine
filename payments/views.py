import json
import stripe
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import os

# Initialize Stripe with secret key
stripe.api_key = settings.STRIPE_SECRET_KEY

# Frontend URL - uses environment variable or defaults to localhost:5173
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

@api_view(['GET'])
@permission_classes([AllowAny])
def get_stripe_config(request):
    """Return the Stripe publishable key to the frontend"""
    return Response({
        'publishableKey': settings.STRIPE_PUBLISHABLE_KEY
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def create_checkout_session(request):
    """Create a Stripe Checkout Session for payment"""
    try:
        data = request.data
        
        # Get order details from request
        order_type = data.get('order_type', 'food_order')
        items = data.get('items', [])
        total_amount = data.get('total_amount', 0)
        customer_email = data.get('email', '')
        customer_name = data.get('name', '')
        
        # Build line items for Stripe
        line_items = []
        
        if order_type == 'table_reservation':
            # Table reservation payment
            line_items.append({
                'price_data': {
                    'currency': 'pkr',
                    'product_data': {
                        'name': f"Table Reservation - {data.get('table_name', 'Table')}",
                        'description': f"Date: {data.get('date', 'N/A')}, Time: {data.get('time', 'N/A')}, Guests: {data.get('guests', 'N/A')}",
                    },
                    'unit_amount': int(float(total_amount) * 100),  # Convert to paisa
                },
                'quantity': 1,
            })
        else:
            # Food order payment
            for item in items:
                # Ensure description is not empty
                description = item.get('description', '')
                if not description or description.strip() == '':
                    description = f"Delicious {item.get('name', 'Food Item')}"
                
                line_items.append({
                    'price_data': {
                        'currency': 'pkr',
                        'product_data': {
                            'name': item.get('name', 'Food Item'),
                            'description': description,
                        },
                        'unit_amount': int(float(item.get('price', 0)) * 100),  # Convert to paisa
                    },
                    'quantity': item.get('quantity', 1),
                })
        
        # Create Checkout Session with frontend URLs
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            customer_email=customer_email or None,
            metadata={
                'order_type': order_type,
                'customer_name': customer_name,
            },
            success_url=f"{FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/payment-cancelled",
        )
        
        return Response({
            'sessionId': checkout_session.id,
            'url': checkout_session.url
        })
        
    except stripe.error.StripeError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment_intent(request):
    """Create a Payment Intent for custom payment flow"""
    try:
        data = request.data
        amount = int(float(data.get('amount', 0)) * 100)  # Convert to paisa
        
        if amount < 100:  # Minimum amount check (1 PKR = 100 paisa)
            return Response({
                'error': 'Amount must be at least 1 PKR'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='pkr',
            metadata={
                'order_type': data.get('order_type', 'food_order'),
                'customer_name': data.get('name', ''),
                'customer_email': data.get('email', ''),
            }
        )
        
        return Response({
            'clientSecret': intent.client_secret
        })
        
    except stripe.error.StripeError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """Handle Stripe webhooks for payment confirmation"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    # If no webhook secret is set, skip signature verification (for development)
    if not settings.STRIPE_WEBHOOK_SECRET:
        try:
            event = json.loads(payload)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid payload'}, status=400)
    else:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return Response({'error': 'Invalid payload'}, status=400)
        except stripe.error.SignatureVerificationError as e:
            return Response({'error': 'Invalid signature'}, status=400)
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        print(f"Payment completed for session: {session['id']}")
        
    elif event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        print(f"PaymentIntent succeeded: {payment_intent['id']}")
    
    return Response({'status': 'success'})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_session_status(request):
    """Get the status of a checkout session"""
    session_id = request.GET.get('session_id')
    
    if not session_id:
        return Response({
            'error': 'Session ID is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        return Response({
            'status': session.payment_status,
            'customer_email': session.customer_details.email if session.customer_details else None,
        })
    except stripe.error.StripeError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
