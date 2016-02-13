from django.shortcuts import render
from django.http import HttpResponse
import json

# Create your views here.

#from .models import RouteSegment, City

# Create your views here.
def index(request):
    return render(request, 'index.html')

def adventure(request, adventure_id):
    return render(request, 'adventure.html', {'adventure_id': adventure_id})
