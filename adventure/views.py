from rest_framework import viewsets, filters, permissions, mixins, generics
import django_filters
from django.shortcuts import render
from django.http import HttpResponse
import json

from . import serializers
from .models import Adventure, Room, RoomExit, Artifact, Effect, Monster


def index(request):
    return render(request, 'index.html')


def adventure(request, adventure_id):
    return render(request, 'adventure.html', {'adventure_id': adventure_id})


class AdventureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    For listing or retrieving adventure data.
    """
    queryset = Adventure.objects.all()
    serializer_class = serializers.AdventureSerializer

    def get_queryset(self):
        queryset = self.queryset
        return queryset


class RoomViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists room data for an adventure.
    """
    queryset = Room.objects.all()
    serializer_class = serializers.RoomSerializer

    def get_queryset(self):
        adventure_id = self.kwargs['adventure_id']
        return self.queryset.filter(adventure__id=adventure_id)


class ArtifactViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists artifact data for an adventure.
    """
    queryset = Artifact.objects.all()
    serializer_class = serializers.ArtifactSerializer

    def get_queryset(self):
        adventure_id = self.kwargs['adventure_id']
        return self.queryset.filter(adventure__id=adventure_id)


class EffectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists effect data for an adventure.
    """
    queryset = Effect.objects.all()
    serializer_class = serializers.EffectSerializer

    def get_queryset(self):
        adventure_id = self.kwargs['adventure_id']
        return self.queryset.filter(adventure__id=adventure_id)


class MonsterViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists monster data for an adventure.
    """
    queryset = Monster.objects.all()
    serializer_class = serializers.MonsterSerializer

    def get_queryset(self):
        adventure_id = self.kwargs['adventure_id']
        return self.queryset.filter(adventure__id=adventure_id)
