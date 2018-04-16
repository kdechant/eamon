from django.conf.urls import url, include
from rest_framework import routers

from . import views

from .views import SavedGameViewSet

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'saves', SavedGameViewSet)

urlpatterns = [
    # REST API routes
    url(r'^api/player', include(router.urls)),
]
