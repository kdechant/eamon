from django.db import models
from taggit.managers import TaggableManager

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
    (11, 'Wearable'),  # armor/shield
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
CLOTHING_TYPES = (
    (0, 'Clothes or Armor/Shield'),
    (1, 'Coats, Capes, etc.'),
    (2, 'Shoes, boots'),
    (3, 'Gloves'),
    (4, 'Hats, headwear'),
    (5, 'Jewelry'),
    (6, 'Undergarments'),
)
ARMOR_TYPES = (
    (0, 'Armor'),
    (1, 'Shield'),
    (2, 'Helmet'),
)
MARKDOWN_CHOICES = [(False, "Plain text"), (True, "Markdown")]


class Author(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Adventure(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(default='', blank=True)
    full_description = models.TextField(default='', blank=True)
    intro_text = models.TextField(
        default='', blank=True,
        help_text="Text shown to the adventurer when they begin the adventure. Use this to set up the story. Split"
                  " it into multiple pages by using a line containing three hyphens as a break. Supports Markdown."
    )
    intro_question = models.TextField(
        default='', blank=True,
        help_text="If you want to ask the adventurer a question when they start the adventure, put"
                  " the question text here. The answer will be available in the game object."
    )
    slug = models.SlugField(null=True)
    edx = models.CharField(null=True, max_length=50, blank=True)
    edx_version = models.FloatField(default=0, blank=True, null=True)
    edx_room_offset = models.IntegerField(default=0, null=True, blank=True)
    edx_artifact_offset = models.IntegerField(default=0, null=True, blank=True)
    edx_effect_offset = models.IntegerField(default=0, null=True, blank=True)
    edx_monster_offset = models.IntegerField(default=0, null=True, blank=True)
    edx_program_file = models.CharField(null=True, max_length=50, blank=True)
    directions = models.IntegerField(default=6)
    dead_body_id = models.IntegerField(
        default=0, blank=True, null=True,
        help_text="The artifact ID of the first dead body. Leave blank to not use dead body artifacts.")
    active = models.BooleanField(default=0)
    # the first and last index of hints read from the hints file - used with the import_hints management command
    first_hint = models.IntegerField(null=True, blank=True)
    last_hint = models.IntegerField(null=True, blank=True)
    date_published = models.DateField(null=True, blank=True)
    featured_month = models.CharField(null=True, blank=True, max_length=7)
    tags = TaggableManager(blank=True)
    authors = models.ManyToManyField(Author)

    def __str__(self):
        return self.name

    @property
    def times_played(self):
        return ActivityLog.objects.filter(type='start adventure', adventure_id=self.id).count()

    @property
    def avg_ratings(self):
        return self.ratings.all().aggregate(models.Avg('overall'), models.Avg('combat'), models.Avg('puzzle'))

    class Meta:
        ordering = ['name']


class Room(models.Model):
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='rooms')
    room_id = models.IntegerField(default=0)  # The in-game room ID.
    name = models.CharField(max_length=255)
    is_markdown = models.BooleanField(default=False, choices=MARKDOWN_CHOICES, verbose_name="Text format")
    description = models.TextField(max_length=1000)
    # The ID of an effect to display after the description
    effect = models.IntegerField(null=True, blank=True)
    # The ID of an effect to display after the description, without a paragraph break.
    effect_inline = models.IntegerField(null=True, blank=True)
    is_dark = models.BooleanField(default=False)
    dark_name = models.CharField(null=True, blank=True, max_length=255,
                                 help_text="The name shown if the room is dark and the player doesn't have a light. "
                                           "Leave blank to use the standard 'in the dark' message.")
    dark_description = models.TextField(
        null=True, blank=True, max_length=1000,
        help_text="The description shown if the room is dark and the player doesn't"
                  " have a light. Leave blank to use the standard 'it's too dark to see' message.")

    def __str__(self):
        return self.name


class RoomExit(models.Model):
    direction = models.CharField(max_length=2)
    room_from = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='exits')
    room_to = models.IntegerField(default=0)  # Not a real foreign key. Yet.
    door_id = models.IntegerField(null=True, blank=True)
    effect_id = models.IntegerField(null=True, blank=True,
                                    help_text="The effect will be shown when the player moves in this direction. "
                                              "You can also enter a zero for the connection and an effect ID to set up "
                                              "a custom message on a non-existent exit, e.g., if the player can't go in"
                                              " the ocean without a boat, etc.")

    def __str__(self):
        return str(self.room_from) + " " + self.direction


class Artifact(models.Model):
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='artifacts')
    artifact_id = models.IntegerField(default=0)  # The in-game artifact ID.
    article = models.CharField(max_length=20, null=True, blank=True,
                               help_text="Optional article or adjective that appears before the name, "
                                         "e.g., 'a', 'the', 'some'.")
    name = models.CharField(max_length=255)
    synonyms = models.CharField(
        null=True, max_length=255, blank=True,
        help_text="Other terms for this artifact. E.g., if the artifact name is 'secret door in"
                  " north wall' you could have a synonym of 'door' to help the player find it.")
    is_markdown = models.BooleanField(default=False, choices=MARKDOWN_CHOICES, verbose_name="Text format")
    description = models.TextField(max_length=1000)
    # The ID of an effect to display after the description
    effect = models.IntegerField(null=True, blank=True)
    # The ID of an effect to display after the description, without a paragraph break.
    effect_inline = models.IntegerField(null=True, blank=True)
    room_id = models.IntegerField(
        null=True, blank=True,
        help_text="If in a room, the room ID"
    )
    monster_id = models.IntegerField(
        null=True, blank=True,
        help_text="If carried by a monster, the monster ID"
    )
    container_id = models.IntegerField(
        null=True, blank=True,
        help_text="If in a container, the container ID"
    )
    guard_id = models.IntegerField(
        null=True, blank=True,
        help_text="If a bound monster, the ID of a monster that prevents the player from freeing it"
    )
    weight = models.IntegerField(
        default=0,
        help_text="Weight in Gronds. Enter -999 for something that can't be picked up, or 999 to show the message "
                  "'Don't be absurd' if the player tries to pick it up."
    )

    value = models.IntegerField(default=0)
    type = models.IntegerField(null=True, choices=ARTIFACT_TYPES)
    is_worn = models.BooleanField(default=False)
    is_open = models.BooleanField(default=False)
    key_id = models.IntegerField(
        null=True, blank=True,
        help_text="If a container, door, or bound monster, the artifact ID of the key that opens it"
    )
    linked_door_id = models.IntegerField(
        null=True, blank=True,
        help_text="To make a two-sided door, enter the artifact ID of the other side of the door. "
                  "They will open and close as a set."
    )
    hardiness = models.IntegerField(
        null=True, blank=True,
        help_text="If a door or container that can be smashed open, how much damage does it take to open it?")
    weapon_type = models.IntegerField(null=True, blank=True, choices=WEAPON_TYPES)
    hands = models.IntegerField(default=1, choices=(
        (1, 'One-handed'),
        (2, 'Two-handed')
    ))
    weapon_odds = models.IntegerField(null=True, blank=True)
    dice = models.IntegerField(null=True, blank=True)
    sides = models.IntegerField(null=True, blank=True)
    clothing_type = models.IntegerField(null=True, choices=CLOTHING_TYPES, help_text="Reserved for future use.")
    armor_class = models.IntegerField(
        null=True, default=0,
        help_text="(Armor only) How many hits does this armor protect against?"
    )
    armor_type = models.IntegerField(null=True, blank=True, choices=ARMOR_TYPES)
    armor_penalty = models.IntegerField(
        default=0, null=True,
        help_text="(Armor only) How much does this reduce the player's chance to hit, if they don't have enough "
                  "armor expertise?"
    )
    get_all = models.BooleanField(
        default=True,
        help_text="Will the 'get all' command pick up this item?"
    )
    embedded = models.BooleanField(
        default=False,
        help_text="Check this box to make the item not appear in the artifacts list until the player looks at it.")
    hidden = models.BooleanField(
        default=False,
        help_text="(For secret doors only) Check this box for embedded secret doors, so that the player can't "
                  "pass through them before finding them.")
    quantity = models.IntegerField(
        null=True, blank=True,
        help_text="Drinks or bites, fuel for light source, etc."
    )
    effect_id = models.IntegerField(
        null=True, blank=True,
        help_text="First effect ID for Readable artifacts"
    )
    num_effects = models.IntegerField(
        null=True, blank=True,
        help_text="Number of effects for Readable artifacts"
    )

    def __str__(self):
        return self.name


class ArtifactMarking(models.Model):
    """
    Markings on a readable artifact
    """
    artifact = models.ForeignKey(Artifact, on_delete=models.CASCADE)
    marking = models.TextField(max_length=65535)


class Effect(models.Model):
    STYLES = (
        ('', 'Normal'),
        ('emphasis', 'Bold'),
        ('success', 'Success (green)'),
        ('special', 'Special 1 (blue)'),
        ('special2', 'Special 1 (purple)'),
        ('warning', 'Warning (orange)'),
        ('danger', 'Danger (red)'),
    )
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='effects')
    effect_id = models.IntegerField(default=0)  # The in-game effect ID.
    is_markdown = models.BooleanField(default=False, choices=MARKDOWN_CHOICES, verbose_name="Text format")
    text = models.TextField(max_length=65535)
    style = models.CharField(max_length=20, null=True, blank=True, choices=STYLES)  # display effect text in color
    next = models.IntegerField(null=True, blank=True,
                               help_text="The next chained effect. Used with EDX conversions.")
    next_inline = models.IntegerField(null=True, blank=True,
                                      help_text="The next chained effect, no line break. Used with EDX conversions.")

    def __str__(self):
        return self.text[0:50]


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
    monster_id = models.IntegerField(default=0)  # The in-game monster ID.
    article = models.CharField(max_length=20, null=True, blank=True,
                               help_text="Optional article or adjective that appears before the name, "
                                         "e.g., 'a', 'the', 'some'. Does not apply to group monsters.")
    name = models.CharField(max_length=255)
    name_plural = models.CharField(
        max_length=255, null=True, blank=True,
        help_text="The plural form of the name. Used only with group monsters.")
    synonyms = models.CharField(
        null=True, max_length=255, blank=True,
        help_text="Other names used for this monster. If the name is 'python' a synonym might be 'snake'")
    is_markdown = models.BooleanField(default=False, choices=MARKDOWN_CHOICES, verbose_name="Text format")
    description = models.TextField(max_length=1000)
    # The ID of an effect to display after the description
    effect = models.IntegerField(null=True, help_text="Used only with EDX conversions")
    # The ID of an effect to display after the description, without a paragraph break.
    effect_inline = models.IntegerField(null=True, help_text="Used only with EDX conversions")
    count = models.IntegerField(default=1)
    hardiness = models.IntegerField(default=12)
    agility = models.IntegerField(default=12)
    friendliness = models.CharField(max_length=10, choices=FRIENDLINESS)
    friend_odds = models.IntegerField(default=50,
                                      help_text="Used only when 'Friendliness' is 'Random'"
                                      )
    combat_code = models.IntegerField(default=0, choices=COMBAT_CODES)
    courage = models.IntegerField(default=100)
    pursues = models.BooleanField(default=True, help_text="Will the monster pursue a fleeing player?")
    room_id = models.IntegerField(null=True, blank=True)
    container_id = models.IntegerField(
        null=True, blank=True,
        help_text="Container artifact ID where this monster starts. The monster will enter the room as soon as the "
                  "container is opened. e.g., a vampire who awakes when you open his coffin"
    )
    gender = models.CharField(max_length=6, choices=(
        ('male', 'Male'),
        ('female', 'Female'),
        ('none', 'None'),
    ))
    weapon_id = models.IntegerField(
        null=True, blank=True,
        help_text="Enter an artifact ID, or zero for natural weapons. Leave blank for no weapon.")
    attack_odds = models.IntegerField(
        default=50,
        help_text="Base attack odds, before agility and armor adjustments. Weapon type does not matter.")
    weapon_dice = models.IntegerField(
        default=1,
        help_text="Applies to natural weapons only. For an artifact weapon, the weapon's dice and sides will be used.")
    weapon_sides = models.IntegerField(default=4,
                                       help_text="Applies to natural weapons only.")
    defense_bonus = models.IntegerField(
        default=0,
        help_text="Gives the monster an additional percent bonus to avoid being hit. (Rare)"
    )
    armor_class = models.IntegerField(default=0)
    special = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.name


class Hint(models.Model):
    """
    Represents a hint for the adventure hints system
    """
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='hints', null=True)
    index = models.IntegerField(null=True)
    edx = models.CharField(max_length=50, null=True, blank=True)
    question = models.CharField(max_length=255)

    def __str__(self):
        return self.question


class HintAnswer(models.Model):
    """
    Represents an answer to a hint. Each hint may have more than one answer.
    """
    hint = models.ForeignKey(Hint, on_delete=models.CASCADE, related_name='answers')
    index = models.IntegerField(null=True)
    answer = models.TextField(max_length=1000, help_text="Supports Markdown.")
    spoiler = models.BooleanField(default=False,
                                  help_text="Obscure the answer until the user shows it.")


class PlayerProfile(models.Model):
    social_id = models.CharField(max_length=100, null=True)
    uuid = models.CharField(max_length=255, null=True)


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


class PlayerArtifact(models.Model):
    """
    The items (weapons, armor, shield) in the player's inventory in the main hall
    """
    TYPES = (
        (2, 'Weapon'),
        (3, 'Magic Weapon'),
        (11, 'Wearable'),  # armor/shield
    )
    ARMOR_TYPES = (
        (0, 'Armor'),
        (1, 'Shield'),  # different in EDX - see manual
        (2, 'Helmet'),
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


class ActivityLog(models.Model):
    """
    Used to track player activity (going on adventures, etc.)
    """
    player = models.ForeignKey(Player, null=True, blank=True, on_delete=models.CASCADE, related_name='activity_log')
    type = models.CharField(max_length=255)
    value = models.IntegerField(null=True, blank=True)
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='activity_log', null=True)
    created = models.DateTimeField(auto_now_add=True, null=True)
