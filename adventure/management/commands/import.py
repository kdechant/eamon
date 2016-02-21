import struct
from django.core.management.base import BaseCommand, CommandError
from adventure.models import Room, RoomExit, Monster, Artifact

class Command(BaseCommand):
    help = 'Imports data from Eamon Deluxe data files'

    def add_arguments(self, parser):
        parser.add_argument('folder', nargs=1, type=str)

    def handle(self, *args, **options):
        folder = 'C:/EDX/C/EAMONDX/' + options['folder'][0]
        with open(folder + '/ROOMS.DAT', 'rb') as datafile:
            with open(folder + '/ROOMS.DSC', 'rb') as descfile:

#              for i in range(10):
              room_id = 0
              while True:

                  # name
                  bytes = datafile.read(79)
                  if not bytes: break
                  room_id = room_id + 1
                  room = Room.objects.get_or_create(adventure_id=1,room_id=room_id)[0]
                  room.name = bytes.decode('utf-8').strip()
                  print("Room: " + room.name)

                  # description is stored in a separate file
                  bytes = descfile.read(255)
                  room.description = bytes.decode('utf-8').strip()

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
                          e.room_to=values[d]
                          e.save()
                      else:
                          e.delete()

        with open(folder + '/ARTIFACT.DAT', 'rb') as datafile:
            with open(folder + '/ARTIFACT.DSC', 'rb') as descfile:

#              for i in range(10):
              artifact_id = 0;
              while True:

                  # name
                  bytes = datafile.read(35)
                  if not bytes: break
                  artifact_id = artifact_id + 1
                  artifact = Artifact.objects.get_or_create(adventure_id=1,artifact_id=artifact_id)[0]
                  artifact.name = bytes.decode('utf-8').strip()
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
                      artifact.monster_id = 0;
                  elif location == -999:
                      # worn by player
                      artifact.monster_id = 0;
                      artifact.is_worn = true;
                  elif location < 0 and location > -999:
                      # carried by monster
                      artifact.monster_id = abs(location) - 1;
                  elif location > 2000:
                      # embedded
                      artifact.room_id = location - 2000;
                      artifact.embedded = True;
                  elif location > 1000:
                      # in container
                      artifact.container_id = location - 1000
                  else:
                      artifact.room_id = location;

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
#                      artifact.markings = values[4]
#                      artifact.num_markings = values[5]  # TODO: figure out where the rest of the markings are stored
                      artifact.is_open = values[6]
                  elif artifact.type == 8:
                      # door/gate
                      artifact.room_beyond = values[4]
                      artifact.key_id = values[5]
                      artifact.is_open = 1 if values[6] == 0 else 0  # closed = 1 for this type
                      artifact.embedded = values[7]
                  elif artifact.type == 10:
                      # bound monster
                      artifact.monster_id = values[4]
                      artifact.key_id = values[5]
                      artifact.guard_id = values[6]  # TODO: research what the guard does

                  elif artifact.type == 11:
                      # wearable
                      artifact.armor_class = values[4]
                      artifact.armor_type = values[5]  # armor or shield?

                  elif artifact.type == 12:
                      # disguised monster
                      artifact.monster_id = values[4]
                      artifact.first_effect = values[5]
                      artifact.number_of_effects = values[6]

                  elif (artifact.type == 13):
                      # dead body
                      artifact.get_all = values[4]

                  # description is stored in a separate file
                  bytes = descfile.read(255)
                  artifact.description = bytes.decode('utf-8').strip()

                  artifact.save()

        with open(folder + '/MONSTERS.DAT', 'rb') as datafile:
            with open(folder + '/MONSTERS.DSC', 'rb') as descfile:

#              for i in range(10):
              monster_id = 0
              while True:

                  # name
                  bytes = datafile.read(35)
                  if not bytes: break
                  monster_id = monster_id + 1
                  monster = Monster.objects.get_or_create(
                      adventure_id=1,
                      monster_id=monster_id
                  )[0]
                  monster.name = bytes.decode('utf-8').strip()

                  print("Monster: " + monster.name)

                  # other properties are in the next 13 2-byte little-endian integers
                  bytes = datafile.read(26)
                  values = struct.unpack('<hhhhhhhhhhhhh', bytes)

                  monster.hardiness = values[0]
                  monster.agility = values[1]
                  monster.count = values[2]
                  monster.courage = values[3]
                  monster.room = values[4]
                  monster.combat_code = values[5]  # whether monster fights with natural weapons, a real weapon, or never fights. also if it should use the "attacks" verb instead of a random verb
                  monster.armor_class = values[6]
                  monster.weapon_id = values[7]
                  monster.weapon_dice = values[8]  # applies to natural weapons only
                  monster.weapon_sides = values[9]  # applies to natural weapons only
                  # friendliness logic
                  print(values[10])
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
#                  monster.damage = values[12]   # almost always starts at zero

                  # description is stored in a separate file
                  bytes = descfile.read(255)
                  monster.description = bytes.decode('utf-8').strip()

                  monster.save()
