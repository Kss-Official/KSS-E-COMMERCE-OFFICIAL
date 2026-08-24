from django.urls import path
from .views import (
    DeliveryDashboardView,
    DeliveryTaskListView,
    AdvanceDeliveryStageView,
    VerifyDeliveryOTPView,
    AgentEarningsView
)

urlpatterns = [
    path('dashboard/', DeliveryDashboardView.as_view(), name='delivery_dashboard'),
    path('tasks/', DeliveryTaskListView.as_view(), name='delivery_tasks'),
    path('tasks/<str:task_id>/advance-stage/', AdvanceDeliveryStageView.as_view(), name='delivery_advance_stage'),
    path('tasks/<str:task_id>/verify-otp/', VerifyDeliveryOTPView.as_view(), name='delivery_verify_otp'),
    path('earnings/', AgentEarningsView.as_view(), name='delivery_earnings'),
]
