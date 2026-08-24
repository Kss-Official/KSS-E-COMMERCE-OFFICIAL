from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HeroBannerView,
    CategoryListView,
    BrandListView,
    ProductListView,
    ProductDetailView,
    DealsListView,
    DealsSummaryView,
    GlobalSearchView,
    SearchSuggestionsView,
    AdminCategoryViewSet,
    AdminProductViewSet,
)

admin_router = DefaultRouter()
admin_router.register('categories', AdminCategoryViewSet, basename='admin_category')
admin_router.register('products', AdminProductViewSet, basename='admin_product')

urlpatterns = [
    # Banners & Deals
    path('banners/hero/', HeroBannerView.as_view(), name='hero_banner'),
    path('deals/', DealsListView.as_view(), name='deals_list'),
    path('deals/summary/', DealsSummaryView.as_view(), name='deals_summary'),

    # Public Storefront Catalog
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('brands/', BrandListView.as_view(), name='brand_list'),
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<str:slug>/', ProductDetailView.as_view(), name='product_detail'),
    path('search/', GlobalSearchView.as_view(), name='product_search'),
    path('search/suggestions/', SearchSuggestionsView.as_view(), name='search_suggestions'),

    # Admin Catalog CRUD
    path('admin/', include(admin_router.urls)),
]
