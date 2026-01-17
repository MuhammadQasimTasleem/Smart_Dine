from django.core.management.base import BaseCommand
from admin_panel.models import Category, MenuItem
from django.utils.text import slugify


class Command(BaseCommand):
    help = 'Seed the database with initial menu items and categories'

    def handle(self, *args, **options):
        self.stdout.write('Seeding menu data...')
        
        # Create categories
        categories_data = [
            {'name': 'Pizza', 'slug': 'pizza', 'description': 'Delicious Italian pizzas with fresh toppings', 'image': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'},
            {'name': 'Biryani', 'slug': 'biryani', 'description': 'Aromatic rice dishes with tender meat and spices', 'image': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400'},
            {'name': 'Main Course', 'slug': 'main-course', 'description': 'Hearty main course dishes', 'image': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'},
            {'name': 'Burgers', 'slug': 'burgers', 'description': 'Juicy burgers with premium ingredients', 'image': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'},
            {'name': 'Chinese', 'slug': 'chinese', 'description': 'Authentic Chinese cuisine', 'image': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400'},
            {'name': 'Desserts', 'slug': 'desserts', 'description': 'Sweet treats to end your meal', 'image': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400'},
            {'name': 'South Indian', 'slug': 'south-indian', 'description': 'Traditional South Indian delicacies', 'image': 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400'},
            {'name': 'Beverages', 'slug': 'beverages', 'description': 'Refreshing drinks and beverages', 'image': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'},
            {'name': 'Appetizers', 'slug': 'appetizers', 'description': 'Delicious starters to begin your meal', 'image': 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400'},
            {'name': 'Salads', 'slug': 'salads', 'description': 'Fresh and healthy salads', 'image': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'},
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.update_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = category
            if created:
                self.stdout.write(f'  Created category: {category.name}')
            else:
                self.stdout.write(f'  Updated category: {category.name}')
        
        # Create menu items
        menu_items_data = [
            # Pizza
            {'name': 'Margherita Pizza', 'description': 'Classic pizza with fresh mozzarella, tomatoes, and basil', 'price': 299, 'category': 'pizza', 'is_veg': True, 'rating': 4.5, 'is_featured': True, 'image': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'},
            {'name': 'Pepperoni Pizza', 'description': 'Loaded with spicy pepperoni and mozzarella cheese', 'price': 349, 'category': 'pizza', 'is_veg': False, 'rating': 4.7, 'is_featured': True, 'image': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'},
            {'name': 'BBQ Chicken Pizza', 'description': 'Smoky BBQ sauce with grilled chicken and onions', 'price': 399, 'category': 'pizza', 'is_veg': False, 'rating': 4.6, 'image': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'},
            {'name': 'Veggie Supreme Pizza', 'description': 'Loaded with bell peppers, mushrooms, olives, and corn', 'price': 329, 'category': 'pizza', 'is_veg': True, 'rating': 4.4, 'image': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'},
            
            # Biryani
            {'name': 'Chicken Biryani', 'description': 'Aromatic basmati rice with tender chicken and spices', 'price': 349, 'category': 'biryani', 'is_veg': False, 'rating': 4.8, 'is_featured': True, 'image': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400'},
            {'name': 'Mutton Biryani', 'description': 'Slow-cooked mutton with fragrant rice and spices', 'price': 449, 'category': 'biryani', 'is_veg': False, 'rating': 4.9, 'is_featured': True, 'image': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400'},
            {'name': 'Vegetable Biryani', 'description': 'Mixed vegetables with aromatic basmati rice', 'price': 249, 'category': 'biryani', 'is_veg': True, 'rating': 4.3, 'image': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400'},
            {'name': 'Egg Biryani', 'description': 'Flavorful rice with boiled eggs and spices', 'price': 279, 'category': 'biryani', 'is_veg': False, 'rating': 4.2, 'image': 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=400'},
            
            # Main Course
            {'name': 'Paneer Butter Masala', 'description': 'Soft paneer in rich, creamy tomato gravy', 'price': 279, 'category': 'main-course', 'is_veg': True, 'rating': 4.6, 'is_featured': True, 'image': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400'},
            {'name': 'Butter Chicken', 'description': 'Tender chicken in creamy tomato curry', 'price': 329, 'category': 'main-course', 'is_veg': False, 'rating': 4.9, 'is_featured': True, 'image': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400'},
            {'name': 'Dal Makhani', 'description': 'Slow-cooked black lentils in creamy butter sauce', 'price': 199, 'category': 'main-course', 'is_veg': True, 'rating': 4.5, 'image': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400'},
            {'name': 'Chicken Tikka Masala', 'description': 'Grilled chicken tikka in spiced tomato sauce', 'price': 349, 'category': 'main-course', 'is_veg': False, 'rating': 4.7, 'image': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400'},
            {'name': 'Kadai Paneer', 'description': 'Cottage cheese cooked with bell peppers in kadai masala', 'price': 259, 'category': 'main-course', 'is_veg': True, 'rating': 4.4, 'image': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400'},
            {'name': 'Mutton Rogan Josh', 'description': 'Kashmiri style lamb curry with aromatic spices', 'price': 429, 'category': 'main-course', 'is_veg': False, 'rating': 4.8, 'image': 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400'},
            
            # Burgers
            {'name': 'Chicken Burger', 'description': 'Juicy grilled chicken patty with fresh veggies', 'price': 199, 'category': 'burgers', 'is_veg': False, 'rating': 4.3, 'is_featured': True, 'image': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'},
            {'name': 'Classic Beef Burger', 'description': 'Premium beef patty with cheese and special sauce', 'price': 249, 'category': 'burgers', 'is_veg': False, 'rating': 4.6, 'image': 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400'},
            {'name': 'Veggie Burger', 'description': 'Crispy vegetable patty with fresh lettuce and tomato', 'price': 149, 'category': 'burgers', 'is_veg': True, 'rating': 4.1, 'image': 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400'},
            {'name': 'Double Cheese Burger', 'description': 'Double patty with extra cheese and bacon', 'price': 329, 'category': 'burgers', 'is_veg': False, 'rating': 4.7, 'image': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400'},
            
            # Chinese
            {'name': 'Veg Hakka Noodles', 'description': 'Stir-fried noodles with vegetables and spices', 'price': 179, 'category': 'chinese', 'is_veg': True, 'rating': 4.2, 'image': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'},
            {'name': 'Chicken Fried Rice', 'description': 'Wok-tossed rice with chicken and vegetables', 'price': 219, 'category': 'chinese', 'is_veg': False, 'rating': 4.4, 'image': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400'},
            {'name': 'Manchurian', 'description': 'Crispy vegetable balls in spicy manchurian sauce', 'price': 189, 'category': 'chinese', 'is_veg': True, 'rating': 4.3, 'is_featured': True, 'image': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400'},
            {'name': 'Chilli Chicken', 'description': 'Spicy stir-fried chicken with peppers', 'price': 259, 'category': 'chinese', 'is_veg': False, 'rating': 4.5, 'image': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400'},
            {'name': 'Spring Rolls', 'description': 'Crispy rolls filled with vegetables', 'price': 129, 'category': 'chinese', 'is_veg': True, 'rating': 4.1, 'image': 'https://images.unsplash.com/photo-1548507200-81e4ed7f0027?w=400'},
            
            # Desserts
            {'name': 'Chocolate Brownie', 'description': 'Warm brownie with vanilla ice cream', 'price': 149, 'category': 'desserts', 'is_veg': True, 'rating': 4.7, 'is_featured': True, 'image': 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400'},
            {'name': 'Gulab Jamun', 'description': 'Soft milk dumplings in sweet rose syrup', 'price': 99, 'category': 'desserts', 'is_veg': True, 'rating': 4.6, 'image': 'https://images.unsplash.com/photo-1666190094614-8d25c8871e5f?w=400'},
            {'name': 'Ice Cream Sundae', 'description': 'Three scoops with chocolate sauce and nuts', 'price': 179, 'category': 'desserts', 'is_veg': True, 'rating': 4.4, 'image': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'},
            {'name': 'Rasmalai', 'description': 'Soft cheese patties in sweet saffron milk', 'price': 129, 'category': 'desserts', 'is_veg': True, 'rating': 4.5, 'image': 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400'},
            {'name': 'Cheesecake', 'description': 'Creamy New York style cheesecake', 'price': 199, 'category': 'desserts', 'is_veg': True, 'rating': 4.8, 'image': 'https://images.unsplash.com/photo-1567327613485-fbc7bf196198?w=400'},
            
            # South Indian
            {'name': 'Masala Dosa', 'description': 'Crispy rice crepe with spiced potato filling', 'price': 129, 'category': 'south-indian', 'is_veg': True, 'rating': 4.4, 'is_featured': True, 'image': 'https://images.unsplash.com/photo-1668236543090-82ber3b4aeb?w=400'},
            {'name': 'Idli Sambar', 'description': 'Steamed rice cakes with lentil soup', 'price': 99, 'category': 'south-indian', 'is_veg': True, 'rating': 4.3, 'image': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400'},
            {'name': 'Uttapam', 'description': 'Thick rice pancake with vegetable toppings', 'price': 119, 'category': 'south-indian', 'is_veg': True, 'rating': 4.2, 'image': 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400'},
            {'name': 'Vada', 'description': 'Crispy fried lentil donuts with chutney', 'price': 79, 'category': 'south-indian', 'is_veg': True, 'rating': 4.1, 'image': 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400'},
            
            # Beverages
            {'name': 'Mango Lassi', 'description': 'Sweet yogurt drink with fresh mango', 'price': 89, 'category': 'beverages', 'is_veg': True, 'rating': 4.5, 'image': 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400'},
            {'name': 'Masala Chai', 'description': 'Traditional Indian spiced tea', 'price': 49, 'category': 'beverages', 'is_veg': True, 'rating': 4.4, 'image': 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400'},
            {'name': 'Cold Coffee', 'description': 'Chilled coffee with ice cream', 'price': 129, 'category': 'beverages', 'is_veg': True, 'rating': 4.3, 'image': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'},
            {'name': 'Fresh Lime Soda', 'description': 'Refreshing lime with soda water', 'price': 59, 'category': 'beverages', 'is_veg': True, 'rating': 4.2, 'image': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400'},
            
            # Appetizers
            {'name': 'Paneer Tikka', 'description': 'Grilled cottage cheese with spices', 'price': 199, 'category': 'appetizers', 'is_veg': True, 'rating': 4.5, 'image': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400'},
            {'name': 'Chicken Wings', 'description': 'Crispy fried chicken wings with dip', 'price': 249, 'category': 'appetizers', 'is_veg': False, 'rating': 4.6, 'image': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400'},
            {'name': 'Samosa', 'description': 'Crispy pastry with spiced potato filling', 'price': 49, 'category': 'appetizers', 'is_veg': True, 'rating': 4.3, 'image': 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400'},
            {'name': 'Fish Fingers', 'description': 'Crispy fried fish strips with tartar sauce', 'price': 279, 'category': 'appetizers', 'is_veg': False, 'rating': 4.4, 'image': 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400'},
            
            # Salads
            {'name': 'Caesar Salad', 'description': 'Romaine lettuce with caesar dressing and croutons', 'price': 179, 'category': 'salads', 'is_veg': True, 'rating': 4.3, 'image': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'},
            {'name': 'Greek Salad', 'description': 'Fresh vegetables with feta cheese and olives', 'price': 169, 'category': 'salads', 'is_veg': True, 'rating': 4.4, 'image': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'},
            {'name': 'Chicken Salad', 'description': 'Grilled chicken with mixed greens', 'price': 219, 'category': 'salads', 'is_veg': False, 'rating': 4.5, 'image': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'},
        ]
        
        for item_data in menu_items_data:
            category_slug = item_data.pop('category')
            category = categories.get(category_slug)
            
            item, created = MenuItem.objects.update_or_create(
                name=item_data['name'],
                defaults={
                    **item_data,
                    'category': category
                }
            )
            if created:
                self.stdout.write(f'  Created menu item: {item.name}')
            else:
                self.stdout.write(f'  Updated menu item: {item.name}')
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully seeded {Category.objects.count()} categories and {MenuItem.objects.count()} menu items!'))
