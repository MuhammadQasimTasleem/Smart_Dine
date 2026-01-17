from django.urls import path
from django.http import JsonResponse
from admin_panel.models import MenuItem, Category


def menu_list(request):
    """Get all menu items with optional search and sorting"""
    search = request.GET.get('search', '').lower()
    sort_by = request.GET.get('sort', 'name')
    category = request.GET.get('category', '')
    
    # Get menu items from database
    queryset = MenuItem.objects.filter(is_available=True).select_related('category')
    
    # Filter by search
    if search:
        queryset = queryset.filter(name__icontains=search) | queryset.filter(description__icontains=search)
    
    # Filter by category
    if category:
        queryset = queryset.filter(category__slug__iexact=category) | queryset.filter(category__name__iexact=category)
    
    # Sort
    if sort_by == 'price':
        queryset = queryset.order_by('price')
    elif sort_by == 'price_desc':
        queryset = queryset.order_by('-price')
    elif sort_by == 'rating':
        queryset = queryset.order_by('-rating')
    else:
        queryset = queryset.order_by('name')
    
    items = []
    for item in queryset:
        items.append({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'price': float(item.price),
            'category': item.category.slug if item.category else 'uncategorized',
            'category_name': item.category.name if item.category else 'Uncategorized',
            'isVeg': item.is_veg,
            'is_veg': item.is_veg,
            'rating': float(item.rating),
            'image': item.image,
            'is_featured': item.is_featured,
            'is_available': item.is_available
        })
    
    return JsonResponse(items, safe=False)


def menu_detail(request, item_id):
    """Get single menu item by ID"""
    try:
        item = MenuItem.objects.select_related('category').get(id=item_id)
        return JsonResponse({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'price': float(item.price),
            'category': item.category.slug if item.category else 'uncategorized',
            'category_name': item.category.name if item.category else 'Uncategorized',
            'isVeg': item.is_veg,
            'is_veg': item.is_veg,
            'rating': float(item.rating),
            'image': item.image,
            'is_featured': item.is_featured,
            'is_available': item.is_available
        })
    except MenuItem.DoesNotExist:
        return JsonResponse({'error': 'Item not found'}, status=404)


def categories_list(request):
    """Get all categories"""
    categories = Category.objects.filter(is_active=True).order_by('name')
    data = []
    for cat in categories:
        data.append({
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'description': cat.description,
            'image': cat.image
        })
    return JsonResponse(data, safe=False)


def featured_items(request):
    """Get featured menu items"""
    items = MenuItem.objects.filter(is_available=True, is_featured=True).select_related('category')[:8]
    data = []
    for item in items:
        data.append({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'price': float(item.price),
            'category': item.category.slug if item.category else 'uncategorized',
            'isVeg': item.is_veg,
            'rating': float(item.rating),
            'image': item.image
        })
    return JsonResponse(data, safe=False)


urlpatterns = [
    path('', menu_list, name='menu-list'),
    path('categories/', categories_list, name='categories-list'),
    path('featured/', featured_items, name='featured-items'),
    path('<int:item_id>/', menu_detail, name='menu-detail'),
]
