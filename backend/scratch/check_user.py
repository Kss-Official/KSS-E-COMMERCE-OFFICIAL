import os, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from apps.accounts.models import User, Profile

email = 'akash015@gmail.com'
password = 'qwertyuiop'

try:
    user = User.objects.get(email=email)
    pwd_match = user.check_password(password)
    profile = getattr(user, 'profile', None)
    name = f"{profile.first_name} {profile.last_name}" if profile else "No profile"
    print(f"EXISTS: True")
    print(f"User ID: {user.id}")
    print(f"Email: {user.email}")
    print(f"Phone: {user.phone}")
    print(f"Role: {user.role}")
    print(f"Name: {name}")
    print(f"Password Matches '{password}': {pwd_match}")
except User.DoesNotExist:
    print(f"EXISTS: False")
