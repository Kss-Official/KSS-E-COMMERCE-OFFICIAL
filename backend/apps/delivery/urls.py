from django.urls import path
from .views import (
    DeliveryDashboardView,
    DeliveryTaskListView,
    DeliveryTaskUpdateView,
    AdvanceDeliveryStageView,
    VerifyDeliveryOTPView,
    AgentEarningsView,
    DeliveryHistoryView,
    DeliveryNotificationsView,
    DeliveryAgentProfileView,
    DeliverySupportView,
)

urlpatterns = [
    path('dashboard/', DeliveryDashboardView.as_view(), name='delivery_dashboard'),
    path('tasks/', DeliveryTaskListView.as_view(), name='delivery_tasks'),
    path('tasks/<str:task_id>/advance-stage/', AdvanceDeliveryStageView.as_view(), name='delivery_advance_stage'),
    path('tasks/<str:task_id>/verify-otp/', VerifyDeliveryOTPView.as_view(), name='delivery_verify_otp'),
    path('tasks/<str:task_id>/', DeliveryTaskUpdateView.as_view(), name='delivery_task_update'),
    path('earnings/', AgentEarningsView.as_view(), name='delivery_earnings'),
    path('history/', DeliveryHistoryView.as_view(), name='delivery_history'),
    path('notifications/', DeliveryNotificationsView.as_view(), name='delivery_notifications'),
    path('profile/', DeliveryAgentProfileView.as_view(), name='delivery_profile'),
    path('support/', DeliverySupportView.as_view(), name='delivery_support'),
]
