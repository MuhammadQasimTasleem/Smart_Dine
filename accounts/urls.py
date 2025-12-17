from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('profile/', views.user_profile, name='profile'),
    path('verify-email/<uuid:token>/', views.verify_email, name='verify-email'),
    path('resend-verification/', views.resend_verification, name='resend-verification'),
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('reset-password/<uuid:token>/', views.reset_password, name='reset-password'),
    path('verify-reset-token/<uuid:token>/', views.verify_reset_token, name='verify-reset-token'),
]