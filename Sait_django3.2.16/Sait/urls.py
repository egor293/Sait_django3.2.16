from django.contrib import admin
from django.urls import path, include
from Homepage import views as home_views
from Users import views as user_views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_views.index, name='home'),
    path('users/login/', user_views.login_view, name='login'),
    path('users/register/', user_views.register_view, name='register'),

    path('api/me', user_views.api_me),
    path('api/profile', user_views.api_profile),
    path('api/logout', user_views.api_logout),
]
