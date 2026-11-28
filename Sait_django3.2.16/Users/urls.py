from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from .forms import LoginForm

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', auth_views.LoginView.as_view(
        template_name='Users/login.html',
        authentication_form=LoginForm,
        redirect_authenticated_user=True
        ), name='login'),
    
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('profile/update/', views.update_profile, name='update_profile'),
]
