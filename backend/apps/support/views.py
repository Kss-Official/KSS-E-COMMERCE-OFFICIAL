from django.db import connection
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from core.response import APIResponse
from .models import ContactMessage, FAQ
from .serializers import ContactMessageSerializer, FAQSerializer

class ContactMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return APIResponse.success(
                data=serializer.data,
                message="Thank you! Your message has been received. Our team will contact you shortly.",
                status_code=status.HTTP_201_CREATED
            )
        return APIResponse.error(message="Could not submit message.", errors=serializer.errors)

class FAQListView(generics.ListAPIView):
    queryset = FAQ.objects.filter(is_active=True).order_by('display_order')
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="FAQs retrieved successfully.")

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db_status = "healthy"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"

        data = {
            "service": "BuyZo E-Commerce API",
            "status": "UP" if db_status == "healthy" else "DEGRADED",
            "database": db_status,
            "timestamp": timezone.now().isoformat(),
            "version": "1.0.0"
        }
        return APIResponse.success(data=data, message="Service health check.")
