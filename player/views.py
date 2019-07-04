from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Rating, SavedGame
from adventure.models import Player
from . import serializers


class SavedGameViewSet(viewsets.ModelViewSet):
    """
    API endpoints for saved games. This is read/write.
    """
    serializer_class = serializers.SavedGameListSerializer
    queryset = SavedGame.objects.all()
    permission_classes = (AllowAny,)

    def get_queryset(self):
        """
        Optionally restricts the returned purchases to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = SavedGame.objects.all()
        player_id = self.request.query_params.get('player_id', None)
        if player_id is not None:
            queryset = queryset.filter(player_id=player_id)
        adv_id = self.request.query_params.get('adventure_id', None)
        if adv_id is not None:
            queryset = queryset.filter(adventure_id=adv_id)
        slug = self.request.query_params.get('slug', None)
        if slug is not None:
            queryset = queryset.filter(adventure__slug=slug)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        self.serializer_class = serializers.SavedGameDetailSerializer
        return super(SavedGameViewSet, self).retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        This is an upsert for saved games. The update() method is never called by the front end.
        """
        data = request.data

        # check UUID
        player = get_object_or_404(Player, pk=data['player_id'])
        if player.uuid != data['uuid']:
            raise PermissionDenied

        # create or update
        saved_game, created = SavedGame.objects.get_or_create(
            player_id=data['player_id'],
            adventure_id=data['adventure_id'],
            slot=data['slot']
        )
        saved_game.description = data['description']
        saved_game.data = data['data']
        saved_game.save()

        serializer = serializers.SavedGameListSerializer(saved_game)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        uuid = self.request.query_params.get('uuid', None)
        if instance.player.uuid != uuid:
            raise PermissionDenied
        return super(SavedGameViewSet, self).destroy(instance)


class RatingViewSet(viewsets.ModelViewSet):
    """
    API endpoints for ratings. This is read/write.
    """
    serializer_class = serializers.RatingSerializer
    queryset = Rating.objects.all()
    permission_classes = (AllowAny,)

    def get_queryset(self):
        """
        Optionally restricts the returned purchases to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = Rating.objects.all()
        uuid = self.request.query_params.get('uuid', None)
        if uuid is not None:
            queryset = queryset.filter(uuid=uuid)
        adv_id = self.request.query_params.get('adventure_id', None)
        if adv_id is not None:
            queryset = queryset.filter(adventure_id=adv_id)
        slug = self.request.query_params.get('slug', None)
        if slug is not None:
            queryset = queryset.filter(adventure__slug=slug)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        self.serializer_class = serializers.RatingSerializer
        return super(RatingViewSet, self).retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        This is an upsert for ratings. The update() method is never called by the front end.
        """
        data = request.data

        # check UUID
        print(data)
        player = get_object_or_404(Player, pk=data['player_id'])
        if player.uuid != data['uuid']:
            raise PermissionDenied

        # create or update
        rating, created = Rating.objects.get_or_create(
            uuid=data['uuid'],
            adventure_id=data['adventure_id'],
        )
        rating.overall = data['overall']
        rating.combat = data['combat']
        rating.puzzle = data['puzzle']
        rating.save()

        serializer = serializers.RatingSerializer(rating)
        return Response(serializer.data)
