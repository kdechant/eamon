from rest_framework import serializers
from taggit_serializer.serializers import (TagListSerializerField,
                                           TaggitSerializer)
from adventure.models import Adventure, Author, Room, RoomExit, Artifact, Effect, Monster, \
    Hint, HintAnswer


class AuthorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Author
        fields = ('id', 'name')


class AdventureSerializer(serializers.HyperlinkedModelSerializer, TaggitSerializer):
    """Serializer used for the designer app. Includes additional info."""
    authors = serializers.StringRelatedField(many=True)
    tags = TagListSerializerField()
    # rooms_count = serializers.IntegerField()
    # artifacts_count = serializers.IntegerField()
    # effects_count = serializers.IntegerField()
    # monsters_count = serializers.IntegerField()

    class Meta:
        model = Adventure
        fields = ('id', 'name', 'description', 'full_description', 'intro_text', 'intro_question', 'slug',
                  'featured_month', 'date_published', 'authors', 'tags', 'times_played', 'active'
                  # 'rooms_count', 'artifacts_count', 'effects_count', 'monsters_count'
        )


class RoomExitSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomExit
        fields = ('direction', 'room_to', 'door_id', 'effect_id')


class RoomSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='room_id', read_only=True)
    exits = RoomExitSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ('id', 'name', 'description', 'is_markdown', 'is_dark',
                  'dark_name', 'dark_description', 'effect', 'effect_inline',
                  'data', 'exits')


class ArtifactSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='artifact_id', read_only=True)

    class Meta:
        model = Artifact
        fields = '__all__'

    def to_internal_value(self, data):
        # Nullable integer fields
        if 'effect' in data and data['effect'] == "":
            data['effect'] = None
        if 'effect_inline' in data and data['effect_inline'] == "":
            data['effect_inline'] = None
        return data


class EffectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='effect_id', read_only=True)

    class Meta:
        model = Effect
        fields = '__all__'

    def to_internal_value(self, data):
        # Nullable integer fields
        if 'next' in data and data['next'] == "":
            data['next'] = None
        if 'next_inline' in data and data['next_inline'] == "":
            data['next_inline'] = None
        return data


class MonsterSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='monster_id', read_only=True)

    class Meta:
        model = Monster
        fields = '__all__'

    def to_internal_value(self, data):
        # Nullable integer fields
        if 'effect' in data and data['effect'] == "":
            data['effect'] = None
        if 'effect_inline' in data and data['effect_inline'] == "":
            data['effect_inline'] = None
        return data


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
