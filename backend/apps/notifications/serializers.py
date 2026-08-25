from rest_framework import serializers
from .models import InAppNotification

class InAppNotificationSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = InAppNotification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'link', 'formatted_date', 'created_at']

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%d %b, %I:%M %p')
