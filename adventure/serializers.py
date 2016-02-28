from rest_framework import serializers
from .models import Adventure, Room, RoomExit, Artifact, Effect, Monster


class AdventureSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Adventure
        fields = ('id', 'name', 'description')


class RoomExitSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomExit
        fields = ('direction', 'room_to', 'key_id', 'message')


class RoomSerializer(serializers.ModelSerializer):
    exits = RoomExitSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ('room_id', 'name', 'description', 'is_dark', 'exits')


class ArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artifact


class EffectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Effect


class MonsterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Monster


