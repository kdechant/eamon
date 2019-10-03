from rest_framework import serializers
from taggit_serializer.serializers import (TagListSerializerField,
                                           TaggitSerializer)
from .models import Adventure, Author, Room, RoomExit, Artifact, Effect, Monster, \
    Player, PlayerArtifact, PlayerProfile, Hint, HintAnswer, ActivityLog
from player.serializers import SavedGameListSerializer


class AuthorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Author
        fields = ('id', 'name')


class AdventureSerializer(serializers.HyperlinkedModelSerializer, TaggitSerializer):
    authors = serializers.StringRelatedField(many=True)
    tags = TagListSerializerField()

    class Meta:
        model = Adventure
        fields = ('id', 'name', 'description', 'full_description', 'intro_text', 'intro_question', 'slug', 'edx',
                  'dead_body_id', 'featured_month', 'date_published', 'authors', 'tags', 'times_played', 'avg_ratings')


class RoomExitSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomExit
        fields = ('direction', 'room_to', 'door_id', 'effect_id')


class RoomSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='room_id', read_only=True)
    exits = RoomExitSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ('id', 'name', 'description', 'is_markdown', 'is_dark', 'dark_name', 'dark_description',
                  'effect', 'effect_inline', 'exits')


class ArtifactSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='artifact_id', read_only=True)

    class Meta:
        model = Artifact
        fields = '__all__'


class EffectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='effect_id', read_only=True)

    class Meta:
        model = Effect
        fields = '__all__'


class MonsterSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='monster_id', read_only=True)

    class Meta:
        model = Monster
        fields = '__all__'


class HintAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HintAnswer
        fields = ('index', 'answer', 'spoiler')


class HintSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='hint_id', read_only=True)
    answers = HintAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Hint
        fields = ('id', 'index', 'edx', 'question', 'answers')


class PlayerArtifactSerializer(serializers.ModelSerializer):

    class Meta:
        model = PlayerArtifact
        exclude = ('id', )


class PlayerSerializer(serializers.ModelSerializer):
    inventory = PlayerArtifactSerializer(many=True, read_only=False, required=False)
    saved_games = SavedGameListSerializer(many=True, read_only=True, required=False)

    def create(self, validated_data):
        if 'inventory' in validated_data:
            _ = validated_data.pop('inventory')  # not used here - causes errors if present
        validated_data['gold'] = 200
        player = Player.objects.create(**validated_data)
        player.log("create")
        return player

    def update(self, instance, validated_data):

        inventory_data = validated_data.pop('inventory')
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        PlayerArtifact.objects.filter(player=instance.id).delete()
        for item in inventory_data:
            item['player'] = instance
            PlayerArtifact.objects.create(**item)

        return instance

    class Meta:
        model = Player
        fields = '__all__'


class PlayerProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = PlayerProfile
        fields = '__all__'


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'
