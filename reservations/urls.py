from django.urls import path
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reservation(request):
    """Create a new reservation"""
    # For now, return success - implement with database later
    return Response({
        'success': True,
        'message': 'Reservation created successfully',
        'reservation_id': 1  # Placeholder
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reservations(request, user_id=None):
    """Get reservations for a user"""
    # Return empty list for now - implement with database later
    return Response([])


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_reservation(request, reservation_id):
    """Cancel a reservation"""
    return Response({
        'success': True,
        'message': 'Reservation cancelled successfully'
    })


urlpatterns = [
    path('', get_reservations, name='reservations-list'),
    path('create/', create_reservation, name='create-reservation'),
    path('user/<int:user_id>/', get_reservations, name='user-reservations'),
    path('cancel/<int:reservation_id>/', cancel_reservation, name='cancel-reservation'),
]
