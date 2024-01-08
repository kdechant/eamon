from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Player, PlayerProfile, Rating, SavedGame, ActivityLog, generate_slug
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


class PlayerProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoints for user data. This is read/write.
    """
    serializer_class = serializers.PlayerProfileSerializer
    queryset = PlayerProfile.objects.all()
    permission_classes = (AllowAny,)

    def retrieve(self, request, pk=None, *args, **kwargs):
        # 'pk' here is either a slug or a uuid. We can tell by the length.
        where = {
            'slug': pk,
        }
        if len(pk) > 6:
            where = {
                'uuid': pk
            }
        instance = get_object_or_404(PlayerProfile, **where)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        This doesn't require any input. It just creates a new profile
        with a randomly generated access code and returns it.
        """
        # TODO: generate UUID so we can match profile to players.
        pl, created = PlayerProfile.objects.create(slug=generate_slug())
        serializer = serializers.PlayerProfileSerializer(pl)
        return Response(serializer.data)

    # OLD VERSION - FOR FB LOGIN
    # def create(self, request, *args, **kwargs):
    #     """
    #     This is actually an "upsert" for users
    #     """
    #     old_uuid = self.request.data['social_id']
    #     new_uuid = self.request.data['uuid']
    #
    #     # create a profile if not found
    #     pl, created = PlayerProfile.objects.get_or_create(social_id=social_id)
    #     db_uuid = pl.uuid
    #     if created:
    #         pl.social_id = social_id
    #         pl.uuid = request_uuid
    #         pl.save()
    #
    #     # look for any player characters with the browser's old UUID, and update them to match the profile's UUID
    #     players = Player.objects.filter(uuid=request_uuid).exclude(uuid=db_uuid)
    #     print("Updating players...")
    #     for p in players:
    #         print("Updating player: {} - Old UUID: {} - New UUID: {}".format(p.name, p.uuid, db_uuid))
    #         p.uuid = db_uuid
    #         p.save()
    #
    #     serializer = serializers.PlayerProfileSerializer(pl)
    #     return Response(serializer.data)

    def merge(self, request, *args, **kwargs):
        """
        Merge two accounts
        """
        old_uuid = self.request.query_params.get('old_uuid', '')
        new_uuid = self.request.query_params.get('new_uuid', '')

        # look for any player characters with the browser's old UUID, and update them to match the profile's UUID
        players = Player.objects.filter(uuid=old_uuid).exclude(uuid=new_uuid)
        print("Updating players...")
        for p in players:
            print("Updating player: {} - Old UUID: {} - New UUID: {}".format(p.name, p.uuid, new_uuid))
            p.uuid = new_uuid
            p.save()
        # TODO: update old profile with a redirect to the new one, so we know how they
        #  were merged, and we can still load the chars if the user ever uses the old access code

    def destroy(self, request, *args, **kwargs):
        """
        Deletes the user's account.
        """
        social_id = self.request.query_params.get('social_id', '')
        request_uuid = self.request.query_params.get('uuid', '')

        try:
            pl = PlayerProfile.objects.get(social_id=social_id, uuid=request_uuid)
            pl.delete()
            return Response("Deleted!", status=status.HTTP_204_NO_CONTENT)
        except PlayerProfile.DoesNotExist as e:
            return Response("Could not find an account with that user ID and UUID",
                            status=status.HTTP_404_NOT_FOUND)


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
        if 'weapon_abilities' in data:
            data['wpn_axe'] = data['weapon_abilities']['1']
            data['wpn_bow'] = data['weapon_abilities']['2']
            data['wpn_club'] = data['weapon_abilities']['3']
            data['wpn_spear'] = data['weapon_abilities']['4']
            data['wpn_sword'] = data['weapon_abilities']['5']
        # spell abilities. use the "original" values which include skill improvements during the adventure,
        # but don't count reduced odds due to caster fatigue.
        if 'spell_abilities_original' in data:
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
