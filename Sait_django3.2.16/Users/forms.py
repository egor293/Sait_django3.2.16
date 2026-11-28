from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser

class RegisterForm(UserCreationForm):
    name = forms.CharField(min_length=2, max_length=24, label='Никнейм')
    email = forms.EmailField(label='Электронная почта')

    class Meta:
        model = CustomUser
        fields = ('name', 'email')

class LoginForm(AuthenticationForm):
    username = forms.EmailField(label='Электронная почта')

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ('name', 'avatar', 'language', 'bio', 'header_blur')
