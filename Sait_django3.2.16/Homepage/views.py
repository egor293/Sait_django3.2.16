from django.shortcuts import render
from Users.forms import ProfileUpdateForm

def index(request):
    profile_form = ProfileUpdateForm(instance=request.user) if request.user.is_authenticated else None
    return render(request, 'index.html', {'profile_form': profile_form})
