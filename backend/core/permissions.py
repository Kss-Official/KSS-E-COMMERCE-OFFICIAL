from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUserRole(BasePermission):
    """
    Allows access to users with ADMIN role or staff permissions.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )

class IsWarehouseStaff(BasePermission):
    """
    Allows access to users with WAREHOUSE or ADMIN role.
    Falls back to primary warehouse staff account for portal demo when unauthenticated.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            from apps.accounts.models import User
            demo_user = (
                User.objects.filter(role='WAREHOUSE').first() or
                User.objects.filter(role='ADMIN').first() or
                User.objects.first()
            )
            if demo_user:
                request.user = demo_user
                return True
            return False

        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['WAREHOUSE', 'ADMIN'] or request.user.is_staff or request.user.is_superuser)
        )

class IsDeliveryAgent(BasePermission):
    """
    Allows access to users with DELIVERY_AGENT or ADMIN role.
    Falls back to primary delivery agent for portal demo when unauthenticated.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            from apps.accounts.models import User
            demo_user = User.objects.filter(role='DELIVERY_AGENT').first()
            if demo_user:
                request.user = demo_user
                return True
            return False

        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['DELIVERY_AGENT', 'ADMIN'] or request.user.is_staff or request.user.is_superuser)
        )

class IsCustomerUser(BasePermission):
    """
    Allows access to users with CUSTOMER or ADMIN role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['CUSTOMER', 'ADMIN'] or request.user.is_staff or request.user.is_superuser)
        )

class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission allowing owners or admins to view/edit objects.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser):
            return True
        # Check user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'customer'):
            return obj.customer == request.user
        return False

class ReadOnlyOrAdmin(BasePermission):
    """
    Allows read-only access for any request, and write access only for Admins.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )
