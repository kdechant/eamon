from django.db import models
from adventure.models import Adventure
from adventure.models import WEAPON_TYPES
from random import randint


def generate_slug():
    slug = ""
    for x in range(6):
        slug += chr(randint(65, 90))
    # TODO: stop words
    return slug


class PlayerProfile(models.Model):
    social_id = models.CharField(max_length=100, null=True)
    uuid = models.CharField(max_length=255, null=True)
    slug = models.CharField(max_length=6, null=True)


class Player(models.Model):
    """
    Represents the player saved in the main hall.
    """
    name = models.CharField(max_length=255)
    gender = models.CharField(max_length=6, choices=(
        ('m', 'Male'),
        ('f', 'Female')
    ))
    hardiness = models.IntegerField(default=12)
    agility = models.IntegerField(default=12)
    charisma = models.IntegerField(default=12)
    gold = models.IntegerField(default=200)
    gold_in_bank = models.IntegerField(default=0)
    wpn_axe = models.IntegerField("Axe ability", default=5)
    wpn_bow = models.IntegerField("Bow/missile ability", default=-10)
    wpn_club = models.IntegerField("Club ability", default=20)
    wpn_spear = models.IntegerField("Spear/Polearm ability", default=10)
    wpn_sword = models.IntegerField("Sword ability", default=0)
    armor_expertise = models.IntegerField(default=0)
    spl_blast = models.IntegerField("Blast ability", default=0)
    spl_heal = models.IntegerField("Heal ability", default=0)
    spl_power = models.IntegerField("Power ability", default=0)
    spl_speed = models.IntegerField("Speed ability", default=0)
    uuid = models.CharField(max_length=255, null=True)

    def __str__(self):
        return self.name

    def log(self, type, adventure_id=None):
        l = ActivityLog(player=self, type=type, adventure_id=adventure_id)
        l.save()

    def save(self, **kwargs):
        if not PlayerProfile.objects.filter(uuid=self.uuid).exists():
            slug = generate_slug()
            while PlayerProfile.objects.filter(slug=slug).exists():
                slug = generate_slug()
            PlayerProfile.objects.create(uuid=self.uuid, slug=slug)
        return super().save(**kwargs)


class PlayerArtifact(models.Model):
    """
    The items (weapons, armor, shield) in the player's inventory in the main hall
    """
    # TODO: import ARTIFACT_TYPES from adventure/models.py
    TYPES = (
        (2, 'Weapon'),
        (3, 'Magic Weapon'),
        (11, 'Wearable'),  # armor/shield
    )
    # TODO: import ARMOR_TYPES from adventure/models.py
    ARMOR_TYPES = (
        (0, 'Armor'),
        (1, 'Shield'),  # different in EDX - see manual
        (2, 'Helmet'),
        (3, 'Gloves'),
        (4, 'Ring'),
    )
    HANDS = (
        (1, 'One-handed'),
        (2, 'Two-handed')
    )
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='inventory')
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    type = models.IntegerField(choices=TYPES)
    weight = models.IntegerField(default=0)
    value = models.IntegerField(default=0)
    weapon_type = models.IntegerField(default=0, choices=WEAPON_TYPES, null=True)
    hands = models.IntegerField(choices=HANDS, default=1)
    weapon_odds = models.IntegerField(default=0, null=True)
    dice = models.IntegerField(default=1, null=True)
    sides = models.IntegerField(default=1, null=True)
    armor_type = models.IntegerField(default=0, choices=ARMOR_TYPES, null=True)
    armor_class = models.IntegerField(default=0, null=True)
    armor_penalty = models.IntegerField(default=0, null=True)

    def __str__(self):
        return "{} {}".format(self.player, self.name)


class SavedGame(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='saved_games')
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='saved_games')
    slot = models.IntegerField(null=True)
    description = models.CharField(max_length=255, blank=True, default="")
    data = models.TextField(max_length=1000000, null=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "Player {}, Adventure {}, Slot {}: {}".format(self.player_id, self.adventure_id, self.slot, self.description)


class ActivityLog(models.Model):
    """
    Used to track player activity (going on adventures, etc.)
    """
    player = models.ForeignKey(Player, null=True, blank=True, on_delete=models.CASCADE, related_name='activity_log')
    type = models.CharField(max_length=255)
    value = models.IntegerField(null=True, blank=True)
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='new_activity_log', null=True)
    created = models.DateTimeField(auto_now_add=True, null=True)


class Rating(models.Model):
    uuid = models.CharField(max_length=255, null=True)
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='ratings')
    overall = models.IntegerField(null=True, blank=True)
    combat = models.IntegerField(null=True, blank=True)
    puzzle = models.IntegerField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True, null=True)
