import uuid
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from core.response import APIResponse
from apps.catalog.models import Product, ProductVariant
from .models import Cart, CartItem, Wishlist, WishlistItem
from .serializers import CartSerializer, WishlistSerializer

def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart
    
    session_key = request.headers.get('X-Session-ID') or request.session.session_key
    if not session_key:
        if not request.session.exists(request.session.session_key):
            request.session.create()
        session_key = request.session.session_key or str(uuid.uuid4())

    cart, _ = Cart.objects.get_or_create(session_key=session_key)
    return cart

def resolve_product(product_id, product_name=None, price=None):
    if not product_id and not product_name:
        return None

    product = None

    # 1. Match by exact title first if product_name is provided
    if product_name:
        product = Product.objects.filter(title__iexact=product_name, is_active=True).first()

    # 2. Match by title containing product_name
    if not product and product_name:
        product = Product.objects.filter(title__icontains=product_name, is_active=True).first()

    # 3. Match by integer ID (if digit) and verify title consistency
    if not product and str(product_id).isdigit():
        candidate = Product.objects.filter(id=int(product_id), is_active=True).first()
        if candidate:
            if not product_name:
                product = candidate
            else:
                c_title = candidate.title.lower()
                p_name = product_name.lower()
                if c_title in p_name or p_name in c_title or any(w in c_title for w in p_name.split() if len(w) > 3):
                    product = candidate

    # 4. Match by exact slug
    if not product and isinstance(product_id, str):
        product = Product.objects.filter(slug=product_id, is_active=True).first()

    # 5. Match by cleaned product_id (e.g. 'apple-iphone-15')
    if not product and isinstance(product_id, str):
        cleaned = product_id.replace('-', ' ').replace('_', ' ').strip()
        if cleaned:
            product = Product.objects.filter(title__icontains=cleaned, is_active=True).first()

    # 6. Match by significant word tokens (e.g. "iPhone" from "Apple iPhone 15")
    if not product and product_name:
        words = [w for w in product_name.split() if len(w) > 2]
        for word in words:
            candidate = Product.objects.filter(title__icontains=word, is_active=True).first()
            if candidate:
                product = candidate
                break

    # 7. Fallback to candidate by ID if still no match and product_id is digit
    if not product and str(product_id).isdigit():
        product = Product.objects.filter(id=int(product_id), is_active=True).first()

    # 8. Auto-create product if missing in DB to preserve exact item title and price
    if not product and (product_name or product_id):
        name_to_use = str(product_name or product_id).replace('-', ' ').replace('_', ' ').title().strip()
        sku_val = f"AUTO-{uuid.uuid4().hex[:8].upper()}"
        try:
            unit_price = float(price) if price else 999.00
        except (ValueError, TypeError):
            unit_price = 999.00

        product = Product.objects.create(
            title=name_to_use,
            base_price=unit_price,
            stock_quantity=100,
            sku=sku_val,
            description=f"Catalog product entry for {name_to_use}",
            is_active=True
        )

    return product

class CartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Cart retrieved successfully.")

    def delete(self, request):
        cart = get_or_create_cart(request)
        CartItem.objects.filter(cart=cart).delete()
        serializer = CartSerializer(cart, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Cart cleared successfully.")

class AddCartItemView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        raw_product_id = request.data.get('product_id') or request.data.get('id')
        product_name = request.data.get('name') or request.data.get('title')
        price = request.data.get('price') or request.data.get('current_price') or request.data.get('base_price')
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))
        selected_color = request.data.get('selected_color') or request.data.get('selectedColor') or ''
        selected_size = request.data.get('selected_size') or request.data.get('selectedSize') or ''

        product = resolve_product(raw_product_id, product_name, price)
        if not product:
            return APIResponse.error(message="Product not found or inactive.", status_code=status.HTTP_404_NOT_FOUND)

        variant = None
        if variant_id:
            try:
                variant = ProductVariant.objects.get(id=variant_id, product=product)
            except ProductVariant.DoesNotExist:
                pass

        # Stock check
        available_stock = variant.stock_quantity if variant else product.stock_quantity
        if available_stock < quantity:
            return APIResponse.error(message=f"Only {available_stock} units available in stock.")

        cart = get_or_create_cart(request)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            selected_color=selected_color,
            selected_size=selected_size,
            defaults={'quantity': quantity}
        )

        if not created:
            new_qty = cart_item.quantity + quantity
            if new_qty > available_stock:
                return APIResponse.error(message=f"Cannot add more. Total in cart would exceed available stock ({available_stock}).")
            cart_item.quantity = new_qty
            cart_item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Item added to cart.", status_code=status.HTTP_201_CREATED)

class UpdateCartItemView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, item_id):
        quantity = int(request.data.get('quantity', 1))
        cart = get_or_create_cart(request)

        cart_item = None
        if str(item_id).isdigit():
            cart_item = cart.items.filter(id=int(item_id)).first()
            if not cart_item:
                cart_item = cart.items.filter(product_id=int(item_id)).first()
        else:
            cart_item = cart.items.filter(product__slug=item_id).first()

        if not cart_item:
            return APIResponse.error(message="Cart item not found.", status_code=status.HTTP_404_NOT_FOUND)

        if quantity <= 0:
            cart_item.delete()
            serializer = CartSerializer(cart, context={'request': request})
            return APIResponse.success(data=serializer.data, message="Item removed from cart.")

        available_stock = cart_item.variant.stock_quantity if cart_item.variant else cart_item.product.stock_quantity
        if quantity > available_stock:
            return APIResponse.error(message=f"Only {available_stock} units available in stock.")

        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Cart item updated.")

    def delete(self, request, item_id):
        return RemoveCartItemView().delete(request, item_id)

class RemoveCartItemView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, item_id):
        cart = get_or_create_cart(request)
        if str(item_id).isdigit():
            cart.items.filter(id=int(item_id)).delete()
            cart.items.filter(product_id=int(item_id)).delete()
        else:
            cart.items.filter(product__slug=item_id).delete()
            cart.items.filter(product__title__icontains=item_id).delete()

        serializer = CartSerializer(cart, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Item removed from cart.")

class MergeCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        guest_session_id = request.data.get('session_id') or request.headers.get('X-Session-ID')
        if not guest_session_id:
            return APIResponse.error(message="session_id is required.")

        try:
            guest_cart = Cart.objects.get(session_key=guest_session_id)
            user_cart, _ = Cart.objects.get_or_create(user=request.user)

            for item in guest_cart.items.all():
                existing = user_cart.items.filter(
                    product=item.product,
                    variant=item.variant,
                    selected_color=item.selected_color,
                    selected_size=item.selected_size
                ).first()

                if existing:
                    existing.quantity += item.quantity
                    existing.save()
                else:
                    item.cart = user_cart
                    item.save()

            guest_cart.delete()
            serializer = CartSerializer(user_cart, context={'request': request})
            return APIResponse.success(data=serializer.data, message="Guest cart merged successfully.")
        except Cart.DoesNotExist:
            user_cart, _ = Cart.objects.get_or_create(user=request.user)
            serializer = CartSerializer(user_cart, context={'request': request})
            return APIResponse.success(data=serializer.data, message="Cart loaded.")

# ----------------- WISHLIST -----------------
class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Wishlist retrieved.")

    def post(self, request):
        raw_product_id = request.data.get('product_id') or request.data.get('id')
        product_name = request.data.get('name') or request.data.get('title')
        price = request.data.get('price') or request.data.get('current_price') or request.data.get('base_price')

        product = resolve_product(raw_product_id, product_name, price)
        if not product:
            return APIResponse.error(message="Product not found.", status_code=status.HTTP_404_NOT_FOUND)

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)

        serializer = WishlistSerializer(wishlist, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Item added to wishlist.")

class RemoveWishlistItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        if str(product_id).isdigit():
            WishlistItem.objects.filter(wishlist=wishlist, product_id=int(product_id)).delete()
            WishlistItem.objects.filter(wishlist=wishlist, id=int(product_id)).delete()
        else:
            WishlistItem.objects.filter(wishlist=wishlist, product__slug=product_id).delete()
            WishlistItem.objects.filter(wishlist=wishlist, product__title__icontains=product_id).delete()

        serializer = WishlistSerializer(wishlist, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Item removed from wishlist.")

class MoveWishlistToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        item = None
        if str(product_id).isdigit():
            item = WishlistItem.objects.filter(wishlist=wishlist, id=int(product_id)).first()
            if not item:
                item = WishlistItem.objects.filter(wishlist=wishlist, product_id=int(product_id)).first()
        else:
            item = WishlistItem.objects.filter(wishlist=wishlist, product__slug=product_id).first()

        if not item:
            return APIResponse.error(message="Item not found in wishlist.", status_code=status.HTTP_404_NOT_FOUND)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=item.product, defaults={'quantity': 1})
        if not created:
            cart_item.quantity += 1
            cart_item.save()

        item.delete()
        serializer = CartSerializer(cart, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Item moved to cart successfully.")
