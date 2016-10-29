import struct, re, os, regex
from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify
from adventure.models import Adventure, Room, RoomExit, Artifact, ArtifactMarking, Effect, Monster, Hint, HintAnswer


class Command(BaseCommand):
    help = 'Imports hints from Eamon Deluxe hint files'

    def add_arguments(self, parser):
        parser.add_argument('folder', nargs=1, type=str)

    def handle(self, *args, **options):

        edx = options['folder'][0]

        folder = 'C:/EDX/C/EAMONDX/' + edx

        # load the adventure objects (including ones we just created) so we can reference
        # them when importing the other files.
        adventures = Adventure.objects.filter(edx=edx)

        # read the raw hint text from the HINTS.DSC file
        hint_raw = []
        with open(folder + "/HINTS.DSC", "r", encoding="cp437") as hintdata:
            while True:
                bytes = hintdata.read(255)
                if not bytes: break
                hint_raw.append(bytes)

        # read the hint questions and sizes from HINTDIR.DAT and save the rows
        with open(folder + "/HINTDIR.DAT", "r", encoding="cp437") as hintdir:
            # the first line contains the total number of hints
            total_hints = int(hintdir.readline().strip())
            # then we have the individual hints
            for h in range(total_hints):
                hint = Hint.objects.get_or_create(
                    edx=edx,
                    index=h+1
                )[0]
                hint.question = hintdir.readline()
                print("Found hint: " + hint.question)
                hint.save()
                # the hint answers. there can be multiple of these
                hint_start_end = hintdir.readline()
                regx = r'\s*(\d+)\s+(\d+)\s*'
                matches = regex.findall(regx, hint_start_end)
                hint_start = int(matches[0][0]) - 1
                hint_length = int(matches[0][1])
                hint_end = hint_start + hint_length
                answers = hint_raw[hint_start:hint_end]
                for idx, an in enumerate(answers):
                    ha = HintAnswer.objects.get_or_create(
                        hint_id=hint.id,
                        index=idx+1
                    )[0]
                    ha.answer = an
                    ha.save()


        # figure out which hints go with each adventure
        for a in adventures:
            if a.edx_program_file:
                first_hint = 0
                last_hint = 0
                # special handling for a few adventures
                if a.name == "The Beginner's Cave":
                    first_hint = 2
                    last_hint = 3
                elif a.name == "Enhanced Beginner's Cave":
                    first_hint = 9
                    last_hint = 11
                elif a.name == "Eamon Deluxe 5.0 Demo Adventure":
                    first_hint = 19
                    last_hint = 19
                else:
                    # look in the .BAS file for the hard-coded hint numbers
                    print("Looking for hint range in " + folder + "/" + a.edx_program_file)
                    with open(folder + "/" + a.edx_program_file, "r", encoding="cp437") as mainpgm:
                        basic_code = mainpgm.read()
                        regx = r'IF nh > 1 THEN a = (\d+): m = (\d+)'
                        matches = regex.findall(regx, basic_code)
                        if matches is None or len(matches) == 0:
                            print('No match for regex!')
                        else:
                            first_hint = int(matches[0][0])
                            last_hint = int(matches[0][1])

                if (first_hint != 0 and last_hint != 0):
                    hints = Hint.objects.filter(edx=edx, index__gte=first_hint, index__lte=last_hint)
                    for h in hints:
                        print("Hint " + h.question + " maps to adventure " + str(a.id))
                        h.adventure_id = a.id
                        h.save()
