from django.conf.urls import url, include
from rest_framework import routers

from .views import RatingViewSet, SavedGameViewSet

# Note: This file is not currently used. See /adventure/urls.py

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'saves', SavedGameViewSet)
router.register(r'ratings', RatingViewSet)

urlpatterns = [
    # REST API routes
    url(r'^api/player', include(router.urls)),
]
