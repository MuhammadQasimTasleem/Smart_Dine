from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

# Import models from admin_panel
from admin_panel.models import Reservation


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow both authenticated and guest reservations
def create_reservation(request):
    """Create a new reservation"""
    try:
        data = request.data
        
        # Get user if authenticated
        user = request.user if request.user.is_authenticated else None
        
        # Extract reservation data
        customer_name = data.get('customer_name', data.get('name', ''))
        customer_email = data.get('customer_email', data.get('email', ''))
        customer_phone = data.get('customer_phone', data.get('phone', ''))
        date_str = data.get('date', '')
        time_str = data.get('time', '')
        party_size = int(data.get('party_size', data.get('guests', 2)))
        special_requests = data.get('special_requests', data.get('notes', ''))
        
        # Validate required fields
        if not customer_name or not customer_email or not date_str or not time_str:
            return Response({
                'success': False,
                'error': 'Missing required fields: name, email, date, and time are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse date and time
        try:
            reservation_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'success': False,
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Handle different time formats
            if len(time_str) == 5:  # HH:MM format
                reservation_time = datetime.strptime(time_str, '%H:%M').time()
            else:  # HH:MM:SS format
                reservation_time = datetime.strptime(time_str, '%H:%M:%S').time()
        except ValueError:
            return Response({
                'success': False,
                'error': 'Invalid time format. Use HH:MM or HH:MM:SS'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create reservation
        reservation = Reservation.objects.create(
            user=user,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            date=reservation_date,
            time=reservation_time,
            party_size=party_size,
            status='pending',
            special_requests=special_requests
        )
        
        return Response({
            'success': True,
            'message': 'Reservation created successfully',
            'reservation_id': reservation.id,
            'reservation': {
                'id': reservation.id,
                'date': str(reservation.date),
                'time': str(reservation.time),
                'party_size': reservation.party_size,
                'status': reservation.status,
                'created_at': reservation.created_at.isoformat()
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reservations(request, user_id=None):
    """Get reservations for a user"""
    try:
        user = request.user
        reservations = Reservation.objects.filter(user=user).order_by('-date', '-time')
        
        reservation_list = []
        for res in reservations:
            reservation_list.append({
                'id': res.id,
                'customer_name': res.customer_name,
                'customer_email': res.customer_email,
                'customer_phone': res.customer_phone,
                'date': str(res.date),
                'time': str(res.time),
                'party_size': res.party_size,
                'table_number': res.table_number,
                'status': res.status,
                'special_requests': res.special_requests,
                'created_at': res.created_at.isoformat()
            })
        
        return Response(reservation_list)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_reservation(request, reservation_id):
    """Cancel a reservation"""
    try:
        reservation = Reservation.objects.get(id=reservation_id)
        
        # Check if user owns this reservation
        if reservation.user != request.user and not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Not authorized to cancel this reservation'
            }, status=status.HTTP_403_FORBIDDEN)
        
        reservation.status = 'cancelled'
        reservation.save()
        
        return Response({
            'success': True,
            'message': 'Reservation cancelled successfully'
        })
        
    except Reservation.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Reservation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


urlpatterns = [
    path('', get_reservations, name='reservations-list'),
    path('create/', create_reservation, name='create-reservation'),
    path('user/<int:user_id>/', get_reservations, name='user-reservations'),
    path('cancel/<int:reservation_id>/', cancel_reservation, name='cancel-reservation'),
]
