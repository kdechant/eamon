import struct, re, os, regex
from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify
from adventure.models import Adventure, Room, RoomExit, Artifact, ArtifactMarking, Effect, Monster


class Command(BaseCommand):
    help = 'Imports data from Eamon Deluxe data files'

    def add_arguments(self, parser):
        parser.add_argument('folder', nargs=1, type=str)

    def handle(self, *args, **options):

        edx = options['folder'][0]

        # compile a regex to reuse later
        chained_effect_regex = re.compile(r'(\*{1,2})(\d{3})$')

        folder = 'C:/EDX/C/EAMONDX/' + edx
        # NAME.DAT is a text file
        with open(folder + '/NAME.DAT', 'r', encoding="cp437") as datafile:
            data = datafile.read(65535)

            # read the artifact numbers and database name from the file (used when there is 1 adventure in a db)
            regexsingle = r"\s?(\d+)[ \n]+(\d+)[ \n]+(\d+)[ \n]+(\d+)[ \n]+([A-Z\"][a-zA-Z0-9 \-!.?'\"]+)\s*(\d+)[ \n]+(\d+)[ \n]+(\d+)[ \n]+"
            match = re.match(regexsingle, data)
            if match is None:
                print('No match for regex!')
                return
            else:
                adv_data = match.groups()
            print("Adventure database: " + adv_data[4])

            # for DB with multiple adventures, read the data for each adventure.
            # NOTE: we have to repeat some things in the regexes because Python doesn't
            # make it easy to access multiple matches of subgroups
            regexmulti = r"([A-Z\"][a-zA-Z0-9 \-!.?'\"]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+"
            sub_adventures = re.findall(regexmulti, data)
            if len(sub_adventures) > 0:
                # multiple adventures in the database
                for adv in sub_adventures:
                    print("Adventure: " + adv[0])
                    a = Adventure.objects.get_or_create(name=adv[0], edx=edx)[0]
                    a.slug = slugify(adv[0])
                    a.edx_room_offset = adv[5]
                    a.edx_artifact_offset = adv[6]
                    a.edx_effect_offset = adv[7]
                    a.edx_monster_offset = adv[8]
                    a.directions = adv[9]
                    a.edx_version = adv_data[6]
                    a.edx_program_file = find_basic_file(folder, a.name)
                    a.save()
            else:
                print("Adventure: " + adv_data[4])
                a = Adventure.objects.get_or_create(name=adv_data[4], edx=edx)[0]
                a.slug = slugify(adv_data[4])
                a.edx_room_offset = 1
                a.edx_artifact_offset = 1
                a.edx_effect_offset = 1
                a.edx_monster_offset = 1
                a.edx_version = adv_data[6]
                a.directions = adv_data[5]
                a.edx_program_file = find_basic_file(folder, a.name)
                a.save()

        # load the adventure objects (including ones we just created) so we can reference
        # them when importing the other files.
        adventures = Adventure.objects.filter(edx=edx)

        # All other files are binary
        with open(folder + '/ROOMS.DAT', 'rb') as datafile:
            with open(folder + '/ROOMS.DSC', 'r', encoding="cp437") as descfile:

                room_id = 0
                # while room_id < 5:  # quick version, for testing
                while True:

                    # read the first bytes (containing the name) and exit if EOF
                    bytes = datafile.read(79)
                    if not bytes: break
                    room_id += 1

                    # determine adventure id based on offsets
                    for a in adventures:
                        if room_id >= a.edx_room_offset:
                            adventure_id = a.id
                            new_room_id = room_id - a.edx_room_offset + 1

                    room = Room.objects.get_or_create(adventure_id=adventure_id,room_id=new_room_id)[0]
                    # name
                    room.name = bytes.decode('cp437').strip()
                    print("Room: " + room.name)

                    # description is stored in a separate file
                    bytes = descfile.read(255)
                    room.description = bytes.strip()

                    # *nnn and **nnn in the string represents a chained effect
                    match = chained_effect_regex.search(room.description)
                    if match:
                        room.description = chained_effect_regex.sub('', room.description)
                        if match.groups()[0] == '**':
                            room.effect_inline = match.groups()[1]
                        else:
                            room.effect = match.groups()[1]

                    # other properties are in the next 11 2-byte little-endian integers
                    bytes = datafile.read(22)
                    values = struct.unpack('<hhhhhhhhhhh', bytes)

                    room.is_dark = True if values[10] == 0 else False
                    room.save()

                    # the connections
                    DIRECTIONS = {
                        0: 'n',
                        1: 's',
                        2: 'e',
                        3: 'w',
                        4: 'u',
                        5: 'd',
                        6: 'ne',
                        7: 'nw',
                        8: 'se',
                        9: 'sw',
                    }
                    for d in range(10):
                        e = room.exits.get_or_create(direction=DIRECTIONS[d])[0]
                        if values[d] != 0:
                            if values[d] > 1000:
                                e.door_id = values[d] - 1000
                                e.room_to = 0
                            else:
                                e.room_to = values[d]
                            e.save()
                        else:
                            e.delete()

        with open(folder + '/ARTIFACT.DAT', 'rb') as datafile:
            with open(folder + '/ARTIFACT.DSC', 'r', encoding="cp437") as descfile:

                artifact_id = 0
                # while artifact_id < 5:  # quick version, for testing
                while True:

                    # read the first bytes (containing the name) and exit if EOF
                    bytes = datafile.read(35)
                    if not bytes: break
                    artifact_id += 1

                    # determine adventure id based on offsets
                    for a in adventures:
                        if artifact_id >= a.edx_artifact_offset:
                            adventure_id = a.id
                            new_artifact_id = artifact_id - a.edx_artifact_offset + 1

                    # name
                    artifact = Artifact.objects.get_or_create(adventure_id=adventure_id,artifact_id=new_artifact_id)[0]
                    artifact.name = bytes.decode('cp437').strip()
                    print("Artifact: " + artifact.name)

                    # other properties are in the next 8 2-byte little-endian integers
                    bytes = datafile.read(16)
                    values = struct.unpack('<hhhhhhhh', bytes)

                    artifact.value = values[0]
                    artifact.type = values[1]
                    artifact.weight = values[2]
                    location = values[3]
                    if location == -1:
                        # carried by player
                        artifact.monster_id = 0
                    elif location == -999:
                        # worn by player
                        artifact.monster_id = 0
                        artifact.is_worn = True
                    elif 0 > location > -999:
                        # carried by monster
                        artifact.monster_id = abs(location) - 1
                    elif location > 2000:
                        # embedded
                        artifact.room_id = location - 2000
                        artifact.embedded = True
                    elif location > 1000:
                        # in container
                        artifact.container_id = location - 1000
                    else:
                        artifact.room_id = location

                    # the meaning of the last 4 values depends on the artifact type
                    if artifact.type == 2 or artifact.type == 3:
                        # weapons
                        artifact.weapon_odds = values[4]
                        artifact.weapon_type = values[5]
                        artifact.dice = values[6]
                        artifact.sides = values[7]
                    elif artifact.type == 4:
                        # container
                        artifact.key_id = values[4]
                        artifact.is_open = values[5]
                        # items inside = values[6]
                        # items it can hold = values[7]
                        # (in some EDX versions, they have hit points which are stored in values[7] when the number is
                        # > 1000 (see TGROUND.BAS line 874-891)
                        artifact.quantity = values[7]
                    elif artifact.type == 5:
                        # light source
                        artifact.quantity = values[4]
                    elif artifact.type == 6 or artifact.type == 9:
                        # edible/drinkable
                        artifact.dice = values[4]
                        artifact.sides = 1  # heal items have constant power in original, so use X d 1 dice/sides.
                        artifact.quantity = values[5]  # drinks/bites in manual
                        artifact.is_open = values[6]
                    elif artifact.type == 7:
                        # readable
                        artifact.effect_id = values[4]
                        artifact.num_effects = values[5]
                        artifact.is_open = values[6]
                    elif artifact.type == 8:
                        # door/gate
                        room_beyond = RoomExit.objects.filter(room_from__adventure_id=adventure_id, door_id=new_artifact_id)
                        print("Door logic: Trying to update exit on adventure " + str(adventure_id) + " door " +
                              str(new_artifact_id) + " to " + str(values[4]))
                        if len(room_beyond):
                            # update the room_to field on the RoomExit object
                            print("Updating room_exit #" + str(room_beyond[0].id))
                            room_beyond[0].room_to = values[4]
                            room_beyond[0].save()
                        artifact.key_id = values[5]
                        artifact.is_open = 1 if values[6] == 0 else 0  # closed = 1 for this type
                        artifact.hidden = values[7]  # Hidden flag - for secret doors
                    elif artifact.type == 10:
                        # bound monster
                        artifact.monster_id = values[4]
                        artifact.key_id = values[5]
                        artifact.guard_id = values[6]

                    elif artifact.type == 11:
                        # wearable
                        artifact.clothing_type = values[5]
                        # convert AC to new formula (see player's manual for the AC values for each armor type)
                        artifact.armor_class = values[4]
                        if artifact.armor_class == 1:  # shield
                            artifact.armor_type = 1
                            artifact.armor_class = 1
                        if artifact.armor_class == 2:  # leather
                            artifact.armor_type = 0
                            artifact.armor_class = 1
                        elif artifact.armor_class == 4:  # chain
                            artifact.armor_type = 0
                            artifact.armor_class = 3
                        elif artifact.armor_class == 6:  # plate
                            artifact.armor_type = 0
                            artifact.armor_class = 5
                        elif artifact.armor_class == 8 or artifact.armor_class == 10:  # magic
                            artifact.armor_type = 0
                            artifact.armor_class = 7

                    elif artifact.type == 12:
                        # disguised monster
                        artifact.monster_id = values[4]
                        artifact.effect_id = values[5]
                        artifact.num_effects = values[6]

                    elif artifact.type == 13:
                        # dead body
                        artifact.get_all = values[4]

                    # description is stored in a separate file
                    bytes = descfile.read(255)
                    artifact.description = bytes.strip()

                    # *nnn and **nnn in the description represents a chained effect
                    match = chained_effect_regex.search(artifact.description)
                    if match:
                        artifact.description = chained_effect_regex.sub('', artifact.description)
                        if match.groups()[0] == '**':
                            artifact.effect_inline = match.groups()[1]
                        else:
                            artifact.effect = match.groups()[1]

                    artifact.save()

        with open(folder + '/EFFECT.DSC', 'r', encoding="cp437") as datafile:

            effect_id = 0
            while True:
                bytes = datafile.read(255)
                if not bytes: break
                effect_id += 1

                # determine adventure id based on offsets
                for a in adventures:
                    if effect_id >= a.edx_effect_offset:
                        adventure_id = a.id
                        new_effect_id = effect_id - a.edx_effect_offset + 1

                effect = Effect.objects.get_or_create(
                    adventure_id=adventure_id,
                    effect_id=new_effect_id
                )[0]
                effect.text = bytes.strip()
                print("Effect: " + effect.text[0:20] + "...")

                # {nn} in the text indicates a color to display the effect in
                match = re.search(r'{(\d{2})}', effect.text)
                if match:
                    effect.text = re.sub(r'{\d{2}}', '', effect.text)
                    if match.groups()[0] == '02':
                        effect.style = 'success'
                    elif match.groups()[0] == '15':
                        effect.style = 'special'

                # *nnn and **nnn in the text represents a chained effect
                match = chained_effect_regex.search(effect.text)
                if match:
                    effect.text = chained_effect_regex.sub('', effect.text)
                    if match.groups()[0] == '**':
                        effect.next_inline = match.groups()[1]
                    else:
                        effect.next = match.groups()[1]

                effect.save()

        # TODO: merge chained effects (looking for *nnn at end of text)

        with open(folder + '/MONSTERS.DAT', 'rb') as datafile:
            with open(folder + '/MONSTERS.DSC', 'r', encoding="cp437") as descfile:

                monster_id = 0
                # while monster_id < 5:  # quick version, for testing
                while True:

                    # read the first bytes (containing the name) and exit if EOF
                    bytes = datafile.read(35)
                    if not bytes: break
                    monster_id += 1

                    # determine adventure id based on offsets
                    for a in adventures:
                        if monster_id >= a.edx_monster_offset:
                            adventure_id = a.id
                            new_monster_id = monster_id - a.edx_monster_offset + 1

                    # name
                    monster = Monster.objects.get_or_create(
                        adventure_id=adventure_id,
                        monster_id=new_monster_id
                    )[0]
                    monster.name = bytes.decode('cp437').strip()

                    print("Monster: " + monster.name)

                    # other properties are in the next 13 2-byte little-endian integers
                    bytes = datafile.read(26)
                    values = struct.unpack('<hhhhhhhhhhhhh', bytes)

                    monster.hardiness = values[0]
                    monster.agility = values[1]
                    monster.count = values[2]
                    monster.courage = values[3]
                    monster.room_id = values[4]
                    # whether monster fights with natural weapons, a real weapon, or never fights.
                    # also if it should use the "attacks" verb instead of a random verb
                    monster.combat_code = values[5]
                    monster.armor_class = values[6]
                    if values[7] != -1:
                        monster.weapon_id = values[7]
                    else:
                        monster.weapon_id = None
                    monster.weapon_dice = values[8]  # applies to natural weapons only
                    monster.weapon_sides = values[9]  # applies to natural weapons only
                    # friendliness logic
                    if values[10] == 1:
                        monster.friendliness = 'hostile'
                    elif values[10] == 2:
                        monster.friendliness = 'neutral'
                    elif values[10] == 3:
                        monster.friendliness = 'friend'
                    else:
                        monster.friendliness = 'random'
                        monster.friend_odds = values[10] - 100
                    monster.original_group_size = values[11]

                    # description is stored in a separate file
                    bytes = descfile.read(255)
                    monster.description = bytes.strip()

                    # *nnn and **nnn in the description represents a chained effect
                    match = chained_effect_regex.search(monster.description)
                    if match:
                        monster.description = chained_effect_regex.sub('', monster.description)
                        if match.groups()[0] == '**':
                            monster.effect_inline = match.groups()[1]
                        else:
                            monster.effect = match.groups()[1]

                    monster.save()

        # import artifact synonyms from the .BAS files
        for a in adventures:
            if a.edx_program_file:
                print("Looking for synonyms in " + folder + "/" + a.edx_program_file)
                with open(folder + "/" + a.edx_program_file, "r", encoding="cp437") as mainpgm:
                    basic_code = mainpgm.read()
                    regx = r'(((sy\$\s=\s\"[-\w\s]+\"|sy\s=\s[\d]+|GOSUB\sSynonym1):?\s*){2,})'
                    matches = regex.findall(regx, basic_code)
                    if matches is None:
                        print('No match for regex!')
                        return
                    else:
                        for mt in matches:
                            sy_matches = regex.findall(r'sy\s=\s[\d]+', mt[0])
                            if len(sy_matches) != 1:
                                print("WARNING: Could not parse synonym code:")
                                print(mt[0])
                            else:
                                sy_artifact_id = regex.findall(r"[\d]+", sy_matches[0])
                                print("Synonym artifact ID: " + sy_artifact_id[0])
                                synonyms = []
                                sys_matches = regex.findall(r'sy\$\s=\s\"[\w\s]+\"', mt[0])
                                for sm in sys_matches:
                                    syn = regex.findall(r'\"(.*?)"', sm)
                                    # print("Synonym: " + syn[0])
                                    synonyms.append(syn[0])
                                synonyms = ','.join(synonyms)
                                print("Synonyms: " + synonyms)
                                try:
                                    sy_artifact = Artifact.objects.get(adventure_id=a.id, artifact_id=sy_artifact_id[0])
                                    if sy_artifact:
                                        sy_artifact.synonyms = synonyms
                                        sy_artifact.save()
                                except ObjectDoesNotExist:
                                    print("Can't add synonyms to non-existent artifact #" + sy_artifact_id[0])


def find_basic_file(dir, adventure_name):
    """
    Try to figure out which basic file belongs to this adventure.

    Args:
        dir: The directory where the adventure's EDX data files live, e.g., "C:/EDX/C/EAMONDX/E001"
        adventure_name: The name of the adventure, e.g., "The Beginner's Cave"

    Returns:
        The filename as a string (e.g., "BEGCAVES.BAS")
    """
    for fname in os.listdir(dir):
        full_filename = dir + "/" + fname
        if os.path.isfile(full_filename) and fname.endswith(".BAS"):
            with open(full_filename) as f:
                file_header = f.read(2048)
                if adventure_name in file_header:
                    return fname
