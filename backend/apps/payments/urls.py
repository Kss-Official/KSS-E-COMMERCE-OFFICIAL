from django.urls import path
from .views import CreatePaymentSessionView, VerifyPaymentView, RefundPaymentView

urlpatterns = [
    path('create-session/', CreatePaymentSessionView.as_view(), name='payment_create_session'),
    path('verify/', VerifyPaymentView.as_view(), name='payment_verify'),
    path('refund/', RefundPaymentView.as_view(), name='payment_refund'),
]
