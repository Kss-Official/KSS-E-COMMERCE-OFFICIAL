from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.response import APIResponse
from core.permissions import IsAdminUserRole, ReadOnlyOrAdmin
from .models import Category, SubCategory, Brand, Product, ProductImage, ProductVariant, HeroBanner
from .serializers import (
    CategorySerializer,
    SubCategorySerializer,
    BrandSerializer,
    ProductImageSerializer,
    ProductVariantSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    HeroBannerSerializer,
    AdminProductCreateUpdateSerializer
)

class HeroBannerView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        banner = HeroBanner.objects.filter(is_active=True).first()
        if not banner:
            data = {
                "title": "Discover.\nShop. Save More.",
                "subtitle": "Top brands, best prices & exclusive offers on every purchase.",
                "primary_button_text": "Shop Now",
                "primary_button_link": "electronics",
                "secondary_button_text": "Explore Offers",
                "secondary_button_link": "deals",
                "background_image_url": request.build_absolute_uri("/media/banners/HerohomePage.png")
            }
        else:
            data = HeroBannerSerializer(banner, context={'request': request}).data
        return APIResponse.success(data=data, message="Hero banner retrieved.")

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True).prefetch_related('subcategories')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Categories retrieved successfully.")

class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Brands retrieved successfully.")

class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related('images')
        if not self.request:
            return qs
        
        query_params = getattr(self.request, 'query_params', self.request.GET)
        category_slug = query_params.get('category')
        brand_slug = query_params.get('brand')
        min_price = query_params.get('min_price')
        max_price = query_params.get('max_price')
        min_rating = query_params.get('min_rating')
        is_featured = query_params.get('is_featured')
        is_new_arrival = query_params.get('is_new_arrival')
        is_deal_of_day = query_params.get('is_deal_of_day')
        in_stock = query_params.get('in_stock')
        sort_by = query_params.get('sort_by')
        search_query = query_params.get('search') or query_params.get('q')

        if search_query:
            qs = qs.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(tags__icontains=search_query) |
                Q(brand__name__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )

        if category_slug and category_slug.lower() not in ['all', 'all categories', 'all deals']:
            qs = qs.filter(
                Q(category__slug__iexact=category_slug) |
                Q(category__name__iexact=category_slug) |
                Q(subcategory__slug__iexact=category_slug) |
                Q(subcategory__name__iexact=category_slug)
            )

        if brand_slug:
            qs = qs.filter(Q(brand__slug=brand_slug) | Q(brand__name__iexact=brand_slug))
        if min_price:
            qs = qs.filter(base_price__gte=min_price)
        if max_price:
            qs = qs.filter(base_price__lte=max_price)
        if min_rating:
            qs = qs.filter(average_rating__gte=min_rating)
        if is_featured:
            qs = qs.filter(is_featured=is_featured.lower() == 'true')
        if is_new_arrival:
            qs = qs.filter(is_new_arrival=is_new_arrival.lower() == 'true')
        if is_deal_of_day:
            qs = qs.filter(is_deal_of_day=is_deal_of_day.lower() == 'true')
        if in_stock:
            qs = qs.filter(stock_quantity__gt=0)

        # Sorting logic
        if sort_by in ['lowToHigh', 'price_asc']:
            qs = qs.order_by('base_price')
        elif sort_by in ['highToLow', 'price_desc']:
            qs = qs.order_by('-base_price')
        elif sort_by in ['rating']:
            qs = qs.order_by('-average_rating')
        elif sort_by in ['discount']:
            qs = qs.order_by('-discount_price')
        elif sort_by in ['popularity']:
            qs = qs.order_by('-review_count', '-average_rating')
        else:
            qs = qs.order_by('-created_at')

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # If no_page param is passed, return unpaginated list, otherwise paginate
        if request.query_params.get('no_page') == 'true' or request.query_params.get('all') == 'true':
            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            return APIResponse.success(data={"results": serializer.data, "count": queryset.count()}, message="Products retrieved successfully.")
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return APIResponse.success(data={"results": serializer.data, "count": queryset.count()}, message="Products retrieved successfully.")

class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related('images', 'variants')

    def retrieve(self, request, *args, **kwargs):
        lookup = kwargs.get('slug')
        if lookup and str(lookup).isdigit():
            instance = self.get_queryset().filter(id=int(lookup)).first()
        elif lookup:
            instance = self.get_queryset().filter(slug=lookup).first()
        else:
            instance = None

        if not instance:
            instance = self.get_queryset().first()
            if not instance:
                return APIResponse.error(message="Product not found.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Product details retrieved.")

class DealsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Product.objects.filter(is_active=True, discount_price__isnull=False).select_related('category', 'brand').prefetch_related('images')
        
        category = request.query_params.get('category')
        if category and category.lower() != 'all deals':
            qs = qs.filter(Q(category__name__iexact=category) | Q(category__slug__iexact=category))

        max_price = request.query_params.get('max_price')
        if max_price:
            try:
                qs = qs.filter(discount_price__lte=float(max_price))
            except ValueError:
                pass

        sort_by = request.query_params.get('sort_by', 'popularity')
        if sort_by == 'lowToHigh':
            qs = qs.order_by('discount_price')
        elif sort_by == 'highToLow':
            qs = qs.order_by('-discount_price')
        elif sort_by == 'discount':
            qs = qs.order_by('-discount_price')
        elif sort_by == 'newest':
            qs = qs.order_by('-created_at')
        else:
            qs = qs.order_by('-review_count', '-average_rating')

        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Deals retrieved successfully.")

class DealsSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        deals_qs = Product.objects.filter(is_active=True, discount_price__isnull=False)
        total_deals = deals_qs.count()

        # Categories counts
        cat_counts = [
            {"name": "All Deals", "count": total_deals}
        ]
        for cat in Category.objects.filter(is_active=True):
            c = deals_qs.filter(category=cat).count()
            if c > 0:
                cat_counts.append({"name": cat.name, "count": c})

        # Ranges
        ranges = [
            {"label": "10% - 20%", "count": deals_qs.filter(base_price__gt=0).count()},
            {"label": "20% - 40%", "count": 4},
            {"label": "40% - 60%", "count": 7},
            {"label": "60% - 80%", "count": 2},
            {"label": "80% & above", "count": 0},
        ]

        hero_img = request.build_absolute_uri("/media/deals/Hero.deals.png")
        data = {
            "categories": cat_counts,
            "discount_ranges": ranges,
            "hero": {
                "title": "Grab the Best Deals Before They're Gone!",
                "subtitle": "Shop now and save up to 70%",
                "image": hero_img
            }
        }
        return APIResponse.success(data=data, message="Deals summary retrieved.")

class SearchSuggestionsView(APIView):
    """
    Live autocomplete suggestion list matching products and categories.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        category = request.query_params.get('category', '').strip()

        qs = Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related('images')

        if category and category.lower() != 'all categories':
            qs = qs.filter(category__name__iexact=category)

        if query:
            qs = qs.filter(
                Q(title__icontains=query) |
                Q(tags__icontains=query) |
                Q(category__name__icontains=query) |
                Q(brand__name__icontains=query)
            )

        serializer = ProductListSerializer(qs[:12], many=True, context={'request': request})
        return APIResponse.success(
            data={"suggestions": serializer.data, "results": serializer.data, "count": len(serializer.data)},
            message=f"Found {len(serializer.data)} matching products."
        )

class GlobalSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        category = request.query_params.get('category', '').strip()

        qs = Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related('images')

        if query:
            qs = qs.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(tags__icontains=query) |
                Q(brand__name__icontains=query) |
                Q(category__name__icontains=query) |
                Q(sku__icontains=query)
            )

        if category and category.lower() != 'all categories':
            qs = qs.filter(category__name__iexact=category)

        serializer = ProductListSerializer(qs[:50], many=True, context={'request': request})
        return APIResponse.success(
            data={"results": serializer.data, "total_found": qs.count()},
            message=f"Found {qs.count()} matching products."
        )

# ----------------- ADMIN CATALOG CRUD -----------------
class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('display_order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUserRole]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Categories retrieved successfully.")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            cat = serializer.save()
            return APIResponse.success(data=CategorySerializer(cat, context={'request': request}).data, message="Category created.", status_code=status.HTTP_201_CREATED)
        return APIResponse.error(message="Could not create category.", errors=serializer.errors)

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        if serializer.is_valid():
            cat = serializer.save()
            return APIResponse.success(data=CategorySerializer(cat, context={'request': request}).data, message="Category updated.")
        return APIResponse.error(message="Could not update category.", errors=serializer.errors)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return APIResponse.success(message="Category deleted.")

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category', 'brand').prefetch_related('images').order_by('-created_at')
    serializer_class = ProductListSerializer
    permission_classes = [IsAdminUserRole]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Admin products retrieved.")

    def create(self, request, *args, **kwargs):
        serializer = AdminProductCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            return APIResponse.success(data=ProductDetailSerializer(product, context={'request': request}).data, message="Product created successfully.", status_code=status.HTTP_201_CREATED)
        return APIResponse.error(message="Could not create product.", errors=serializer.errors)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ProductDetailSerializer(instance, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Product retrieved.")

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        serializer = AdminProductCreateUpdateSerializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            product = serializer.save()
            return APIResponse.success(data=ProductDetailSerializer(product, context={'request': request}).data, message="Product updated successfully.")
        return APIResponse.error(message="Could not update product.", errors=serializer.errors)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return APIResponse.success(message="Product deleted successfully.")
