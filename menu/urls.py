from django.urls import path
from django.http import JsonResponse
from .models import *

# Placeholder menu data - same as frontend's menuData.js
MENU_DATA = [
    {"id": 1, "name": "Margherita Pizza", "description": "Classic pizza with fresh mozzarella, tomatoes, and basil", "price": 299, "category": "pizza", "isVeg": True, "rating": 4.5},
    {"id": 2, "name": "Chicken Biryani", "description": "Aromatic basmati rice with tender chicken and spices", "price": 349, "category": "biryani", "isVeg": False, "rating": 4.8},
    {"id": 3, "name": "Paneer Butter Masala", "description": "Soft paneer in rich, creamy tomato gravy", "price": 279, "category": "main course", "isVeg": True, "rating": 4.6},
    {"id": 4, "name": "Chicken Burger", "description": "Juicy grilled chicken patty with fresh veggies", "price": 199, "category": "burgers", "isVeg": False, "rating": 4.3},
    {"id": 5, "name": "Veg Hakka Noodles", "description": "Stir-fried noodles with vegetables and spices", "price": 179, "category": "chinese", "isVeg": True, "rating": 4.2},
    {"id": 6, "name": "Chocolate Brownie", "description": "Warm brownie with vanilla ice cream", "price": 149, "category": "desserts", "isVeg": True, "rating": 4.7},
    {"id": 7, "name": "Masala Dosa", "description": "Crispy rice crepe with spiced potato filling", "price": 129, "category": "south indian", "isVeg": True, "rating": 4.4},
    {"id": 8, "name": "Butter Chicken", "description": "Tender chicken in creamy tomato curry", "price": 329, "category": "main course", "isVeg": False, "rating": 4.9},
]


def menu_list(request):
    """Get all menu items with optional search and sorting"""
    search = request.GET.get('search', '').lower()
    sort_by = request.GET.get('sort', 'name')
    category = request.GET.get('category', '')
    
    items = MENU_DATA.copy()
    
    # Filter by search
    if search:
        items = [item for item in items if search in item['name'].lower() or search in item['description'].lower()]
    
    # Filter by category
    if category:
        items = [item for item in items if item['category'].lower() == category.lower()]
    
    # Sort
    if sort_by == 'price':
        items.sort(key=lambda x: x['price'])
    elif sort_by == 'price_desc':
        items.sort(key=lambda x: x['price'], reverse=True)
    elif sort_by == 'rating':
        items.sort(key=lambda x: x['rating'], reverse=True)
    else:
        items.sort(key=lambda x: x['name'])
    
    return JsonResponse(items, safe=False)


def menu_detail(request, item_id):
    """Get single menu item by ID"""
    item = next((item for item in MENU_DATA if item['id'] == item_id), None)
    if item:
        return JsonResponse(item)
    return JsonResponse({'error': 'Item not found'}, status=404)


urlpatterns = [
    path('', menu_list, name='menu-list'),
    path('<int:item_id>/', menu_detail, name='menu-detail'),
]
