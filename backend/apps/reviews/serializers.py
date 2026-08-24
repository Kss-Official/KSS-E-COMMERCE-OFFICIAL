from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'title', 'comment', 'is_verified_purchase', 'formatted_date', 'created_at']
        read_only_fields = ['id', 'is_verified_purchase', 'created_at']

    def get_user_name(self, obj):
        return obj.user.profile.full_name or obj.user.email.split('@')[0]

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%d %b %Y')

class CreateReviewSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5, required=True)
    title = serializers.CharField(max_length=150, required=False, allow_blank=True)
    comment = serializers.CharField(required=True)
