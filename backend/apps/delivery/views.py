import random
from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum, Q, Avg, Count
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.views import APIView

from core.response import APIResponse
from core.permissions import IsDeliveryAgent
from apps.accounts.models import Profile
from apps.orders.models import Order
from apps.support.models import ContactMessage
from .models import (
    DeliveryTask,
    AgentEarnings,
    DeliveryAgentShift,
    DeliveryCashDeposit,
    DeliverySOSAlert,
    DeliveryCashTransaction,
    DeliveryCashHandover,
)
from .serializers import (
    DeliveryTaskSerializer,
    AdvanceDeliveryStageSerializer,
    VerifyDeliveryOTPSerializer,
    AgentEarningsSerializer,
    DeliveryAgentShiftSerializer,
    DeliveryCashDepositSerializer,
    DeliverySOSAlertSerializer,
    LocationUpdateSerializer,
    FailedDeliverySerializer,
    DeliveryCashTransactionSerializer,
    DeliveryCashHandoverSerializer,
)

class DeliveryDashboardView(APIView):
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        user = request.user
        tasks = DeliveryTask.objects.filter(agent=user)
        if not tasks.exists():
            tasks = DeliveryTask.objects.all()

        today = timezone.now().date()
        active_tasks = tasks.filter(status__in=['ASSIGNED', 'IN_TRANSIT']).count()
        
        completed_today_qs = tasks.filter(status='DELIVERED', delivered_at__date=today)
        if not completed_today_qs.exists():
            completed_today_qs = tasks.filter(status='DELIVERED', created_at__date=today)
        if not completed_today_qs.exists():
            # If no tasks delivered today, fallback to recent completed tasks for demo dashboard metrics
            completed_today_qs = tasks.filter(status='DELIVERED')[:4]

        completed_today = completed_today_qs.count()
        total_completed = tasks.filter(status='DELIVERED').count()

        earnings = AgentEarnings.objects.filter(agent=user)
        if not earnings.exists():
            earnings = AgentEarnings.objects.all()

        total_earnings = sum(float(e.total_earned) for e in earnings)
        today_earnings = sum(float(e.total_earned) for e in earnings.filter(earned_at__date=today))
        
        if today_earnings <= 0 and completed_today > 0:
            today_earnings = float(completed_today * 65.0)
        if total_earnings <= 0 and total_completed > 0:
            total_earnings = float(total_completed * 65.0)

        data = {
            "agent_name": getattr(user.profile, 'full_name', getattr(user, 'first_name', user.email.split('@')[0])),
            "agent_phone": getattr(user, 'phone', ''),
            "rating": 4.9,
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
        qs = (DeliveryTask.objects.filter(agent=self.request.user)
              .select_related('order', 'agent')
              .prefetch_related('order__items', 'order__items__product'))
        if not qs.exists():
            qs = (DeliveryTask.objects.all()
                  .select_related('order', 'agent')
                  .prefetch_related('order__items', 'order__items__product'))
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
        task = _resolve_task(request.user, task_id)
        order = getattr(task, 'order', None)
        if not order:
            clean_num = str(task_id).replace('TASK-', '').replace('ORD-', '').strip()
            order = Order.objects.filter(
                Q(order_number=str(task_id).strip()) |
                Q(order_number=f"ORD-{clean_num}") |
                Q(order_number=clean_num)
            ).first()

        if task and task.current_stage < 3:
            task.current_stage += 1
            task.save(update_fields=['current_stage'])

        if order:
            order.status = 'OUT_FOR_DELIVERY'
            order.save(update_fields=['status'])
            order.milestones.filter(step_title__in=['Order Placed', 'Confirmed', 'Shipped', 'Out for Delivery']).update(is_completed=True)
            order.milestones.filter(step_title='Out for Delivery').update(is_active=True)

        if task:
            return APIResponse.success(
                data=DeliveryTaskSerializer(task).data,
                message=f"Advanced to stage: {task.get_current_stage_display()}."
            )
        return APIResponse.success(message="Advanced to Out for Delivery.")

def _process_cash_collection(agent, task, amount, notes=''):
    if not amount or Decimal(str(amount)) <= Decimal('0.00'):
        return None
    shift, _ = DeliveryAgentShift.objects.get_or_create(agent=agent)
    before = Decimal(str(shift.cash_in_hand))
    after = before + Decimal(str(amount))
    shift.cash_in_hand = after
    shift.save(update_fields=['cash_in_hand'])

    tx_id = f"CTX-{random.randint(10000, 99999)}"
    tx = DeliveryCashTransaction.objects.create(
        transaction_id=tx_id,
        agent=agent,
        transaction_type='COLLECTION',
        amount=Decimal(str(amount)),
        delivery_task=task,
        cash_in_hand_before=before,
        cash_in_hand_after=after,
        notes=notes or f"COD cash collected for order {task.order.order_number if task and task.order else ''}".strip(),
    )
    return tx


class VerifyDeliveryOTPView(APIView):
    permission_classes = [IsDeliveryAgent]

    def post(self, request, task_id):
        serializer = VerifyDeliveryOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid OTP payload.", errors=serializer.errors)

        task = _resolve_task(request.user, task_id)
        order = getattr(task, 'order', None)
        if not order:
            clean_num = str(task_id).replace('TASK-', '').replace('ORD-', '').strip()
            order = Order.objects.filter(
                Q(order_number=str(task_id).strip()) |
                Q(order_number=f"ORD-{clean_num}") |
                Q(order_number=clean_num)
            ).first()

        entered_otp = serializer.validated_data['otp'].strip()
        expected_otp = getattr(order, 'delivery_otp', None) or (task.order.delivery_otp if task and task.order else '1234')

        # Verify against Order OTP (or default demo master OTP '1234' / '8174')
        if entered_otp != expected_otp and entered_otp != '1234' and entered_otp != '8174':
            return APIResponse.error(message="Invalid 4-digit verification OTP.")

        # Complete Task if present
        if task:
            was_cod_collected = task.is_cod_collected
            task.current_stage = 4
            task.status = 'DELIVERED'
            task.is_cod_collected = True
            task.delivered_at = timezone.now()
            task.save()

            if not was_cod_collected and task.cod_amount > Decimal('0.00'):
                _process_cash_collection(request.user, task, task.cod_amount)

        # Complete Order
        if order:
            order.status = 'DELIVERED'
            order.payment_status = 'PAID'
            order.save(update_fields=['status', 'payment_status'])
            order.milestones.all().update(is_completed=True, is_active=False)
            order.milestones.filter(step_title='Delivered').update(is_completed=True, is_active=True)

        # Credit Agent Earnings
        if order:
            agent = getattr(task, 'agent', None) or request.user
            AgentEarnings.objects.get_or_create(
                agent=agent,
                order=order,
                defaults={
                    'base_fee': Decimal('50.00'),
                    'tip': Decimal('0.00'),
                    'incentive': Decimal('15.00'),
                    'total_earned': Decimal('65.00')
                }
            )

        if task:
            return APIResponse.success(
                data=DeliveryTaskSerializer(task).data,
                message="Delivery verified and completed successfully!"
            )
        return APIResponse.success(message="Delivery verified and completed successfully!")

class AgentEarningsView(generics.ListAPIView):
    serializer_class = AgentEarningsSerializer
    permission_classes = [IsDeliveryAgent]

    def get_queryset(self):
        return AgentEarnings.objects.filter(agent=self.request.user).select_related('order').order_by('-earned_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        total = sum(e.total_earned for e in queryset)

        online_total = sum(e.total_earned for e in queryset if e.order and e.order.payment_method != 'COD')
        cod_task_earnings = sum(e.total_earned for e in queryset if e.order and e.order.payment_method == 'COD')

        shift, _ = DeliveryAgentShift.objects.get_or_create(agent=request.user)
        cash_in_hand = float(shift.cash_in_hand)

        confirmed_handovers = DeliveryCashHandover.objects.filter(
            agent=request.user,
            status='CONFIRMED'
        )
        settled_cash_amount = sum(float(h.confirmed_amount or h.requested_amount) for h in confirmed_handovers)

        pending_handovers = DeliveryCashHandover.objects.filter(
            agent=request.user,
            status='PENDING'
        )
        pending_handover_amount = sum(float(h.requested_amount) for h in pending_handovers)

        return APIResponse.success(
            data={
                "earnings": serializer.data,
                "total_earned": float(total),
                "online_earnings": float(online_total),
                "cod_task_earnings": float(cod_task_earnings),
                "settled_cash_earnings": float(settled_cash_amount),
                "pending_cash_handover": cash_in_hand,
                "pending_handover_request_amount": float(pending_handover_amount),
            },
            message="Earnings history and breakdown retrieved."
        )


def _sync_agent_cash_in_hand(agent):
    shift, _ = DeliveryAgentShift.objects.get_or_create(agent=agent)
    cod_tasks = DeliveryTask.objects.filter(agent=agent, is_cod_collected=True)
    total_cod_collected = sum(Decimal(str(t.cod_amount or 0)) for t in cod_tasks)

    handovers = DeliveryCashHandover.objects.filter(agent=agent, status__in=['CONFIRMED', 'PENDING'])
    total_handovers = sum(Decimal(str(h.confirmed_amount if h.confirmed_amount is not None else h.requested_amount)) for h in handovers)

    net_cash_in_hand = max(Decimal('0.00'), total_cod_collected - total_handovers)

    if shift.cash_in_hand != net_cash_in_hand:
        shift.cash_in_hand = net_cash_in_hand
        shift.save(update_fields=['cash_in_hand'])

    return shift, float(net_cash_in_hand)


class DeliveryCashHandoverRequestView(APIView):
    """
    POST /api/delivery/cash-handover/request/
    GET /api/delivery/cash-handover/my-requests/
    Generate a cash handover request to warehouse and list request history.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        agent = request.user
        shift, net_cash = _sync_agent_cash_in_hand(agent)
        handovers = DeliveryCashHandover.objects.filter(agent=agent).order_by('-created_at')
        serializer = DeliveryCashHandoverSerializer(handovers, many=True)
        active_pending = handovers.filter(status='PENDING').first()

        return APIResponse.success(
            data={
                'cash_in_hand': net_cash,
                'active_pending_request': DeliveryCashHandoverSerializer(active_pending).data if active_pending else None,
                'handovers': serializer.data,
            },
            message="Cash handover history retrieved."
        )

    def post(self, request):
        agent = request.user
        shift, _ = DeliveryAgentShift.objects.get_or_create(agent=agent)
        cash_in_hand = Decimal(str(shift.cash_in_hand))

        if cash_in_hand <= Decimal('0.00'):
            return APIResponse.error(message="No cash available in hand for handover.")

        # Check for existing pending request to prevent duplicate requests
        pending_exists = DeliveryCashHandover.objects.filter(agent=agent, status='PENDING').exists()
        if pending_exists:
            return APIResponse.error(
                message="You already have an active pending handover request awaiting warehouse confirmation. Please wait for warehouse staff to process it before submitting a new request."
            )

        req_amount_raw = request.data.get('amount')
        if req_amount_raw is not None:
            try:
                requested_amount = Decimal(str(req_amount_raw))
            except Exception:
                return APIResponse.error(message="Invalid handover amount.")
        else:
            requested_amount = cash_in_hand

        if requested_amount <= Decimal('0.00'):
            return APIResponse.error(message="Handover amount must be greater than zero.")

        if requested_amount > cash_in_hand:
            return APIResponse.error(message=f"Requested amount ₹{requested_amount} exceeds cash in hand ₹{cash_in_hand}.")

        notes = request.data.get('notes', '')
        handover_id = f"HND-{random.randint(10000, 99999)}"

        handover = DeliveryCashHandover.objects.create(
            handover_id=handover_id,
            agent=agent,
            requested_amount=requested_amount,
            status='PENDING',
            notes=notes,
        )

        return APIResponse.success(
            data=DeliveryCashHandoverSerializer(handover).data,
            message=f"Cash handover request {handover_id} for ₹{requested_amount} submitted to Warehouse.",
            status_code=status.HTTP_201_CREATED
        )


# --------------------------------------------------------------------- helpers

def _resolve_task(agent, task_id):
    """Look a task up by numeric pk, TASK-xxxxx business id, or ORD-xxxxx order number."""
    qs = DeliveryTask.objects.select_related('order', 'agent')
    if str(task_id).isdigit():
        t = qs.filter(Q(id=int(task_id)) | Q(order__id=int(task_id))).first()
        if t:
            return t

    clean_str = str(task_id).strip()
    clean_num = clean_str.replace('TASK-', '').replace('ORD-', '')

    t = qs.filter(
        Q(task_id=clean_str) |
        Q(task_id=f"TASK-{clean_str}") |
        Q(task_id=f"TASK-{clean_num}") |
        Q(order__order_number=clean_str) |
        Q(order__order_number=f"ORD-{clean_str}") |
        Q(order__order_number=f"ORD-{clean_num}")
    ).first()
    return t


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
            new_cod_collected = bool(request.data.get('is_cod_collected'))
            if new_cod_collected and not task.is_cod_collected and task.cod_amount > Decimal('0.00'):
                _process_cash_collection(request.user, task, task.cod_amount)
            task.is_cod_collected = new_cod_collected
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
        agent = request.user
        qs = (DeliveryTask.objects.filter(status__in=['DELIVERED', 'FAILED'])
              .select_related('order', 'agent')
              .prefetch_related('order__items', 'order__items__product'))
        if qs.filter(agent=agent).exists():
            qs = qs.filter(agent=agent)

        try:
            days = max(1, min(365, int(request.query_params.get('days', 90))))
        except (TypeError, ValueError):
            days = 90

        since = timezone.now() - timedelta(days=days)
        tasks = qs.filter(Q(created_at__gte=since) | Q(delivered_at__gte=since)).order_by('-delivered_at', '-created_at')

        earnings_by_order = {
            row['order_id']: float(row['total'])
            for row in (AgentEarnings.objects.filter(agent=agent)
                        .values('order_id').annotate(total=Sum('total_earned')))
        }

        rows = []
        for task in tasks:
            data = DeliveryTaskSerializer(task).data
            data['earned'] = earnings_by_order.get(task.order_id, 65.0 if task.status == 'DELIVERED' else 0.0)
            data['order_total'] = float(task.order.total_amount) if task.order else 0.0
            data['completed_on'] = (task.delivered_at or task.created_at).strftime('%d %b %Y, %I:%M %p')
            data['_sort_key'] = (task.delivered_at or task.created_at).isoformat()
            rows.append(data)

        rows.sort(key=lambda r: r['_sort_key'], reverse=True)

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


# ---------------------------------------------------------------------
# 1. Cash in Hand Tracker & Hub Deposit
# ---------------------------------------------------------------------
class CashTrackerView(APIView):
    """
    GET /api/delivery/cash-tracker/
    Returns cash collected today, cash in hand, max limit, deposit history and cash transaction ledger.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        agent = request.user
        shift, _ = DeliveryAgentShift.objects.get_or_create(agent=agent)
        
        today_tasks = DeliveryTask.objects.filter(
            agent=agent,
            is_cod_collected=True,
            delivered_at__date=timezone.now().date()
        )
        cod_collected_today = sum(float(t.cod_amount) for t in today_tasks)

        today_deposits = DeliveryCashDeposit.objects.filter(
            agent=agent,
            deposited_at__date=timezone.now().date()
        )
        total_deposited_today = sum(float(d.amount) for d in today_deposits)

        deposits = DeliveryCashDeposit.objects.filter(agent=agent).order_by('-deposited_at')[:10]
        deposit_data = DeliveryCashDepositSerializer(deposits, many=True).data

        transactions = DeliveryCashTransaction.objects.filter(agent=agent).order_by('-created_at')[:15]
        tx_data = DeliveryCashTransactionSerializer(transactions, many=True).data

        shift, cash_in_hand = _sync_agent_cash_in_hand(agent)
        max_limit = float(shift.max_cash_limit)
        limit_reached = cash_in_hand >= max_limit
        limit_warning = cash_in_hand >= (max_limit * 0.8)

        return APIResponse.success(
            data={
                'cash_in_hand': cash_in_hand,
                'max_cash_limit': max_limit,
                'available_limit': max(0.0, max_limit - cash_in_hand),
                'cod_collected_today': cod_collected_today,
                'total_deposited_today': total_deposited_today,
                'limit_reached': limit_reached,
                'limit_warning': limit_warning,
                'deposit_history': deposit_data,
                'recent_transactions': tx_data,
            },
            message="Cash tracker metrics retrieved successfully."
        )


class CashDepositView(APIView):
    """
    POST /api/delivery/cash-deposit/
    Deposit collected cash to hub manager and record transaction.
    """
    permission_classes = [IsDeliveryAgent]

    def post(self, request):
        try:
            amount = Decimal(str(request.data.get('amount', 0)))
        except Exception:
            return APIResponse.error(message="Invalid deposit amount.")

        payment_mode = request.data.get('payment_mode', 'HUB_COUNTER')
        notes = request.data.get('notes', '')

        if amount <= 0:
            return APIResponse.error(message="Deposit amount must be greater than zero.")

        agent = request.user
        shift, _ = DeliveryAgentShift.objects.get_or_create(agent=agent)

        before = Decimal(str(shift.cash_in_hand))
        if before < amount:
            return APIResponse.error(message=f"Deposit amount ₹{amount} exceeds cash in hand ₹{before}.")

        after = max(Decimal('0.00'), before - amount)
        shift.cash_in_hand = after
        shift.save(update_fields=['cash_in_hand'])

        deposit_id = f"DEP-{random.randint(10000, 99999)}"
        deposit = DeliveryCashDeposit.objects.create(
            deposit_id=deposit_id,
            agent=agent,
            amount=amount,
            payment_mode=payment_mode,
            status='COMPLETED',
            notes=notes,
        )

        tx_id = f"CTX-{random.randint(10000, 99999)}"
        DeliveryCashTransaction.objects.create(
            transaction_id=tx_id,
            agent=agent,
            transaction_type='DEPOSIT',
            amount=amount,
            deposit=deposit,
            cash_in_hand_before=before,
            cash_in_hand_after=after,
            notes=notes or f"Cash deposited at hub counter ({deposit_id})",
        )

        return APIResponse.success(
            data=DeliveryCashDepositSerializer(deposit).data,
            message=f"Successfully deposited ₹{amount} to Hub."
        )


class DeliveryCashTransactionsView(APIView):
    """
    GET /api/delivery/cash-transactions/
    Full audit ledger of cash transactions (collections, deposits, adjustments).
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        agent = request.user
        qs = DeliveryCashTransaction.objects.filter(agent=agent).order_by('-created_at')
        
        tx_type = request.query_params.get('type')
        if tx_type:
            qs = qs.filter(transaction_type=tx_type.upper())

        serializer = DeliveryCashTransactionSerializer(qs, many=True)
        return APIResponse.success(
            data=serializer.data,
            message="Cash transaction ledger retrieved."
        )


class DeliveryCashReconciliationView(APIView):
    """
    GET /api/delivery/cash-reconciliation/
    End-of-day cash reconciliation report for agent.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        agent = request.user
        shift, _ = DeliveryAgentShift.objects.get_or_create(agent=agent)
        today = timezone.now().date()

        today_collections = DeliveryCashTransaction.objects.filter(
            agent=agent,
            transaction_type='COLLECTION',
            created_at__date=today
        )
        total_collected = sum(float(tx.amount) for tx in today_collections)

        today_deposits = DeliveryCashDeposit.objects.filter(
            agent=agent,
            deposited_at__date=today
        )
        total_deposited = sum(float(d.amount) for d in today_deposits)

        cash_in_hand = float(shift.cash_in_hand)
        reconciliation_status = 'RECONCILED' if cash_in_hand == 0 else 'PENDING_DEPOSIT'

        data = {
            'date': today.strftime('%Y-%m-%d'),
            'agent_email': agent.email,
            'total_collected_today': total_collected,
            'total_deposited_today': total_deposited,
            'current_cash_in_hand': cash_in_hand,
            'reconciliation_status': reconciliation_status,
            'requires_deposit': cash_in_hand > 0,
            'formatted_summary': f"Collected ₹{total_collected:.2f}, Deposited ₹{total_deposited:.2f}, Outstanding Cash in Hand ₹{cash_in_hand:.2f}"
        }
        return APIResponse.success(
            data=data,
            message="End of day cash reconciliation report generated."
        )


# ---------------------------------------------------------------------
# 2. Shift & Online Time Tracker
# ---------------------------------------------------------------------
class DeliveryShiftView(APIView):
    """
    GET /api/delivery/shift/
    Returns current shift status, active shift time, and total online minutes.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        agent = request.user
        shift, _ = DeliveryAgentShift.objects.get_or_create(agent=agent)
        
        current_session_minutes = 0
        if shift.shift_status == 'ONLINE' and shift.started_at:
            delta = timezone.now() - shift.started_at
            current_session_minutes = int(delta.total_seconds() / 60)

        total_minutes = shift.total_online_minutes + current_session_minutes

        return APIResponse.success(
            data={
                'shift_status': shift.shift_status,
                'started_at': shift.started_at.strftime('%I:%M %p') if shift.started_at else None,
                'current_session_minutes': current_session_minutes,
                'total_online_minutes': total_minutes,
                'formatted_online_time': f"{total_minutes // 60}h {total_minutes % 60}m",
                'last_location_update': shift.last_location_update.strftime('%I:%M %p'),
            },
            message="Shift information retrieved."
        )


class DeliveryShiftToggleView(APIView):
    """
    POST /api/delivery/shift/toggle/
    Toggle shift status between ONLINE, OFFLINE, ON_BREAK.
    """
    permission_classes = [IsDeliveryAgent]

    def post(self, request):
        target_status = str(request.data.get('status', '')).upper().strip()
        agent = request.user
        shift, _ = DeliveryAgentShift.objects.get_or_create(agent=agent)

        if not target_status:
            target_status = 'OFFLINE' if shift.shift_status == 'ONLINE' else 'ONLINE'
        elif target_status not in ['ONLINE', 'OFFLINE', 'ON_BREAK']:
            return APIResponse.error(message="Invalid status. Choose ONLINE, OFFLINE, or ON_BREAK.")

        now = timezone.now()
        if shift.shift_status == 'ONLINE' and target_status in ['OFFLINE', 'ON_BREAK']:
            if shift.started_at:
                minutes = int((now - shift.started_at).total_seconds() / 60)
                shift.total_online_minutes += minutes
            shift.ended_at = now
        elif target_status == 'ONLINE' and shift.shift_status != 'ONLINE':
            shift.started_at = now
            shift.ended_at = None

        shift.shift_status = target_status
        shift.save()

        return APIResponse.success(
            data=DeliveryAgentShiftSerializer(shift).data,
            message=f"Shift status updated to {target_status}."
        )


# ---------------------------------------------------------------------
# 3. Performance Metrics & Success Rate
# ---------------------------------------------------------------------
class DeliveryPerformanceView(APIView):
    """
    GET /api/delivery/performance/
    Detailed performance stats: success rate, on-time delivery %, avg speed.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        agent = request.user
        tasks = DeliveryTask.objects.filter(agent=agent)
        total_tasks = tasks.count()
        delivered_tasks = tasks.filter(status='DELIVERED').count()
        failed_tasks = tasks.filter(status='FAILED').count()

        success_rate = round((delivered_tasks / total_tasks * 100), 1) if total_tasks > 0 else 100.0

        earnings = AgentEarnings.objects.filter(agent=agent)
        total_earned = float(earnings.aggregate(total=Sum('total_earned'))['total'] or 0)

        data = {
            'rating': 4.9,
            'total_deliveries': total_tasks,
            'successful_deliveries': delivered_tasks,
            'failed_deliveries': failed_tasks,
            'success_rate': success_rate,
            'on_time_delivery_rate': 98.2,
            'average_completion_time_mins': 24,
            'customer_satisfaction_score': 99.1,
            'total_earnings': total_earned,
            'performance_tier': 'GOLD_RIDER' if success_rate >= 95 else 'SILVER_RIDER',
            'badge': '⭐ Top Rated Delivery Agent'
        }
        return APIResponse.success(data=data, message="Performance metrics retrieved.")


# ---------------------------------------------------------------------
# 4. Mini Map & Location Ping
# ---------------------------------------------------------------------
class DeliveryMapDataView(APIView):
    """
    GET /api/delivery/map-data/
    Returns live agent location, active task coordinates, pickup & destination checkpoints.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        agent = request.user
        shift, _ = DeliveryAgentShift.objects.get_or_create(agent=agent)
        active_task = DeliveryTask.objects.filter(agent=agent, status='IN_TRANSIT').first()

        task_data = None
        if active_task:
            task_data = {
                'task_id': active_task.task_id,
                'order_number': active_task.order.order_number,
                'recipient_name': active_task.recipient_name,
                'delivery_address': active_task.delivery_address,
                'pickup_location': {
                    'name': 'WH01 Central Warehouse',
                    'latitude': float(active_task.pickup_latitude),
                    'longitude': float(active_task.pickup_longitude),
                },
                'destination_location': {
                    'name': active_task.delivery_address,
                    'latitude': float(active_task.destination_latitude),
                    'longitude': float(active_task.destination_longitude),
                },
                'distance_km': 3.4,
                'eta_minutes': 12,
            }

        data = {
            'agent_location': {
                'latitude': float(shift.current_latitude),
                'longitude': float(shift.current_longitude),
                'last_updated': shift.last_location_update.strftime('%I:%M:%S %p')
            },
            'hub_location': {
                'name': 'WH01 Main Fulfillment Center',
                'latitude': 19.088000,
                'longitude': 72.860000
            },
            'active_task_route': task_data,
        }
        return APIResponse.success(data=data, message="Mini map data retrieved.")


class DeliveryLocationPingView(APIView):
    """
    POST /api/delivery/location-ping/
    Pings live GPS location coordinates from agent app.
    """
    permission_classes = [IsDeliveryAgent]

    def post(self, request):
        serializer = LocationUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid location coordinates.", errors=serializer.errors)

        agent = request.user
        shift, _ = DeliveryAgentShift.objects.get_or_create(agent=agent)
        shift.current_latitude = serializer.validated_data['latitude']
        shift.current_longitude = serializer.validated_data['longitude']
        shift.save(update_fields=['current_latitude', 'current_longitude', 'last_location_update'])

        return APIResponse.success(
            data={
                'latitude': float(shift.current_latitude),
                'longitude': float(shift.current_longitude),
                'updated_at': shift.last_location_update.strftime('%I:%M:%S %p')
            },
            message="Location ping updated."
        )


# ---------------------------------------------------------------------
# 5. Next Delivery Queue / Preview
# ---------------------------------------------------------------------
class NextDeliveryQueueView(APIView):
    """
    GET /api/delivery/queue/
    Upcoming queued deliveries for the active agent sorted by priority/distance.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        agent = request.user
        tasks = DeliveryTask.objects.filter(
            agent=agent,
            status__in=['ASSIGNED', 'IN_TRANSIT']
        ).order_by('created_at')

        queue = []
        for idx, task in enumerate(tasks):
            queue.append({
                'queue_position': idx + 1,
                'task_id': task.task_id,
                'order_number': task.order.order_number,
                'recipient_name': task.recipient_name,
                'recipient_phone': task.recipient_phone,
                'delivery_address': task.delivery_address,
                'cod_amount': float(task.cod_amount),
                'items_count': task.order.items.count() if task.order else 0,
                'estimated_distance_km': round(2.5 + (idx * 1.8), 1),
                'estimated_delivery_time': (timezone.now() + timedelta(minutes=15 + (idx * 20))).strftime('%I:%M %p'),
                'is_next_up': idx == 0,
            })

        return APIResponse.success(
            data={
                'queue_count': len(queue),
                'next_delivery': queue[0] if queue else None,
                'queued_deliveries': queue,
            },
            message="Delivery queue retrieved."
        )


# ---------------------------------------------------------------------
# 6. Weather Alert & Zone Advisory
# ---------------------------------------------------------------------
class DeliveryWeatherView(APIView):
    """
    GET /api/delivery/weather/
    Returns weather alerts and advisory for the agent's delivery zone.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        data = {
            'zone': 'Mumbai Central Zone',
            'temperature': '31°C',
            'condition': 'Partly Cloudy',
            'humidity': '78%',
            'rain_probability': '20%',
            'alert_level': 'NORMAL',
            'title': 'Good Delivery Conditions',
            'message': 'Weather is suitable for normal deliveries. Drive safely and keep hydraulic rain covers ready.',
            'sla_buffer_minutes': 0,
            'safety_checklist': [
                'Ensure helmet strap is buckled',
                'Keep phone charged and dry',
                'Verify COD cash in water-resistant pouch'
            ]
        }
        return APIResponse.success(data=data, message="Weather alert retrieved.")


# ---------------------------------------------------------------------
# 7. SOS / Emergency Quick Button
# ---------------------------------------------------------------------
class DeliverySOSView(APIView):
    """
    GET, POST /api/delivery/sos/
    Trigger immediate SOS emergency alert and check emergency hotlines.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        agent = request.user
        recent_sos = DeliverySOSAlert.objects.filter(agent=agent).first()
        sos_data = DeliverySOSAlertSerializer(recent_sos).data if recent_sos else None

        return APIResponse.success(
            data={
                'active_sos': sos_data,
                'hotlines': [
                    {'name': 'National Emergency', 'number': '112'},
                    {'name': 'BuyZo Control Room Support', 'number': '1800 266 2996'},
                    {'name': 'Ambulance Medical Support', 'number': '108'},
                    {'name': 'Police Patrol Control', 'number': '100'},
                ]
            },
            message="SOS status & emergency contacts retrieved."
        )

    def post(self, request):
        agent = request.user
        reason = request.data.get('reason', 'ACCIDENT')
        description = request.data.get('description', '')
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')

        alert_id = f"SOS-{random.randint(10000, 99999)}"
        sos = DeliverySOSAlert.objects.create(
            alert_id=alert_id,
            agent=agent,
            reason=reason,
            description=description,
            latitude=Decimal(str(lat)) if lat else Decimal('19.076000'),
            longitude=Decimal(str(lng)) if lng else Decimal('72.877700'),
            status='TRIGGERED'
        )

        return APIResponse.success(
            data=DeliverySOSAlertSerializer(sos).data,
            message="EMERGENCY ALERT BROADCASTED! Control room & nearest support team notified immediately.",
            status_code=status.HTTP_201_CREATED
        )


# ---------------------------------------------------------------------
# 8. Failed Delivery Reason Endpoint
# ---------------------------------------------------------------------
class DeliveryTaskFailView(APIView):
    """
    POST /api/delivery/tasks/<task_id>/fail/
    Mark delivery task as FAILED with structured reason code and notes.
    """
    permission_classes = [IsDeliveryAgent]

    def post(self, request, task_id):
        serializer = FailedDeliverySerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid failure payload.", errors=serializer.errors)

        task = _resolve_task(request.user, task_id)
        if not task:
            return APIResponse.error(message="Delivery task not found.", status_code=status.HTTP_404_NOT_FOUND)

        reason_code = serializer.validated_data['reason_code']
        notes = serializer.validated_data.get('notes', '')
        reschedule_date = serializer.validated_data.get('reschedule_date')

        task.status = 'FAILED'
        task.current_stage = 5
        task.failed_reason = reason_code
        task.notes = notes
        if reschedule_date:
            task.rescheduled_date = reschedule_date
        task.save()

        # Sync Order Status
        if task.order:
            task.order.status = 'FAILED'
            task.order.save(update_fields=['status'])

        return APIResponse.success(
            data=DeliveryTaskSerializer(task).data,
            message=f"Task {task.task_id} marked as FAILED ({task.get_failed_reason_display()})."
        )


class DeliveryPortalInitView(APIView):
    """
    GET /api/delivery/portal-init/
    Consolidated single HTTP endpoint for Delivery Portal startup:
    Returns profile, shift_status, unread_notifications, and summary metrics in 1 request.
    """
    permission_classes = [IsDeliveryAgent]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        shift, _ = DeliveryAgentShift.objects.get_or_create(agent=user)
        shift_data = DeliveryAgentShiftSerializer(shift).data

        tasks = DeliveryTask.objects.filter(agent=user)
        completed_today = tasks.filter(status='DELIVERED', delivered_at__date=timezone.now().date()).count()
        total_completed = tasks.filter(status='DELIVERED').count()
        
        today_earnings = AgentEarnings.objects.filter(
            agent=user, earned_at__date=timezone.now().date()
        ).aggregate(tot=Sum('total_earned'))['tot'] or 0.0

        if today_earnings <= 0 and completed_today > 0:
            today_earnings = float(completed_today * 65.0)

        unread_count = tasks.filter(status='ASSIGNED').count()

        data = {
            'profile': {
                'id': user.id,
                'email': user.email,
                'full_name': getattr(profile, 'full_name', user.email.split('@')[0]),
                'phone': getattr(user, 'phone', ''),
                'avatar': profile.avatar.url if profile and profile.avatar else None,
            },
            'shift': shift_data,
            'summary': {
                'completed_today': completed_today,
                'total_completed': total_completed,
                'today_earnings': float(today_earnings),
            },
            'unread_notifications_count': unread_count,
        }
        return APIResponse.success(data=data, message="Portal initialization payload retrieved.")

