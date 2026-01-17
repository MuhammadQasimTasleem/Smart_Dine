from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.admin_login, name='admin-login'),
    path('logout/', views.admin_logout, name='admin-logout'),
    path('check/', views.check_admin, name='admin-check'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    
    # Categories
    path('categories/', views.category_list, name='category-list'),
    path('categories/<int:pk>/', views.category_detail, name='category-detail'),
    
    # Menu Items
    path('menu/', views.menu_item_list, name='menu-item-list'),
    path('menu/<int:pk>/', views.menu_item_detail, name='menu-item-detail'),
    
    # Orders
    path('orders/', views.order_list, name='order-list'),
    path('orders/<int:pk>/', views.order_detail, name='order-detail'),
    path('orders/<int:pk>/status/', views.update_order_status, name='order-status'),
    
    # Reservations
    path('reservations/', views.reservation_list, name='reservation-list'),
    path('reservations/<int:pk>/', views.reservation_detail, name='reservation-detail'),
    path('reservations/<int:pk>/status/', views.update_reservation_status, name='reservation-status'),
    
    # Users
    path('users/', views.user_list, name='user-list'),
    path('users/<int:pk>/', views.user_detail, name='user-detail'),
    path('users/<int:pk>/toggle-status/', views.toggle_user_status, name='user-toggle-status'),
    
    # Reports
    path('reports/sales/', views.sales_report, name='sales-report'),
    path('reports/popular-items/', views.popular_items, name='popular-items'),
]
