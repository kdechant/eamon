from django.conf.urls import url, include
from rest_framework import routers

from .views import LogViewSet, PlayerViewSet, PlayerProfileViewSet, RatingViewSet, SavedGameViewSet

# Note: This file is not currently used. See /adventure/urls.py

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'players', PlayerViewSet)
router.register(r'profiles', PlayerProfileViewSet)
router.register(r'saves', SavedGameViewSet)
router.register(r'ratings', RatingViewSet)
router.register(r'log', LogViewSet)

urlpatterns = [
    # REST API routes
    url(r'^api/player', include(router.urls)),
]
