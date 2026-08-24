from django.urls import path
from .views import (
    CartView,
    AddCartItemView,
    UpdateCartItemView,
    RemoveCartItemView,
    MergeCartView,
    WishlistView,
    RemoveWishlistItemView,
    MoveWishlistToCartView
)

urlpatterns = [
    # Cart
    path('', CartView.as_view(), name='cart_detail'),
    path('items/', AddCartItemView.as_view(), name='cart_add_item'),
    path('items/<int:item_id>/', UpdateCartItemView.as_view(), name='cart_update_item'),
    path('items/<int:item_id>/remove/', RemoveCartItemView.as_view(), name='cart_remove_item'),
    path('merge/', MergeCartView.as_view(), name='cart_merge'),

    # Wishlist
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:product_id>/', RemoveWishlistItemView.as_view(), name='wishlist_item_detail'),
    path('wishlist/<int:product_id>/remove/', RemoveWishlistItemView.as_view(), name='wishlist_remove'),
    path('wishlist/items/<int:product_id>/', RemoveWishlistItemView.as_view(), name='wishlist_item_delete'),
    path('wishlist/<int:product_id>/move-to-cart/', MoveWishlistToCartView.as_view(), name='wishlist_move_to_cart'),
    path('wishlist/move-to-cart/<int:product_id>/', MoveWishlistToCartView.as_view(), name='wishlist_move_to_cart_alt'),
]
