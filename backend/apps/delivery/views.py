from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.views import APIView

from core.response import APIResponse
from core.permissions import IsDeliveryAgent
from apps.accounts.models import Profile
from apps.orders.models import Order
from apps.support.models import ContactMessage
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
        if not self.request:
            return qs
        query_params = getattr(self.request, 'query_params', self.request.GET)
        status_param = query_params.get('status')
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


# --------------------------------------------------------------------- helpers

def _resolve_task(agent, task_id):
    """Look a task up by numeric pk or by its TASK-xxxxx business id."""
    qs = DeliveryTask.objects.filter(agent=agent).select_related('order')
    if str(task_id).isdigit():
        return qs.filter(id=int(task_id)).first()
    return qs.filter(task_id=task_id).first()


def _sync_order_from_task(task):
    """Push a task's stage back onto the order and its tracking milestones."""
    order = task.order
    mapping = {
        'ASSIGNED': 'SHIPPED',
        'PICKED_UP': 'SHIPPED',
        'IN_TRANSIT': 'OUT_FOR_DELIVERY',
        'DELIVERED': 'DELIVERED',
        'FAILED': 'SHIPPED',
    }
    target = mapping.get(task.status)
    if target and order.status != target:
        order.status = target
        fields = ['status']
        if target == 'DELIVERED' and order.payment_status != 'PAID':
            order.payment_status = 'PAID'
            fields.append('payment_status')
        order.save(update_fields=fields)

    reached = {'SHIPPED': 2, 'OUT_FOR_DELIVERY': 3, 'DELIVERED': 4}.get(order.status)
    if reached is None:
        return
    for milestone in order.milestones.all():
        milestone.is_completed = milestone.order_index < reached or reached == 4
        milestone.is_active = milestone.order_index == reached and reached != 4
        milestone.save(update_fields=['is_completed', 'is_active'])


def _agent_tickets(agent):
    """Rider tickets are ContactMessage rows tagged with the [Rider] prefix."""
    qs = ContactMessage.objects.filter(subject__startswith='[Rider]')
    if agent.email:
        qs = qs.filter(email__iexact=agent.email)
    return qs.order_by('-created_at')[:20]


def _ticket_payload(ticket):
    return {
        'id': ticket.id,
        'ticket_number': f'TKT-{ticket.id:05d}',
        'subject': ticket.subject.replace('[Rider] ', '', 1),
        'message': ticket.message,
        'status': 'Resolved' if ticket.is_resolved else 'Open',
        'created_at': ticket.created_at.isoformat(),
        'formatted_date': ticket.created_at.strftime('%d %b, %I:%M %p'),
    }

class DeliveryTaskUpdateView(APIView):
    """
    ``PATCH /api/delivery/tasks/<task_id>/`` - the endpoint
    ``updateDeliveryTaskStatusApi`` in the frontend has always called.

    Accepts a free-form ``status`` and/or ``current_stage`` and keeps the parent
    order, its tracking milestones and COD collection in step.
    """
    permission_classes = [IsDeliveryAgent]

    STATUS_TO_ORDER = {
        'ASSIGNED': 'SHIPPED',
        'PICKED_UP': 'SHIPPED',
        'IN_TRANSIT': 'OUT_FOR_DELIVERY',
        'DELIVERED': 'DELIVERED',
        'FAILED': 'SHIPPED',
    }
    STATUS_TO_STAGE = {
        'ASSIGNED': 1,
        'PICKED_UP': 1,
        'IN_TRANSIT': 2,
        'DELIVERED': 4,
        'FAILED': 5,
    }

    def patch(self, request, task_id):
        task = _resolve_task(request.user, task_id)
        if not task:
            return APIResponse.error(message="Delivery task not found.", status_code=status.HTTP_404_NOT_FOUND)

        new_status = (request.data.get('status') or '').upper().replace(' ', '_').strip()
        updates = []

        if new_status:
            if new_status not in self.STATUS_TO_STAGE:
                return APIResponse.error(
                    message=f"Unsupported status '{new_status}'.",
                    errors={'status': list(self.STATUS_TO_STAGE.keys())},
                )
            task.status = new_status
            task.current_stage = self.STATUS_TO_STAGE[new_status]
            updates += ['status', 'current_stage']

        raw_stage = request.data.get('current_stage', request.data.get('stage'))
        if raw_stage is not None:
            try:
                stage = int(raw_stage)
            except (TypeError, ValueError):
                return APIResponse.error(message="'current_stage' must be a number between 1 and 5.")
            if not 1 <= stage <= 5:
                return APIResponse.error(message="'current_stage' must be between 1 and 5.")
            task.current_stage = stage
            if 'current_stage' not in updates:
                updates.append('current_stage')

        if 'notes' in request.data:
            task.notes = request.data.get('notes') or ''
            updates.append('notes')

        if 'is_cod_collected' in request.data:
            task.is_cod_collected = bool(request.data.get('is_cod_collected'))
            updates.append('is_cod_collected')

        if task.status == 'DELIVERED' and not task.delivered_at:
            task.delivered_at = timezone.now()
            updates.append('delivered_at')

        if not updates:
            return APIResponse.error(message="Nothing to update. Send status, current_stage, notes or is_cod_collected.")

        task.save(update_fields=list(dict.fromkeys(updates)))
        _sync_order_from_task(task)

        return APIResponse.success(
            data=DeliveryTaskSerializer(task).data,
            message=f"Task {task.task_id} updated to {task.status}.",
        )


class DeliveryHistoryView(APIView):
    """Completed and failed deliveries for the signed-in agent."""
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        tasks = (DeliveryTask.objects
                 .filter(agent=request.user, status__in=['DELIVERED', 'FAILED'])
                 .select_related('order')
                 .order_by('-delivered_at', '-created_at'))

        try:
            days = max(1, min(365, int(request.query_params.get('days', 90))))
        except (TypeError, ValueError):
            days = 90
        since = timezone.now() - timedelta(days=days)
        tasks = tasks.filter(created_at__gte=since)

        earnings_by_order = {
            row['order_id']: float(row['total'])
            for row in (AgentEarnings.objects.filter(agent=request.user)
                        .values('order_id').annotate(total=Sum('total_earned')))
        }

        rows = []
        for task in tasks:
            data = DeliveryTaskSerializer(task).data
            data['earned'] = earnings_by_order.get(task.order_id, 0.0)
            data['order_total'] = float(task.order.total_amount)
            data['completed_on'] = (task.delivered_at or task.created_at).strftime('%d %b %Y, %I:%M %p')
            rows.append(data)

        delivered = [r for r in rows if r['status'] == 'DELIVERED']
        return APIResponse.success(
            data={
                'history': rows,
                'summary': {
                    'period_days': days,
                    'total_deliveries': len(rows),
                    'successful': len(delivered),
                    'failed': len(rows) - len(delivered),
                    'success_rate': round(len(delivered) / len(rows) * 100, 1) if rows else 0.0,
                    'total_earned': round(sum(r['earned'] for r in rows), 2),
                    'cod_collected': round(
                        sum(float(r['cod_amount']) for r in rows if r['is_cod_collected']), 2
                    ),
                },
            },
            message="Delivery history retrieved.",
        )


class DeliveryNotificationsView(APIView):
    """
    Agent notification feed, derived from live task state rather than stored rows
    so it can never drift from what the Tasks tab shows.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        tasks = (DeliveryTask.objects.filter(agent=request.user)
                 .select_related('order').order_by('-created_at')[:25])

        notifications = []
        for task in tasks:
            if task.status == 'ASSIGNED':
                kind, title = 'assignment', 'New delivery assigned'
                body = f'{task.order.order_number} for {task.recipient_name} is ready for pickup.'
            elif task.status == 'IN_TRANSIT':
                kind, title = 'in_transit', 'Delivery in progress'
                body = f'{task.order.order_number} is out for delivery to {task.recipient_name}.'
            elif task.status == 'DELIVERED':
                kind, title = 'delivered', 'Delivery completed'
                body = f'{task.order.order_number} was delivered successfully. Well done!'
            else:
                kind, title = 'failed', 'Delivery needs attention'
                body = f'{task.order.order_number} could not be delivered. Reschedule with the customer.'

            if task.cod_amount and not task.is_cod_collected and task.status != 'DELIVERED':
                body += f' Collect Rs.{task.cod_amount} in cash on delivery.'

            when = task.delivered_at or task.created_at
            notifications.append({
                'id': f'task-{task.id}',
                'type': kind,
                'title': title,
                'message': body,
                'task_id': task.task_id,
                'order_number': task.order.order_number,
                'is_read': task.status in ('DELIVERED', 'FAILED'),
                'timestamp': when.isoformat(),
                'formatted_date': when.strftime('%d %b, %I:%M %p'),
            })

        return APIResponse.success(
            data={
                'notifications': notifications,
                'unread_count': sum(1 for n in notifications if not n['is_read']),
            },
            message="Notifications retrieved.",
        )


class DeliveryAgentProfileView(APIView):
    """Read and update the agent's own profile from the Delivery portal."""
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        return APIResponse.success(data=self._payload(request.user), message="Agent profile retrieved.")

    def put(self, request):
        return self._update(request)

    def patch(self, request):
        return self._update(request)

    def _update(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        full_name = request.data.get('full_name') or request.data.get('name')
        if full_name and not (first_name or last_name):
            parts = str(full_name).strip().split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''

        dirty = []
        if first_name is not None:
            profile.first_name = first_name
            dirty.append('first_name')
        if last_name is not None:
            profile.last_name = last_name
            dirty.append('last_name')
        if 'bio' in request.data:
            profile.bio = request.data.get('bio') or ''
            dirty.append('bio')
        if dirty:
            profile.save(update_fields=dirty)

        phone = request.data.get('phone')
        if phone:
            digits = ''.join(filter(str.isdigit, str(phone)))[-10:]
            if len(digits) != 10:
                return APIResponse.error(message="Mobile number must be 10 digits.")
            clash = type(user).objects.filter(phone=digits).exclude(pk=user.pk).exists()
            if clash:
                return APIResponse.error(message="That mobile number is already registered.")
            user.phone = digits
            user.save(update_fields=['phone'])

        return APIResponse.success(data=self._payload(user), message="Profile updated successfully.")

    @staticmethod
    def _payload(user):
        profile = getattr(user, 'profile', None)
        tasks = DeliveryTask.objects.filter(agent=user)
        delivered = tasks.filter(status='DELIVERED').count()
        total = tasks.count()
        earnings = AgentEarnings.objects.filter(agent=user).aggregate(total=Sum('total_earned'))
        first_task = tasks.order_by('created_at').first()
        return {
            'id': user.id,
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
            'first_name': profile.first_name if profile else '',
            'last_name': profile.last_name if profile else '',
            'full_name': profile.full_name if profile else (user.email or ''),
            'bio': profile.bio if profile else '',
            'avatar': profile.avatar.url if profile and profile.avatar else None,
            'agent_code': f'AGT-{user.id:04d}',
            'vehicle': 'Two Wheeler - Assigned by hub',
            'assigned_hub': 'WH01 - Central Hub',
            'is_verified': user.is_verified,
            'joined_on': user.date_joined.strftime('%d %b %Y'),
            'stats': {
                'total_tasks': total,
                'delivered': delivered,
                'in_transit': tasks.filter(status='IN_TRANSIT').count(),
                'failed': tasks.filter(status='FAILED').count(),
                'success_rate': round(delivered / total * 100, 1) if total else 0.0,
                'lifetime_earnings': float(earnings['total'] or 0),
                'active_since': first_task.created_at.strftime('%d %b %Y') if first_task else None,
            },
        }


class DeliverySupportView(APIView):
    """Support contacts, FAQs and ticket creation for the Delivery portal."""
    permission_classes = [IsDeliveryAgent]

    CONTACTS = [
        {'label': 'Hub Supervisor', 'name': 'WH01 Control Room', 'phone': '1800 266 2996',
         'availability': 'Mon-Sun, 6:00 AM - 11:00 PM'},
        {'label': 'Rider Helpdesk', 'name': 'BuyZo Rider Support', 'phone': '1800 266 1010',
         'availability': '24x7'},
        {'label': 'Emergency / Accident', 'name': 'Safety Desk', 'phone': '112',
         'availability': '24x7'},
    ]
    FAQS = [
        {'question': 'The customer is not available at the address. What should I do?',
         'answer': 'Call the customer from the task screen. If there is no response after two '
                   'attempts, mark the task as Failed with a note - it is auto-rescheduled for '
                   'the next delivery slot.'},
        {'question': 'The customer wants to pay by UPI instead of cash for a COD order.',
         'answer': 'Ask them to pay to the QR code on your rider ID card, then mark COD as '
                   'collected. The amount reconciles against your wallet the same evening.'},
        {'question': 'The OTP the customer received is not working.',
         'answer': 'Ask them to re-open the order in their BuyZo account - the OTP is shown on '
                   'the order detail page. If it still fails, call the Rider Helpdesk.'},
        {'question': 'When are earnings credited?',
         'answer': 'Base fee and incentives are credited the moment a delivery is verified. '
                   'Payouts are settled to your bank account every Monday.'},
        {'question': 'A parcel is damaged before delivery.',
         'answer': 'Do not hand it over. Mark the task as Failed, add a note describing the '
                   'damage, and return the parcel to the hub returns counter.'},
    ]

    def get(self, request):
        tickets = [_ticket_payload(t) for t in _agent_tickets(request.user)]
        return APIResponse.success(
            data={
                'contacts': self.CONTACTS,
                'faqs': self.FAQS,
                'tickets': tickets,
                'open_tickets': sum(1 for t in tickets if t['status'] == 'Open'),
            },
            message="Support information retrieved.",
        )

    def post(self, request):
        subject = (request.data.get('subject') or '').strip()
        body = (request.data.get('message') or request.data.get('description') or '').strip()
        if not subject or not body:
            return APIResponse.error(
                message="Both a subject and a message are required.",
                errors={'subject': 'This field is required.', 'message': 'This field is required.'},
            )

        profile = getattr(request.user, 'profile', None)
        ticket = ContactMessage.objects.create(
            name=(profile.full_name if profile else (request.user.email or 'Delivery Agent')),
            email=request.user.email or '',
            phone=request.user.phone or '',
            subject=f'[Rider] {subject}'[:200],
            message=body,
        )
        return APIResponse.success(
            data=_ticket_payload(ticket),
            message="Support ticket raised. The rider helpdesk will call you shortly.",
            status_code=status.HTTP_201_CREATED,
        )
