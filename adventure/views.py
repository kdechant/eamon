from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from django.db.models import Q

from . import serializers
from .models import Adventure, Author, Room, Artifact, Effect, Monster, Player, PlayerProfile, Hint, ActivityLog


def index(request, path=''):
    """
    The home page
    """
    return render(request, 'index.html')


def about(request):
    """
    The "about" page
    """
    return render(request, 'about.html')


def privacy_policy(request):
    """
    The "privacy policy" page
    """
    return render(request, 'privacy.html')


def main_hall(request):
    """
    The container for the "main hall" react app
    """
    return render(request, 'main-hall.html')


def adventure(request, slug):
    """
    The container for the "core" a.k.a. "adventure" angular app
    """
    return render(request, 'adventure.html', {'slug': slug})


def adventure_list(request):
    adventures = Adventure.objects.filter(active=True).order_by('name')
    return render(request, 'adventure-list.html', {'adventures': adventures})


def manual(request):
    return render(request, 'manual.html')


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    For listing or retrieving authors.
    """
    queryset = Author.objects.filter()
    serializer_class = serializers.AuthorSerializer

    def get_queryset(self):
        queryset = self.queryset
        return queryset


class AdventureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    For listing or retrieving adventure data.
    """
    queryset = Adventure.objects.filter(active=True)
    serializer_class = serializers.AdventureSerializer

    def get_queryset(self):
        queryset = Adventure.objects.filter(active=True)
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


class PlayerProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoints for user data. This is read/write.
    """
    serializer_class = serializers.PlayerProfileSerializer
    queryset = PlayerProfile.objects.all()
    permission_classes = (AllowAny,)

    def retrieve(self, request, *args, **kwargs):
        pass

    def create(self, request, *args, **kwargs):
        """
        This is actually an "upsert" for users
        """
        social_id = self.request.data['social_id']
        request_uuid = self.request.data['uuid']

        # create a profile if not found
        pl, created = PlayerProfile.objects.get_or_create(social_id=social_id)
        db_uuid = pl.uuid
        if created:
            pl.social_id = social_id
            pl.uuid = request_uuid
            pl.save()

        # look for any player characters with the browser's old UUID, and update them to match the profile's UUID
        players = Player.objects.filter(uuid=request_uuid).exclude(uuid=db_uuid)
        print("Updating players...")
        for p in players:
            print("Updating player: " + p.name)
            print("Old UUID: " + p.uuid)
            print("New UUID: " + db_uuid)
            p.uuid = db_uuid
            p.save()

        serializer = serializers.PlayerProfileSerializer(pl)
        return Response(serializer.data)


class PlayerViewSet(viewsets.ModelViewSet):
    """
    API endpoints for player data. This is read/write.
    """
    queryset = Player.objects.all()
    serializer_class = serializers.PlayerSerializer
    permission_classes = (AllowAny,)

    """
    Override the default query set to filter by the UUID which is passed in the query string.
    This prevents people from seeing each other's adventurers.
    """
    def get_queryset(self):
        uuid = self.request.query_params.get('uuid', None)
        if uuid is None:
            # in a PUT request the uuid is in the body rather than the query string
            uuid = self.request.data.get('uuid', None)
        queryset = self.queryset
        if uuid is not None:
            # filter the list by the UUID provided in the query string
            queryset = queryset.filter(uuid=uuid)
        else:
            # prevent showing all players if no UUID was passed
            queryset = queryset.filter(uuid='This will match nothing')
        return queryset.order_by('name')

    """
    API URL to update a player. Overrides the parent class.
    """
    def update(self, request, *args, **kwargs):
        # uuid = self.request.query_params.get('uuid', None)
        # if uuid is not None:
        #     raise PermissionError

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
            if 'weapon_type' not in data['inventory'][key] or data['inventory'][key]['weapon_type'] == 0:
                data['inventory'][key]['weapon_type'] = None
            data['inventory'][key]['player'] = instance.id

        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class LogViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    API endpoints for the logger. This is read/write.
    """
    queryset = ActivityLog.objects.all()
    serializer_class = serializers.ActivityLogSerializer
    permission_classes = (AllowAny,)
