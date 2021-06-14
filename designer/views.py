from django.shortcuts import render


def designer(request):
    """
    The container for the "designer" react app
    """
    return render(request, 'designer.html')
