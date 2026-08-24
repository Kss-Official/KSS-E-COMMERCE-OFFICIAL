from django.utils import timezone
from decimal import Decimal
from rest_framework import status, generics
from rest_framework.views import APIView

from core.response import APIResponse
from core.permissions import IsDeliveryAgent
from apps.orders.models import Order
from .models import DeliveryTask, AgentEarnings
from .serializers import (
    DeliveryTaskSerializer,
    AdvanceDeliveryStageSerializer,
    VerifyDeliveryOTPSerializer,
    AgentEarningsSerializer
)

class DeliveryDashboardView(APIView):
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        user = request.user
        tasks = DeliveryTask.objects.filter(agent=user)

        active_tasks = tasks.filter(status='IN_TRANSIT').count()
        completed_today = tasks.filter(status='DELIVERED', delivered_at__date=timezone.now().date()).count()
        total_completed = tasks.filter(status='DELIVERED').count()

        earnings = AgentEarnings.objects.filter(agent=user)
        total_earnings = sum(e.total_earned for e in earnings)
        today_earnings = sum(e.total_earned for e in earnings.filter(earned_at__date=timezone.now().date()))

        data = {
            "agent_name": user.profile.full_name,
            "agent_phone": user.phone,
            "rating": 4.8,
            "is_online": True,
            "active_deliveries": active_tasks,
            "completed_today": completed_today,
            "total_completed": total_completed,
            "today_earnings": float(today_earnings),
            "total_earnings": float(total_earnings)
        }
        return APIResponse.success(data=data, message="Delivery dashboard metrics retrieved.")

class DeliveryTaskListView(generics.ListAPIView):
    serializer_class = DeliveryTaskSerializer
    permission_classes = [IsDeliveryAgent]

    def get_queryset(self):
        qs = DeliveryTask.objects.filter(agent=self.request.user).select_related('order')
        status_param = self.request.query_params.get('status')
        if status_param == 'active':
            qs = qs.filter(status='IN_TRANSIT')
        elif status_param == 'completed':
            qs = qs.filter(status='DELIVERED')
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Delivery tasks retrieved.")

class AdvanceDeliveryStageView(APIView):
    permission_classes = [IsDeliveryAgent]

    def post(self, request, task_id):
        if str(task_id).isdigit():
            task = DeliveryTask.objects.filter(agent=request.user, id=int(task_id)).select_related('order').first()
        else:
            task = DeliveryTask.objects.filter(agent=request.user, task_id=task_id).select_related('order').first()

        if not task:
            return APIResponse.error(message="Delivery task not found.", status_code=status.HTTP_404_NOT_FOUND)

        if task.current_stage < 3:
            task.current_stage += 1
            task.save(update_fields=['current_stage'])

            # Update Order Tracking Milestones
            if task.current_stage == 2:
                task.order.status = 'OUT_FOR_DELIVERY'
                task.order.save(update_fields=['status'])
                task.order.milestones.filter(step_title__in=['Order Placed', 'Confirmed', 'Shipped', 'Out for Delivery']).update(is_completed=True)
            elif task.current_stage == 3:
                task.order.milestones.filter(step_title='Out for Delivery').update(is_active=True)

        return APIResponse.success(
            data=DeliveryTaskSerializer(task).data,
            message=f"Advanced to stage: {task.get_current_stage_display()}."
        )

class VerifyDeliveryOTPView(APIView):
    permission_classes = [IsDeliveryAgent]

    def post(self, request, task_id):
        serializer = VerifyDeliveryOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid OTP payload.", errors=serializer.errors)

        if str(task_id).isdigit():
            task = DeliveryTask.objects.filter(agent=request.user, id=int(task_id)).select_related('order').first()
        else:
            task = DeliveryTask.objects.filter(agent=request.user, task_id=task_id).select_related('order').first()

        if not task:
            return APIResponse.error(message="Delivery task not found.", status_code=status.HTTP_404_NOT_FOUND)

        entered_otp = serializer.validated_data['otp'].strip()
        # Verify against Order OTP (or default demo master OTP '1234')
        if entered_otp != task.order.delivery_otp and entered_otp != '1234':
            return APIResponse.error(message="Invalid 4-digit verification OTP.")

        # Complete Task
        task.current_stage = 4
        task.status = 'DELIVERED'
        task.is_cod_collected = True
        task.delivered_at = timezone.now()
        task.save()

        # Complete Order
        order = task.order
        order.status = 'DELIVERED'
        order.payment_status = 'PAID'
        order.save(update_fields=['status', 'payment_status'])
        order.milestones.all().update(is_completed=True)

        # Credit Agent Earnings
        AgentEarnings.objects.create(
            agent=request.user,
            order=order,
            base_fee=Decimal('50.00'),
            tip=Decimal('0.00'),
            incentive=Decimal('15.00'),
            total_earned=Decimal('65.00')
        )

        return APIResponse.success(
            data=DeliveryTaskSerializer(task).data,
            message="Delivery verified and completed successfully!"
        )

class AgentEarningsView(generics.ListAPIView):
    serializer_class = AgentEarningsSerializer
    permission_classes = [IsDeliveryAgent]

    def get_queryset(self):
        return AgentEarnings.objects.filter(agent=self.request.user).order_by('-earned_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        total = sum(e.total_earned for e in queryset)
        return APIResponse.success(
            data={"earnings": serializer.data, "total_earned": float(total)},
            message="Earnings history retrieved."
        )
