from rest_framework import serializers
from .models import Adventure, Room, RoomExit, Artifact, Effect, Monster


class AdventureSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Adventure
        fields = ('id', 'name', 'description')


class RoomExitSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomExit
        fields = ('direction', 'room_to', 'door_id', 'message')


class RoomSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='room_id', read_only=True)
    exits = RoomExitSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ('id', 'name', 'description', 'is_dark', 'exits')


class ArtifactSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='artifact_id', read_only=True)

    class Meta:
        model = Artifact


class EffectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='effect_id', read_only=True)

    class Meta:
        model = Effect


class MonsterSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='monster_id', read_only=True)

    class Meta:
        model = Monster


