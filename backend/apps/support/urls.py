from django.urls import path
from .views import ContactMessageView, FAQListView

urlpatterns = [
    path('contact/', ContactMessageView.as_view(), name='support_contact'),
    path('faqs/', FAQListView.as_view(), name='support_faqs'),
]
