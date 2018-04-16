from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import SavedGame
from . import serializers


class SavedGameViewSet(viewsets.ModelViewSet):
    """
    API endpoints for saved games. This is read/write.
    """
    serializer_class = serializers.SavedGameListSerializer
    queryset = SavedGame.objects.all()
    permission_classes = (AllowAny,)

    def retrieve(self, request, *args, **kwargs):
        self.serializer_class = serializers.SavedGameDetailSerializer
        return super(SavedGameViewSet, self).retrieve(request, *args, **kwargs)
