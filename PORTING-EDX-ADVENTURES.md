# Eamon Remastered - Porting an adventure from Eamon Deluxe 5.0

This is the easiest way to port an Eamon adventure into Eamon Remastered. The data file format from Eamon Deluxe (EDX) is readable by the Python scripts in Eamon Remastered.

Note: The instructions in this file have only been tested on Windows 10 and include references to Windows-only software (e.g., WinMerge). If you are using macOS or Linux, you will need to adjust the file paths and find alternate software (e.g., Meld or another diff tool can be used in place of WinMerge).

## What you'll need:

* [A copy of EDX 5.0](https://eamonag.org/pages/eamondx.htm)
  * This has only been tested with 5.0. I don't have access to any other versions of EDX, so I can't test with them. 
* The Eamon Remastered project (from this Git repo) running on your computer
* A text diff tool like WinMerge or Meld
* Familiarity with the BASIC programming language

## Background

Frank Black ported about 150 adventures to Eamon Deluxe. In the process, he:

* Upgraded all the adventures to the Eamon Deluxe artifact types (similar to the Eamon 7.1 artifact types, plus a couple new ones)
* Fixed a number of broken room connections
* Converted text from the ALL CAPS of the DOS 3.3 originals to regular sentence case
* In a few cases, he also rewrote some of the adventure content. (See "Cave of the Mind" or "Zyphur Riverventure" for examples)

EDX 5.0 included several upgrades to the game engine. Also, Frank was adding new plot elements that would see the player interact with the same NPCs throughout several adventures.

Because only a handful of adventures were fully ported to the new logic, Frank deactivated a lot of the other adventures until he could finish them. As of the latest beta of EDX 5.0 (released in 2012), he still hasn't. But, you can turn them back on:

* Go to the folder where EDX is installed on your computer (e.g., C:\EDX)
* From there, navigate into C/EAMONDX/E###, where E### is the number of the adventure collection (E001-E024)
* If there is a file in the folder called INTRO4.BAS, that's the old intro program that was the EDX 4.2 adventure loader.
* Delete INTRO.BAS. You won't need this file any more
* Rename INTRO4.BAS to INTRO.BAS
* Now you can boot up EDX, load your character, and go on adventures in that set.

## Porting the adventure to Eamon Remastered

There are three steps to this process: transferring the data, reverse-engineering the game logic, and reimplementing the game logic.

### Loading EDX data into the ER database

There is a Python script that can do this for you automatically, and it's easy to use.

### Check if the collection was already imported

In many cases, the master ER database may already have the imported data for an adventure, even if it's not turned on. Go into the Django admin and look for your adventure. If it's there, just edit the row and set the adventure to "active." Then skip to the "Reverse Engineering" step below.

### Import the data from the EDX collection

Warning: Loading data from a collection is an all-or-nothing operation. If the collection has already been loaded, and some adventures from it have been subsequently edited, it's not a good idea to load it again.

1. Make sure Eamon Remastered is running on your computer. See ADVENTURE-DESIGN.md in the Git repo for instructions.
1. If not using Windows, you'll need to edit line 21 of adventure/management/commands/import.py and enter the path to EDX on your system
1. Find the adventure on the list on the Eamon Wiki:
    1. [https://eamon.wiki/Portal:Adventures](https://eamon.wiki/Portal:Adventures)
    1. This lists all known adventures and their EDX collection numbers
    1. (Note: Eamon Remastered uses the adventure numbers on this page (1-273) which may be different from the ones used by the Eamon Adventurers Guild, which are not all numeric.)
1. Note the EDX# (a.k.a., EDX collection number) on that page - it should be a number from 01-24
1. Back up your local SQLite database (in case you don't like the result)
1. Open a terminal or PowerShell to the project root
1. Run `pipenv shell` if not already activated
1. Run `python manage.py import E###`
    1. Replace E### with the adventure collection number, padded to 3 digits.
    1. E.g., if your collection number was 09, you'd run `python manage.py import E009`
1. Wait a couple minutes for the import to finish
1. If the import script crashes with an error, it's likely that the data was something the script didn't expect, or the script has a bug in it.
1. If you're comfortable with Python, you can try debugging it yourself in adventure/management/commands/import.py
1. Otherwise, open a ticket on GitHub or email Keith for assistance
1. Now, open the Django admin (or a SQL GUI program) and inspect the data. See if it looks OK.

## Inspecting and cleaning up your adventure data

Once the data import has finished, you can open the Django admin or your favorite database GUI tool. Inspect the data for your adventure to see if things look legit. You might need to clean up a few things after the import:

* Artifacts with a room_id higher than the number of rooms. Numbers like 499 or 899, etc. were sometimes used to implement custom logic.
* Artifacts with a negative weight - these are often containers that allow the player to carry more stuff. The best practice in this case is to change the weight to something small, like 3, and put the absolute value of the old weight into the "quantity" field on the artifact.
* Room Exits with negative room numbers (e.g., going north from room #1 goes to room #-2). These are usually secret doors, booby traps, or doors that won't open until the player solves a specific puzzle.
* Rarely, artifacts with types 14, 15, or 16 - these are custom "user defined" types that are different for each adventure. (Only a few adventures have these.) 

### Reverse-engineering the Eamon Deluxe logic

Now that we have the data, we need to figure out the custom logic of the adventure. Locate its .BAS file within the EDX collection folder (e.g., `EDX/C/EAMONDX/E009` or whatever the collection number is).

1. Open the .BAS file in a text editor and look at it. E.g., "Picnic in Paradise" is E004/PICNIC.BAS
1. Look at the comments at the top of the file to find the EDX version number
1. Most adventures use are 4.1, 4.2a, or 4.2b. A few are 1.0, 3.0, or 5.0.
    1. Note: these are not the same as the Classic Eamon MAIN PGM versions, which are usually 4, 5, 6.x, or 7.x
1. Now, find another adventure that uses the same version of the EDX MAIN PGM. 
    1. E.g., For E004/PICNIC.BAS (v4.2a) you could use E004/POLARIS.BAS (Orb of Polaris, also a v4.2a adventure)
1. Using your diff tool (e.g., WinMerge, Meld, etc.) compare the two files
1. Any differences highlighted will be places to look for custom code
1. Pro tips for diffing
    1. Try a few different files to compare with. Look for the one with the fewest differences, to improve signal-noise ratio
    1. Change the comparison to be case-insensitive, to eliminate highlighting of some variable name changes
    1. Compare your adventure's program with one of the others that had the fewest customizations. Here are a few recommended ones:
        1. v4.2a - Diff against E013/ORCLAIR.BAS - this is Escape from the Orc Lair, which had almost no customizations
        1. v5.0 - Diff against E001/MAINPGM.BAS - this is the program from the Eamon Deluxe demo adventure, which has no custom code in it.
1. Note down the pieces of custom code and try to guess what they do.
1. If you need a reference on the EDX variable names, artifact types, etc., check out Frank's Adventure Design Manual, distributed with EDX 5.0. From the path where EDX is installed on your computer, it's in `EDX/Eamon Deluxe 5.0/Eamon Deluxe 5.0 Adventure Design Manual.html`

### Porting the adventure code to Eamon Remastered

Eamon Remastered doesn't use any of the old Basic code. You'll need to recreate the adventure logic in TypeScript using the Eamon Remastered "event handler" system.

For instructions, look at the files [ADVENTURE-DESIGN.md](ADVENTURE-DESIGN.md) and [EVENT-HANDERS.md](EVENT-HANDERS.md) in the Eamon Remastered source code.

With practice, this could take as little as 1-2 hours for a simple adventure, and several days for a complicated adventure.

## What if my favorite adventure isn't in EDX?

EDX 5.0 contains about two thirds of the Classic adventures, but the rest were never ported. This could be for several reasons:

* The original MAIN PGM was too heavily customized (common with many adventures using the v6.2 MAIN PGM, especially adventures written by Tom Zuchowski)
* The adventure was really complicated (e.g., Walled City of Darkness)
* There were custom special effects, like sound effects (e.g., Wizard of the Spheres)
* Or, maybe Frank just didn't get to it

There are additional scripts that can port adventure data from a Classic Eamon adventure, as long as you have an Apple II emulator and the disk image.

Adventures that are not available in EDX can be ported directly from the Classic Eamon disk images. See [the instructions in this file](PORTING-CLASSIC-ADVENTURES.md).
