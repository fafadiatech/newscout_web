from django.contrib.auth.backends import ModelBackend
from .models import BaseUserProfile


class EmailModelBackend(ModelBackend):
    """
    This is a ModelBackend that allows authentication with an email address.

    """

    def authenticate(self, username=None, password=None):
        try:

            user = BaseUserProfile.objects.get(email__iexact=username)
            if user.check_password(password):
                return user
        except BaseUserProfile.DoesNotExist:
            return None

    def get_user(self, username):
        try:
            return BaseUserProfile.objects.get(pk=username)
        except BaseUserProfile.DoesNotExist:
            return None

        return None
