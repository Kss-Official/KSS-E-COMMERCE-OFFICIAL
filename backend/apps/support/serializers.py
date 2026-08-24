from rest_framework import serializers
from .models import ContactMessage, FAQ

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'display_order']
