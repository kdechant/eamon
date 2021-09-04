from django.shortcuts import render

from .models import Adventure


def index(request, path=''):
    """
    The home page
    """
    return render(request, 'index.html')


def about(request):
    """
    The "about" page
    """
    return render(request, 'about.html')


def privacy_policy(request):
    """
    The "privacy policy" page
    """
    return render(request, 'privacy.html')


def main_hall(request):
    """
    The container for the "main hall" react app
    """
    return render(request, 'main-hall.html')


def adventure(request, slug):
    """
    The container for the "core" a.k.a. "adventure" angular app
    """
    return render(request, 'adventure.html', {'slug': slug})


def adventure_list(request):
    adventures = Adventure.objects.filter(active=True).order_by('name')
    return render(request, 'adventure-list.html', {'adventures': adventures})


def manual(request):
    return render(request, 'manual.html')
