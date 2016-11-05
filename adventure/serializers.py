from rest_framework import serializers
from .models import Adventure, Room, RoomExit, Artifact, Effect, Monster, Player, PlayerArtifact, Hint, HintAnswer


class AdventureSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Adventure
        fields = ('id', 'name', 'description', 'slug', 'edx')


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
        fields = ('index', 'answer')


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
    inventory = PlayerArtifactSerializer(many=True, read_only=False)

    def create(self, validated_data):
        inventory_data = validated_data.pop('inventory') # not used here - causes errors if present
        validated_data['gold'] = 200;
        player = Player.objects.create(**validated_data)

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
