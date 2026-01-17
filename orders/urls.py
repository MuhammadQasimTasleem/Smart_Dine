from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from decimal import Decimal

# Import models from admin_panel
from admin_panel.models import Order, OrderItem, MenuItem


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow both authenticated and guest orders
def place_order(request):
    """Place a new order"""
    try:
        data = request.data
        
        # Get user if authenticated
        user = request.user if request.user.is_authenticated else None
        
        # Extract order data
        customer_name = data.get('customer_name', data.get('name', ''))
        customer_email = data.get('customer_email', data.get('email', ''))
        customer_phone = data.get('customer_phone', data.get('phone', ''))
        customer_address = data.get('customer_address', data.get('address', ''))
        order_type = data.get('order_type', 'delivery')
        special_instructions = data.get('special_instructions', data.get('notes', ''))
        items = data.get('items', [])
        
        if not items:
            return Response({
                'success': False,
                'error': 'No items in order'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        subtotal = Decimal('0.00')
        for item in items:
            item_price = Decimal(str(item.get('price', 0)))
            quantity = int(item.get('quantity', 1))
            subtotal += item_price * quantity
        
        tax = subtotal * Decimal('0.05')  # 5% tax
        delivery_fee = Decimal('150.00') if order_type == 'delivery' else Decimal('0.00')
        total = subtotal + tax + delivery_fee
        
        # Create order
        order = Order.objects.create(
            user=user,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            customer_address=customer_address,
            order_type=order_type,
            status='pending',
            payment_status=data.get('payment_status', 'pending'),
            subtotal=subtotal,
            tax=tax,
            total=total,
            special_instructions=special_instructions,
            stripe_payment_id=data.get('stripe_payment_id', '')
        )
        
        # Create order items
        for item in items:
            # Try to find menu item
            menu_item = None
            item_id = item.get('id') or item.get('menu_item_id')
            if item_id:
                try:
                    menu_item = MenuItem.objects.get(id=item_id)
                except MenuItem.DoesNotExist:
                    pass
            
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                item_name=item.get('name', 'Unknown Item'),
                item_price=Decimal(str(item.get('price', 0))),
                quantity=int(item.get('quantity', 1))
            )
        
        return Response({
            'success': True,
            'message': 'Order placed successfully',
            'order_id': order.id,
            'order': {
                'id': order.id,
                'status': order.status,
                'total': str(order.total),
                'created_at': order.created_at.isoformat()
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_history(request, user_id=None):
    """Get order history for a user"""
    try:
        user = request.user
        orders = Order.objects.filter(user=user).order_by('-created_at')
        
        order_list = []
        for order in orders:
            order_items = []
            for item in order.items.all():
                order_items.append({
                    'id': item.id,
                    'name': item.item_name,
                    'price': str(item.item_price),
                    'quantity': item.quantity,
                    'subtotal': str(item.subtotal)
                })
            
            order_list.append({
                'id': order.id,
                'customer_name': order.customer_name,
                'order_type': order.order_type,
                'status': order.status,
                'payment_status': order.payment_status,
                'subtotal': str(order.subtotal),
                'tax': str(order.tax),
                'total': str(order.total),
                'items': order_items,
                'created_at': order.created_at.isoformat(),
                'updated_at': order.updated_at.isoformat()
            })
        
        return Response(order_list)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def track_order(request, order_id):
    """Track order status"""
    try:
        order = Order.objects.get(id=order_id)
        return Response({
            'order_id': order.id,
            'status': order.status,
            'payment_status': order.payment_status,
            'total': str(order.total),
            'created_at': order.created_at.isoformat(),
            'updated_at': order.updated_at.isoformat()
        })
    except Order.DoesNotExist:
        return Response({
            'error': 'Order not found'
        }, status=status.HTTP_404_NOT_FOUND)


urlpatterns = [
    path('', place_order, name='place-order'),
    path('history/', order_history, name='order-history'),
    path('history/<int:user_id>/', order_history, name='order-history-user'),
    path('track/<int:order_id>/', track_order, name='track-order'),
]
