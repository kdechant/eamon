import regex
from django.core.management.base import BaseCommand
from adventure.models import Adventure, Room, RoomExit, Artifact, Effect, Monster


class Command(BaseCommand):
    help = 'Imports data from v7.x Classic Eamon adventure listing. Use the Dungeon Designer to print out the listing and' \
           ' save it as four files: rooms.txt, artifacts.txt, effects.txt, and monsters.txt.'

    def add_arguments(self, parser):
        parser.add_argument('folder', nargs=1, type=str)
        parser.add_argument('adventure_id', nargs=1, type=int)

    def handle(self, folder, adventure_id, *args, **options):

        folder = folder[0]

        adventure = Adventure.objects.get(pk=adventure_id[0])

        # compile a regex to reuse later
        rooms_regex = regex.compile(r'ROOM # ([0-9]+) \[([A-Za-z0-9\' /.()-\[\]]+)\]\s+'
                                    r'DESC:\s+([A-Za-z0-9\'\s \/\.,;()!?-]+)\s+'
                                    r'DIRECTIONS MOVED IN--\s+'
                                    r'NORTH\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'SOUTH\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'EAST\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'WEST\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'UP\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'DOWN\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'LIGHT:\s+([0-9])\s+'
                                    )


        # Rooms
        with open(folder + '/rooms.txt', 'r', encoding="cp437") as datafile:
            data = datafile.read()

            match = rooms_regex.finditer(data)
            for m in match:
                # print('id: ' + m.group(1)) # id
                print('room #' + m.group(1) + ': ' + m.group(2)) # name
                # print('desc: ' + m.group(3)) # desc
                # print('n: ' + m.group(4)) # n
                # print('s: ' + m.group(6)) # s
                # print('e: ' + m.group(8)) # e
                # print('w: ' + m.group(10)) # w
                # print('u: ' + m.group(12)) # u
                # print('d: ' + m.group(14)) # d
                # print('---')
                id = m.group(1)
                room = Room.objects.get_or_create(adventure=adventure, room_id=id)[0]
                room.name = sentence_case(m.group(2))
                room.description = sentence_case(regex.sub(r'\s{2,}', " ", m.group(3)))
                if m.group(16) == '0':
                    room.is_dark = 1
                room.save()
                connections = {'n': 4, 's': 6, 'e': 8, 'w': 10, 'u': 12, 'd': 14}
                for direction, index in connections.items():
                    if int(m.group(index)) != 0:
                        e = room.exits.get_or_create(direction=direction)[0]
                        e.room_to = int(m.group(index))
                        if e.room_to == -99:
                            e.room_to = -999    # new style main hall exit
                        if e.room_to > 500:
                            e.door_id = e.room_to - 500
                            e.room_to = 0  # we get this from the door artifact later - see below
                        e.save()

        # Artifacts
        artifacts_regex = regex.compile(r'ARTIFACT # ([0-9]+) \[([A-Za-z0-9\' /.()-]+)\]\s+'
                                    r'DESC:\s+([A-Za-z0-9\'\s \/\.,;()!?-]+)\s+'
                                    r'VALUE+\.+(-?\d+)+\s+'
                                    r'TYPE\.+(-?\d+)+\s+(\[.+\])?\s+'
                                    r'WEIGHT\.+(-?\d+)+\s+'
                                    r'ROOM\.+(-?\d+)+\s+(\[.+\])?\s+'
                                    r'(ODDS\.+(-?\d+)\s+)?'
                                    r'(W.TYPE\.+(-?\d+)+\s+(\[.+\])?\s+)?'
                                    r'(DICE\.+(-?\d+)\s+)?'
                                    r'(SIDES\.+(-?\d+)\s+)?'
                                    r'(NEXT ROOM\.+(-?\d+)\s+)?'
                                    r'(KEY#\.+(-?\d+)\s+)?'
                                    r'(STRENGTH\.+(-?\d+)\s+)?'
                                    r'(HIDDEN\?\.+(-?\d+)\s+)?'
                                    r'(HEAL AMT\.+(-?\d+)\s+)?'
                                    r'(NBR USES\.+(-?\d+)\s+)?'
                                    r'(1ST EFFECT\.+(-?\d+)\s+)?'
                                    r'(# EFFECTS\.+(-?\d+)\s+)?'
                                    r'(OPEN\?\.+(-?\d+)\s+)?'
                                    r'(COUNTER\?\.+(-?\d+)\s+)?'
                                        )

        with open(folder + '/artifacts.txt', 'r', encoding="cp437") as datafile:
            data = datafile.read()
            match = artifacts_regex.finditer(data)
            for m in match:
                # print('id: ' + m.group(1))  # id
                id = int(m.group(1))
                name = m.group(2).lower()
                print('artifact #' + m.group(1) + ': ' + name)
                desc = sentence_case(regex.sub(r'\s{2,}', " ", m.group(3)))
                # print('desc: ' + desc)  # desc
                # print('val: ' + m.group(4))
                # print('type: ' + m.group(5))
                # # print(m.group(6))
                # print('weight ' + m.group(7))
                # print('room ' + m.group(8))
                # # print(m.group(9))
                # # print(m.group(10))
                # print('odds:')
                # print(m.group(11))
                # # print(m.group(12))
                # # print(m.group(13))
                # print('w.type: ')
                # print(m.group(13)) # w type
                # # print(m.group(15)) # w type
                # print('dice: ')
                # print(m.group(16))
                # # print(m.group(17))
                # print('sides: ')
                # print('---')
                a = Artifact.objects.get_or_create(adventure=adventure, artifact_id=id)[0]
                a.name = name
                a.description = desc
                a.value = int(m.group(4))
                a.type = int(m.group(5))
                # 6 = type desc
                a.weight = int(m.group(7))
                a.room_id = int(m.group(8))
                if a.room_id > 500:
                    a.container_id = a.room_id - 500
                    a.room_id = None
                if a.room_id is not None:
                    if a.room_id > 200:
                        a.room_id -= 200
                        a.embedded = 1
                    if a.room_id < 0:
                        a.monster_id = abs(a.room_id) - 1
                        a.room_id = None
                a.weapon_odds = int(m.group(11)) if m.group(11) else None
                a.weapon_type = int(m.group(13)) if m.group(13) else None
                a.dice = int(m.group(16)) if m.group(16) else None
                a.sides = int(m.group(18)) if m.group(18) else None
                # 20 is next room
                a.key_id = int(m.group(22)) if m.group(22) else None
                a.hardiness = int(m.group(24)) if m.group(24) else None
                a.hidden = int(m.group(26)) if m.group(26) else 0
                if m.group(28):
                    a.dice = int(m.group(28))
                    a.sides = 1
                if a.type == 6 and m.group(30):
                    a.quantity = int(m.group(30))
                a.effect_id = int(m.group(32)) if m.group(32) else None
                a.num_effects = int(m.group(34)) if m.group(32) else None
                a.is_open = int(m.group(36)) if m.group(36) else 0
                if a.type == 5:   # light source quantity
                    a.quantity = int(m.group(38)) if m.group(38) else 0

                # dead bodies - convert to "dead body" type
                if adventure.dead_body_id and a.artifact_id >= adventure.dead_body_id:
                    a.type = 13
                    a.get_all = 0
                a.save()

                # handling of "room beyond door"
                if a.type == 8:
                    room_beyond = RoomExit.objects.filter(room_from__adventure_id=adventure.id, door_id=a.artifact_id)
                    print("Door logic: Trying to update exit on adventure " + str(adventure.name) + " door " +
                          str(a.artifact_id) + " to " + str(m.group(20)))
                    if len(room_beyond):
                        # update the room_to field on the RoomExit object
                        print("Updating room_exit #" + str(room_beyond[0].id))
                        room_beyond[0].room_to = m.group(20)
                        room_beyond[0].save()

        # effects
        effect_regex = regex.compile(r'EFFECT #(\d+):\s+([A-Za-z0-9\'\s \/\.,;()!?-]+)')

        with open(folder + '/effects.txt', 'r') as datafile:
            data = datafile.read()
            data = data.replace('EFFECT #', '~~~EFFECT #')  # makes regex matching easier
            match = effect_regex.finditer(data, regex.M)
            for m in match:
                id = int(m.group(1))
                text = sentence_case(regex.sub(r'\s{2,}', " ", m.group(2)))
                print('effect #' + str(id) + ': ' + text)
                e = Effect.objects.get_or_create(adventure=adventure, effect_id=id)[0]
                e.text = text
                e.save()

        # monsters

        monsters_regex = regex.compile(r'MONSTER # ([0-9]+) \[([A-Za-z0-9\' /.()-]+)\]\s+'
                                        r'DESC:\s+([A-Za-z0-9\'\s \/\.,;()!?-]+)\s+'
                                        r'HARD+\.+(-?\d+)+\s+'
                                        r'AGIL\.+(-?\d+)+\s+'
                                        r'# IN GROUP\.+(-?\d+)+\s+'
                                        r'COUR\.+(-?\d+) ?%?\s+'
                                        r'ROOM\.+(-?\d+)+\s+(\[.+\])?\s+'
                                        r'WGHT\.+(-?\d+)\s+'
                                        r'ARMOR\.+(-?\d+)\s+'
                                        r'WEAPON\s?#\.+(-?\d+)+\s+(\[.+\])?\s+'
                                        r'# DICE\.+(-?\d+)\s+'
                                        r'# SIDES\.+(-?\d+)\s+'
                                        r'FRIEND\?\.+(-?\d+)\s+(\[.+\])?\s+'
                                        )

        with open(folder + '/monsters.txt', 'r', encoding="cp437") as datafile:
            data = datafile.read()
            match = monsters_regex.finditer(data)
            for m in match:
                id = int(m.group(1))
                name = m.group(2).lower()
                print('monster #' + str(id) + ': ' + name)
                desc = sentence_case(regex.sub(r'\s{2,}', " ", m.group(3)))
                print('desc: ' + desc)
                # print('hd: ' + m.group(4))
                # print('ag: ' + m.group(5))
                # print('count: ' + m.group(6))
                # print('cour ' + m.group(7))
                # print('room ' + m.group(8))
                # # print('room name: ' + m.group(9))
                # print('weight ' + m.group(10))
                # print('armor: ' + m.group(11))
                # print('wpn: ' + m.group(12))
                # print('wpn name: ' + m.group(13))
                # print('dice: ' + m.group(14))
                # print('sides: ' + m.group(15))
                # print('friend?: ' + m.group(16))
                print('---')
                mn = Monster.objects.get_or_create(adventure=adventure, monster_id=id)[0]
                mn.name = name
                mn.description = desc
                mn.hardiness = m.group(4)
                mn.agility = m.group(5)
                mn.count = int(m.group(6)) if m.group(6) else 1
                mn.friend_odds = -1  # there were no random friendliness monsters in v7?
                if m.group(16):
                    if m.group(16) == '1':
                        mn.friendliness = 'hostile'
                    elif m.group(16) == '2':
                        mn.friendliness = 'neutral'
                    elif m.group(16) == '3':
                        mn.friendliness = 'friend'
                    else:
                        mn.friendliness = 'random'
                mn.courage = m.group(7)
                mn.room_id = m.group(8)
                mn.defense_bonus = 0
                mn.armor_class = m.group(11)
                mn.weapon_id = int(m.group(12))
                mn.attack_odds = 50
                mn.weapon_dice = m.group(14)
                mn.weapon_sides = m.group(15)
                mn.save()


def sentence_case(string):
    """
    Converts a string to sentence case.
    From http://stackoverflow.com/questions/39969202/convert-uppercase-string-to-sentence-case-in-python
    Args:
        string: The input string

    Returns:
        The string, now in sentence case
    """
    return '. '.join(i.capitalize() for i in string.split('. '))
