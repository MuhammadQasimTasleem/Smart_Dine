from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, MenuItem, Order, OrderItem, Reservation
from accounts.models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    phone = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_active', 'is_staff', 'is_superuser', 'date_joined', 
                  'last_login', 'phone', 'address']

    def get_phone(self, obj):
        profile = UserProfile.objects.filter(user=obj).first()
        return profile.phone if profile else ''

    def get_address(self, obj):
        profile = UserProfile.objects.filter(user=obj).first()
        return profile.address if profile else ''


class CategorySerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_item_count(self, obj):
        return obj.items.count()


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = '__all__'

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None


class ReservationSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = '__all__'

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
