from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from django.db.models import Q, Count

from . import serializers
from adventure.models import Adventure, Author, Room, Artifact, Effect, Monster, Hint


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    For listing or retrieving authors.
    """
    queryset = Author.objects.filter()
    serializer_class = serializers.AuthorSerializer

    def get_queryset(self):
        queryset = self.queryset
        return queryset


class AdventureViewSet(viewsets.ModelViewSet):
    """
    For listing or retrieving adventure data.
    """
    queryset = Adventure.objects.all()
    serializer_class = serializers.AdventureSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Adventure.objects.all()
        return queryset


class RoomViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists room data for an adventure.
    """
    queryset = Room.objects.all()
    serializer_class = serializers.RoomSerializer

    def get_queryset(self):
        adventure_id = self.kwargs['adventure_id']
        return self.queryset.filter(adventure__slug=adventure_id)


class ArtifactViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists artifact data for an adventure.
    """
    queryset = Artifact.objects.order_by('artifact_id')
    serializer_class = serializers.ArtifactSerializer

    def get_queryset(self):
        adventure_id = self.kwargs['adventure_id']
        return self.queryset.filter(adventure__slug=adventure_id)


class EffectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists effect data for an adventure.
    """
    queryset = Effect.objects.all()
    serializer_class = serializers.EffectSerializer

    def get_queryset(self):
        adventure_id = self.kwargs['adventure_id']
        return self.queryset.filter(adventure__slug=adventure_id)


class MonsterViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists monster data for an adventure.
    """
    queryset = Monster.objects.all().order_by('monster_id')
    serializer_class = serializers.MonsterSerializer

    def get_queryset(self):
        adventure_id = self.kwargs['adventure_id']
        return self.queryset.filter(adventure__slug=adventure_id)


class HintViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists hints for an adventure.
    """
    queryset = Hint.objects.all()
    serializer_class = serializers.HintSerializer

    def get_queryset(self):
        adventure_id = self.kwargs['adventure_id']
        return self.queryset.filter(Q(adventure__slug=adventure_id) | Q(question="EAMON GENERAL HELP.", edx="E001")).order_by('index')

