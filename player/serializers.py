from rest_framework import serializers
from adventure.models import Adventure
from .models import ActivityLog, Player, PlayerArtifact, PlayerProfile, Rating, SavedGame


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'


class AdventureMiniSerializer(serializers.ModelSerializer):
    """
    Short version of the Adventure serializer, for use in relationships or where a very simple list is needed.
    Placed here and not in the "adventure" app due to file loading issues (possible circular include)
    """
    class Meta:
        model = Adventure
        fields = ('id', 'name', 'slug')


class SavedGameListSerializer(serializers.ModelSerializer):
    """
    This serializer presents a compact data format, without the big "data"
    field, for use in lists and relationships
    """
    adventure = AdventureMiniSerializer(many=False, read_only=True)

    class Meta:
        model = SavedGame
        exclude = ('data', )


class SavedGameDetailSerializer(serializers.ModelSerializer):
    """
    This serializer presents all the fields, including "data". For use in detail endpoints.
    """
    adventure = AdventureMiniSerializer(many=False, read_only=True)

    class Meta:
        model = SavedGame
        fields = '__all__'


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


class RatingSerializer(serializers.ModelSerializer):
    """
    This serializer presents all the fields, including "data". For use in detail endpoints.
    """
    class Meta:
        model = Rating
        fields = '__all__'
