from django.db import models


ARTIFACT_TYPES = (
    (0, 'Gold'),
    (1, 'Treasure'),
    (2, 'Weapon'),
    (3, 'Magic Weapon'),
    (4, 'Container'),
    (5, 'Light Source'),
    (6, 'Drinkable'),
    (7, 'Readable'),
    (8, 'Door/Gate'),
    (9, 'Edible'),
    (10, 'Bound Monster'),
    (11, 'Wearable'), # armor/shield
    (12, 'Disguised Monster'),
    (13, 'Dead Body'),
    (14, 'User 1'),
    (15, 'User 2'),
    (16, 'User 3'),
)
AXE = 1
BOW = 2
CLUB = 3
SPEAR = 4
SWORD = 5
WEAPON_TYPES = (
    (AXE, 'Axe'),
    (BOW, 'Bow'),
    (CLUB, 'Club'),
    (SPEAR, 'Spear'),
    (SWORD, 'Sword')
)
ARMOR_TYPES = (
    (0, 'Armor'),
    (1, 'Shield'), # different in EDX - see manual
)


class Adventure(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(null=True)
    edx = models.IntegerField(null=True)


class Room(models.Model):
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='rooms')
    room_id = models.IntegerField(default=0) # The in-game room ID.
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    is_dark = models.BooleanField(default=0)


class RoomExit(models.Model):
    direction = models.CharField(max_length=2)
    room_from = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='exits')
    room_to = models.IntegerField(default=0) # Not a real foreign key. Yet.
    key_id = models.IntegerField(null=True)
    message = models.CharField(max_length=255)


class Artifact(models.Model):
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='artifacts')
    artifact_id = models.IntegerField(default=0) # The in-game artifact ID.
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    room_id = models.IntegerField(null=True,
        help_text="If in a room, the room ID"
    )
    monster_id = models.IntegerField(null=True,
        help_text="If carried by a monster, the monster ID"
    )
    container_id = models.IntegerField(null=True,
        help_text="If in a container, the container ID"
    )
    weight = models.IntegerField(default=0)
    value = models.IntegerField(default=0)
    type = models.IntegerField(null=True,choices=ARTIFACT_TYPES)
    is_open = models.BooleanField(default=False)
    weapon_type = models.IntegerField(null=True,choices=WEAPON_TYPES)
    hands = models.IntegerField(default=1,choices=(
      (1, 'One-handed'),
      (2, 'Two-handed')
    ))
    weapon_odds = models.IntegerField(null=True)
    dice = models.IntegerField(null=True)
    sides = models.IntegerField(null=True)
    armor_class = models.IntegerField(default=0)
    get_all = models.BooleanField(default=True,
        help_text="Will the 'get all' command pick up this item?"
    )
    embedded = models.BooleanField(default=False)
    quantity = models.IntegerField(null=True,
        help_text="Drinks or bites, fuel for light source, etc."
    )


class ArtifactMarking(models.Model):
    """
    Markings on a readable artifact
    """
    artifact = models.ForeignKey(Artifact)
    marking = models.TextField(max_length=65535)


class Monster(models.Model):
    FRIENDLINESS = (
        ('friend', 'Always Friendly'),
        ('neutral', 'Always Neutral'),
        ('hostile', 'Always Hostile'),
        ('random', 'Random'),
    )
    COMBAT_CODES = (
        (1, "Attacks using generic ATTACK message (e.g., slime, snake, bird)"),
        (0, "Uses weapon, or with natural weapons if specified (default)"),
        (-1, "Use weapon if it has one, otherwise natural weapons"),
        (-2, "Never fights"),
    )
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='monsters')
    monster_id = models.IntegerField(default=0) # The in-game monster ID.
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    hardiness = models.IntegerField(default=12)
    agility = models.IntegerField(default=12)
    friendliness = models.CharField(max_length=10,choices=FRIENDLINESS)
    friend_odds = models.IntegerField(default=50)
    combat_code = models.IntegerField(default=0, choices=COMBAT_CODES)
    courage = models.IntegerField(default=100)
    room_id = models.IntegerField(default=0)
    gender = models.CharField(max_length=6, choices=(
        ('male', 'Male'),
        ('female', 'Female'),
        ('none', 'None'),
    ))
    weapon_id = models.IntegerField(null=True)
    attack_odds = models.IntegerField(default=50)
    weapon_dice = models.IntegerField(default=1)
    weapon_sides = models.IntegerField(default=4)
    defense_bonus = models.IntegerField(default=0,
        help_text="Special defensive bonus making monster harder to hit"
    )
    armor_class = models.IntegerField(default=0)


class Player(models.Model):
    """
    Represents the player saved in the main hall.
    """
    name = models.CharField(max_length=255)
    gender = models.CharField(max_length=6, choices=(
        ('male', 'Male'),
        ('female', 'Female')
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


class PlayerArtifact(models.Model):
    """
    The items (weapons, armor, shield) in the player's inventory in the main hall
    """
    TYPES = (
        (2, 'Weapon'),
        (3, 'Magic Weapon'),
        (11, 'Wearable'), # armor/shield
    )
    ARMOR_TYPES = (
        (0, 'Armor'),
        (1, 'Shield'), # different in EDX - see manual
    )
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='inventory')
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    type = models.IntegerField(choices=TYPES)
    weapon_type = models.IntegerField(default=0,choices=WEAPON_TYPES)
    odds = models.IntegerField(default=0)
    dice = models.IntegerField(default=1)
    sides = models.IntegerField(default=1)
    armor_type = models.IntegerField(default=0,choices=ARMOR_TYPES)
    armor_class = models.IntegerField(default=0)
    armor_penalty = models.IntegerField(default=0)
