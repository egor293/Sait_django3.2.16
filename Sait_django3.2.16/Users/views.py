import json
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.views.decorators.http import require_POST, require_http_methods
from .forms import RegisterForm, LoginForm


def register_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    form = RegisterForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.save()
        login(request, user)
        return redirect('home')
    return render(request, 'MoiSait2.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    form = LoginForm(request, data=request.POST or None)
    if request.method == 'POST' and form.is_valid():
        login(request, form.get_user())
        return redirect('home')
    return render(request, 'VHOD.html', {'form': form})


def api_me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'message': 'Сначала войди в аккаунт.'}, status=401)
    return JsonResponse({'user': request.user.to_public_dict()})


@require_http_methods(["PUT", "POST"])
def api_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({'message': 'Сначала войди в аккаунт.'}, status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Некорректные данные.'}, status=400)

    name = str(data.get('name', '')).strip()
    if not (2 <= len(name) <= 24):
        return JsonResponse({'message': 'Никнейм должен быть длиной от 2 до 24 символов.'}, status=400)

    blur = data.get('headerBlur', 12)
    if not isinstance(blur, int) or not (0 <= blur <= 24):
        return JsonResponse({'message': 'Размытие должно быть от 0 до 24.'}, status=400)

    avatar = data.get('avatar')
    if avatar is not None and len(avatar) > 1500000:
        return JsonResponse({'message': 'Слишком большой файл аватарки.'}, status=400)

    user = request.user
    user.name = name
    user.bio = str(data.get('bio', '')).strip()[:160]
    user.language = 'en' if data.get('language') == 'en' else 'ru'
    user.header_blur = blur
    if avatar is not None:
        user.avatar = avatar
    user.save()

    return JsonResponse({'user': user.to_public_dict()})


@require_POST
def api_logout(request):
    logout(request)
    return JsonResponse({'ok': True})
