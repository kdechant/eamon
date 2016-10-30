from rest_framework import viewsets, filters, permissions, mixins, generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from django.db.models import Q

from . import serializers
from .models import Adventure, Room, RoomExit, Artifact, Effect, Monster, Player, Hint, HintAnswer


def index(request, path=''):
    """
    For listing or retrieving adventure data.
    """
    return render(request, 'index.html')


def adventure(request, adventure_id):
    return render(request, 'adventure.html', {'adventure_id': adventure_id})


class AdventureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    For listing or retrieving adventure data.
    """
    queryset = Adventure.objects.filter(active=True)
    serializer_class = serializers.AdventureSerializer

    def get_queryset(self):
        queryset = self.queryset
        return queryset

    def retrieve(self, request, pk=None):
        queryset = self.queryset
        adv = get_object_or_404(queryset, slug=pk)
        serializer = serializers.AdventureSerializer(adv)
        return Response(serializer.data)


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
    queryset = Artifact.objects.all()
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
    queryset = Monster.objects.all()
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
        return self.queryset.filter(Q(adventure__slug=adventure_id) | Q(question="EAMON DELUXE 5.0 GENERAL HELP.", edx="E001")).order_by('index')


class PlayerViewSet(viewsets.ModelViewSet):
    """
    API endpoints for player data. This is read/write.
    """
    queryset = Player.objects.all()
    serializer_class = serializers.PlayerSerializer
    permission_classes = (AllowAny,)

    def update(self, request, pk=None):
        data = request.data
        instance = self.get_object()

        # flatten the weapon and spell abilities into the columns Django wants
        data['wpn_axe'] = data['weapon_abilities']['1']
        data['wpn_bow'] = data['weapon_abilities']['2']
        data['wpn_club'] = data['weapon_abilities']['3']
        data['wpn_spear'] = data['weapon_abilities']['4']
        data['wpn_sword'] = data['weapon_abilities']['5']
        # spell abilities. use the "original" values which include skill improvements during the adventure,
        # but don't count reduced odds due to caster fatigue.
        data['spl_blast'] = data['spell_abilities_original']['blast']
        data['spl_heal'] = data['spell_abilities_original']['heal']
        data['spl_power'] = data['spell_abilities_original']['power']
        data['spl_speed'] = data['spell_abilities_original']['speed']

        # to pass validation, need to fix some values on the inventory items
        for key, value in enumerate(data['inventory']):
            data['inventory'][key]['type'] = int(data['inventory'][key]['type'])
            if data['inventory'][key]['weapon_type'] == 0:
                data['inventory'][key]['weapon_type'] = None;
            data['inventory'][key]['player'] = instance.id

        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
