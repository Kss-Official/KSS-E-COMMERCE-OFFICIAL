from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from core.response import APIResponse
from .models import InAppNotification
from .serializers import InAppNotificationSerializer

class NotificationListView(generics.ListAPIView):
    serializer_class = InAppNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return InAppNotification.objects.filter(user=self.request.user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        unread_count = queryset.filter(is_read=False).count()
        return APIResponse.success(
            data={"notifications": serializer.data, "unread_count": unread_count},
            message="Notifications retrieved."
        )

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notif = InAppNotification.objects.get(id=pk, user=request.user)
            notif.is_read = True
            notif.save(update_fields=['is_read'])
            return APIResponse.success(message="Notification marked as read.")
        except InAppNotification.DoesNotExist:
            return APIResponse.error(message="Notification not found.", status_code=status.HTTP_404_NOT_FOUND)

class MarkAllNotificationsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        InAppNotification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return APIResponse.success(message="All notifications marked as read.")
