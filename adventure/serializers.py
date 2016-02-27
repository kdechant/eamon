from rest_framework import serializers
from .models import Adventure, Room, RoomExit, Artifact, Effect, Monster


class AdventureSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Adventure
        fields = ('id', 'name', 'description')


class RoomSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Room
        fields = ('room_id', 'name', 'description', 'is_dark')


class ArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artifact


class EffectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Effect


class MonsterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Monster


