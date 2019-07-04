from rest_framework import serializers
from adventure.models import Adventure
from .models import Rating, SavedGame


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


class RatingSerializer(serializers.ModelSerializer):
    """
    This serializer presents all the fields, including "data". For use in detail endpoints.
    """
    class Meta:
        model = Rating
        fields = '__all__'
