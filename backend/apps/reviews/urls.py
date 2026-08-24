from django.urls import path
from .views import ProductReviewsView

urlpatterns = [
    path('product/<str:slug>/', ProductReviewsView.as_view(), name='product_reviews'),
]
