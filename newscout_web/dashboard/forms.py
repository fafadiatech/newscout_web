from django import forms
from django.forms.utils import ErrorList
from django.contrib.auth import authenticate


class DivErrorList(ErrorList):
    """
    custom class for form errors
    """
    def __str__(self):
        return self.as_divs()

    def as_divs(self):
        if not self:
            return ''
        return '<div>%s</div>' % ''.join(['<div class="text-danger">%s</div>' % e for e in self])


class LoginForm(forms.Form):
    """
    Login Form
    """
    email = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)
        self.error_class = DivErrorList

    def clean(self):
        cleaned_data = super(LoginForm, self).clean()

        email = cleaned_data.get('email')
        password = cleaned_data.get('password')

        if not (email or password):
            msg = "Email and Password Is Required"
            self._errors["password"] = self.error_class([msg])
            del self._errors["email"]
            return self.cleaned_data

        if not password:
            msg = "Password Is Required"
            self._errors["password"] = self.error_class([msg])
            return self.cleaned_data

        if not email:
            msg = "Email Is Required"
            self._errors["email"] = self.error_class([msg])
            return self.cleaned_data

        user = authenticate(request=None, username=email, password=password)
        if user is None:
            msg = "Email or Password Is Incorrect"
            self._errors["password"] = self.error_class([msg])
            return self.cleaned_data

        return self.cleaned_data
