from django.urls import path
from . import views

urlpatterns = [
    path('config/', views.get_stripe_config, name='stripe-config'),
    path('create-checkout-session/', views.create_checkout_session, name='create-checkout-session'),
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('webhook/', views.stripe_webhook, name='stripe-webhook'),
    path('session-status/', views.get_session_status, name='session-status'),
]