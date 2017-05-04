import struct, re, os, regex
from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify
from adventure.models import Adventure, Room, RoomExit, Artifact, ArtifactMarking, Effect, Monster


class Command(BaseCommand):
    help = 'Imports data from Classic Eamon adventure listing. Use the Dungeon Designer to print out the listing and' \
           ' save it as four files: rooms.txt, artifacts.txt, effects.txt, and monsters.txt.'

    def add_arguments(self, parser):
        parser.add_argument('folder', nargs=1, type=str)
        parser.add_argument('adventure_id', nargs=1, type=int)

    def handle(self, folder, adventure_id, *args, **options):

        folder = folder[0]

        adventure = Adventure.objects.get(pk=adventure_id[0])

        # compile a regex to reuse later
        rooms_regex = regex.compile(r'ROOM # ([0-9]+) \[([A-Za-z0-9\' /.()-]+)\]\s+'
                                    r'DESC:\s+([A-Za-z0-9\'\s \/\.,;()!?-]+)\s+'
                                    r'DIRECTIONS MOVED IN--\s+'
                                    r'NORTH\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'SOUTH\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'EAST\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'WEST\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'UP\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    r'DOWN\s+:\s+(-?[0-9]+)\s+(\[.+\])?\s+'
                                    )


        # Rooms
        with open(folder + '/rooms.txt', 'r', encoding="cp437") as datafile:
            data = datafile.read()

            match = rooms_regex.finditer(data)
            for m in match:
                # print('id: ' + m.group(1)) # id
                print('room: ' + m.group(2)) # name
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
                room.name = m.group(2).lower()
                room.description = sentence_case(regex.sub(r'\s{2,}', " ", m.group(3)))
                room.save()
                connections = {'n': 4, 's': 6, 'e': 8, 'w': 10, 'u': 12, 'd': 14}
                for direction, index in connections.items():
                    if int(m.group(index)) != 0:
                        e = room.exits.get_or_create(direction=direction)[0]
                        e.room_to = int(m.group(index))
                        if e.room_to == -99:
                            e.room_to = -999    # new style main hall exit
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
                                        )

        with open(folder + '/artifacts.txt', 'r', encoding="cp437") as datafile:
            data = datafile.read()
            match = artifacts_regex.finditer(data)
            for m in match:
                # print('id: ' + m.group(1))  # id
                id = int(m.group(1))
                name = sentence_case(m.group(2))
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
                # print(m.group(18))
                # print('---')
                a = Artifact.objects.get_or_create(adventure=adventure, artifact_id=id)[0]
                a.name = name
                a.description = desc
                a.value = int(m.group(4))
                a.type = int(m.group(5))
                a.weight = int(m.group(7))
                a.room_id = int(m.group(8))
                a.odds = int(m.group(11)) if m.group(11) else None
                a.weapon_type = int(m.group(13)) if m.group(13) else None
                a.dice = int(m.group(16)) if m.group(16) else None
                a.sides = int(m.group(18)) if m.group(18) else None
                a.save()

                # if value is zero and room is zero, it's a dead body. use dead body artifact type.
                if a.value == 0 and a.room_id == 0:
                    a.type = 13

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

        # monsters

        monsters_regex = regex.compile(r'MONSTER # ([0-9]+) \[([A-Za-z0-9\' /.()-]+)\]\s+'
                                        r'DESC:\s+([A-Za-z0-9\'\s \/\.,;()!?-]+)\s+'
                                        r'HARD+\.+(-?\d+)+\s+'
                                        r'AGIL\.+(-?\d+)+\s+(\[.+\])?\s+'
                                        r'FRIEND\.+(-?\d+) %\s+'
                                        r'COUR\.+(-?\d+) %\s+'
                                        r'ROOM\.+(-?\d+)+\s+(\[.+\])?\s+'
                                        r'WGHT\.+(-?\d+)\s+'
                                        r'D\.ODDS\.+(-?\d+) %\s+'
                                        r'ARMOUR\.+(-?\d+)\s+'
                                        r'WEAPON#\.+(-?\d+)+\s+(\[.+\])?\s+'
                                        r'O\.ODDS\.+(-?\d+) %+\s+'
                                        r'W\.DICE\.+(-?\d+)\s+'
                                        r'W\.SIDES\.+(-?\d+)\s+'
                                        )

        with open(folder + '/monsters.txt', 'r', encoding="cp437") as datafile:
            data = datafile.read()
            match = monsters_regex.finditer(data)
            for m in match:
                id = int(m.group(1))
                name = sentence_case(m.group(2))
                print('monster #' + str(id) + ': ' + name)
                desc = sentence_case(regex.sub(r'\s{2,}', " ", m.group(3)))
                # print('desc: ' + desc)
                # print('hd: ' + m.group(4))
                # print('ag: ' + m.group(5))
                # print('friend ' + m.group(7))
                # print('cour ' + m.group(8))
                # print('room ' + m.group(9))
                # print('weight ' + m.group(11))
                # print('d odds: ' + m.group(12))
                # print('armor: ' + m.group(13))
                # print('wpn: ' + m.group(14))
                # print('o.odds: ' + m.group(16))
                # print('dice: ' + m.group(17))
                # print('sides: ' + m.group(18))
                # print('---')
                mn = Monster.objects.get_or_create(adventure=adventure, monster_id=id)[0]
                mn.name = name
                mn.description = desc
                mn.hardiness = m.group(4)
                mn.agility = m.group(5)
                mn.friend_odds = int(m.group(7))
                if mn.friend_odds == 0:
                    mn.friendliness = 'hostile'
                elif mn.friend_odds >= 100:
                    mn.friendliness = 'friend'
                else:
                    mn.friendliness = 'random'
                mn.courage = m.group(8)
                mn.room_id = m.group(9)
                mn.defense_bonus = m.group(12)
                mn.armor_class = m.group(13)
                mn.weapon_id = m.group(14)
                mn.attack_odds = m.group(16)
                mn.weapon_dice = m.group(17)
                mn.weapon_sides = m.group(18)
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
