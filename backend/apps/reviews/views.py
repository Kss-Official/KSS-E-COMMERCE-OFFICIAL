from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from core.response import APIResponse
from apps.catalog.models import Product
from apps.orders.models import OrderItem
from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer

class ProductReviewsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, slug):
        product = Product.objects.filter(slug=slug).first() if slug else None
        if not product and slug and str(slug).isdigit():
            product = Product.objects.filter(id=int(slug)).first()

        if not product:
            return APIResponse.error(message="Product not found.", status_code=status.HTTP_404_NOT_FOUND)

        reviews = product.reviews.all().select_related('user', 'user__profile')
        serializer = ReviewSerializer(reviews, many=True)

        rating_breakdown = {str(i): reviews.filter(rating=i).count() for i in range(1, 6)}

        data = {
            "average_rating": float(product.average_rating),
            "review_count": product.review_count,
            "rating_breakdown": rating_breakdown,
            "reviews": serializer.data
        }
        return APIResponse.success(data=data, message="Product reviews retrieved.")

    def post(self, request, slug):
        product = Product.objects.filter(slug=slug).first() if slug else None
        if not product and slug and str(slug).isdigit():
            product = Product.objects.filter(id=int(slug)).first()

        if not product:
            return APIResponse.error(message="Product not found.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = CreateReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid review data.", errors=serializer.errors)

        user = request.user
        # Check verified purchase
        is_verified = OrderItem.objects.filter(order__customer=user, product=product, order__status='DELIVERED').exists()

        review, created = Review.objects.update_or_create(
            product=product,
            user=user,
            defaults={
                'rating': serializer.validated_data['rating'],
                'title': serializer.validated_data.get('title', ''),
                'comment': serializer.validated_data['comment'],
                'is_verified_purchase': is_verified
            }
        )

        return APIResponse.success(
            data=ReviewSerializer(review).data,
            message="Review submitted successfully!",
            status_code=status.HTTP_201_CREATED
        )
