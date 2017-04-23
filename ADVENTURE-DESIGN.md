# Eamon Adventure Design Manual

So you want to build an Eamon adventure? This requires some basic knowledge of databases, JavaScript programming, and using a command-line terminal.

Eamon is built on Angular and Django, but you don't need in-depth knowledge about either to contribute. You can build an entire adventure with no programming if you use the built-in features. Or, to add custom special effects, all you need to know is a bit of JavaScript. (Eamon is written in TypeScript, which is just a fancier version of JavaScript and is easy to learn if you already know JavaScript.)

## Getting started
 
The first step is to get a copy of Eamon running on your development machine. You'll need the following:

* Python v3.4 or higher
* Node.js v6.x or higher
* MySQL v5.6 or higher

The tools required to run Eamon are compatible with Linux, Windows 10, and OSX.

### Set up your development environment

* Clone this Git repo
* Get a copy of the MySQL database and load it into a database called `eamon`
* Make sure the database user and password in eamon/settings.py match something that works on your system
* Open a command prompt and navigate to the repository root
* Create a Python virtual environment using `virtualenv venv`
* If your system has both python 2 and python 3 installed, you might need to run this instead: `virtualenv -p /usr/bin/python3 venv`
* Activate the virtual environment with `source venv/bin/activate` 
* Install Python packages using `pip install -r requirements.txt`
* Create a user for the admin: `python manage.py createsuperuser`
* Run `python manage.py runserver`
    * If you're using PyCharm, skip this step and set up your development server inside PyCharm itself. It makes life a bit easier.
* Open a second command prompt and navigate to the "static" folder
* Install Angular and other JS packages using `npm install`
* Compile the TypeScript into JavaScript by running `node_modules/typescript/bin/tsc`
* Run `npm start`
    * If your source code editor doesn't support TypeScript, you'll need to run `npm start-all` instead. This will automatically transpile TypeScript into JavaScript when you save any .ts file.
* A browser window will pop up, showing the home screen

URLs: 
Eamon home page: http://localhost:3000
Admin page (for building adventure data): http://localhost:3000/admin
To log into the admin, use the username and password you used when you ran the "createsuperuser" command above.

### How to run the unit tests

* Run `npm start` as above
* In your browser, open a new tab and enter the address 'http://localhost:3000/unit_tests.html'

## Building the adventure database

You can edit your adventure objects in the admin site. This provides basic forms for creating adventures, rooms, artifacts, monsters, etc. This is still a work in progress!

The adventure objects are defined in the following tables in the database:

	• Adventure_adventure
	• Adventure_room
	• Adventure_roomexit
	• Adventure_artifact
	• Adventure_effect
	• Adventure_monster
	• Adventure_hint
	• Adventure_hintanswer

First, create a row in the `adventure_adventure` table. Give your adventure a name and a slug. Also give it a description and intro text. If you want to ask a question to the player on the intro screen, put the question in the `intro_question` field. Set the `active` field to 1.

The fields with names beginning with `edx_`, as well as the `first_hint` and `last_hint` fields, are used for importing data from the EDX databases. For new adventures, leave these blank.

### Adding rooms

Put your rooms in the `adventure_rooms` table. Make sure to put the adventure_id of your own adventure. The `id` column here is just an autonumber for the `rooms` table as a whole. You should give your rooms their in-adventure number (starting with 1 and counting up) in the `room_id` column.

### Artifacts and monsters

Do the same for artifacts and monsters.

### Hints

If you want to provide special hints in your adventure, add these to the `adventure_hint` and `adventure_hintanswer` tables.


## Programming Custom Commands and Event Handlers

Make a copy of the folder "static/adventures/base-adventure". Name it the machine-friendly slug of your adventure (e.g., "the-beginners-cave").

You should have the following files:

    static/
        adventures/
            your-adventure/
                commands.ts
                event-handlers.ts

Note: These files need to exist for your adventure, even if they have no custom code in them.

If your adventure implements custom commands, edit commands.ts and add your new commands. Do not attempt to redefine any built-in commands here. To alter the effect of one of the built-in commands (READ, EAT, DRINK, etc.), use an event handler.

Edit event-handlers.ts. The base file already contains an event handler for the game start routine. Add any special effects or monster/artifact setup logic here.

The base file also contains an event handler for the effects of the POWER spell. Edit this to add any custom effects you want.

To add other custom logic, e.g., a special effect when picking up an artifact, reading a magic scroll, or drinking a potion of agility, you will need to add your own custom event handlers.

The following types of effects are built into the game and do not require custom code. For these, you only need to set up the appropriate data in the database:

* Reading signs and other artifacts that just provide text, with no effect on the player
* Edible and drinkable items, including healing potions
* Doors without keys
* Locked doors with keys
* Disguised monsters, such as the chest mimic in the Beginner's Cave
* Bound monsters, such as prisoners, who need to be freed
* Weapons
* Armor and other wearable items
    *  Any artifact of the "wearable" type can be worn by the player, but you will need to add custom event handlers if these should have any effect beyond changing the player's armor class
* Light sources, including ones that can run our of fuel
* Containers like chests, bags, and backpacks

### Available event handlers

TODO

### Using custom game flags and data

Eamon has the ability to store custom game state which persists for the duration of the adventure. This is useful for keeping game flags and counters which affect the plot.

This is done by using the game.data object, which is just a string-indexed hash map.

Examples:

game.data["rising_water_level"] = 1;
game.data["deactivated the laser"] = false;

Commonly, this stores numbers and booleans, though it can also store strings, arrays, or any other JavaScript data types. The game data stored here is available in any of your event handlers and custom commands.

If you have used Eamon Deluxe, the `game.data` object replaces the `d%` variable, which was used in a similar fashion.

### Asking a question in the intro screen

If you add data to your "intro_question" field in your adventure, this will be asked to the player when they start the adventure. The player's answer will be available during the game in the game.intro_answer variable.

See the Devil's Dungeon for an example.

### Defining custom functions

If more than one of your event handlers use the same shared logic, you can define additional JavaScript functions at the end of your event-handlers.ts file. These can be called from anywhere within your event handlers. (See the Trollsfire routine in the Beginner's Cave for an example.)

### Writing tests for your event handlers

TODO

## Running your adventure

After you have created some rooms, artifacts, effects, and monsters, and created the "commands.ts" and "even-handlers.ts" files, it's time to give it a try.

Go to your browser and reload the Eamon tab. You should be able to load your character and go on your adventure.

If you're already in the adventure and you want to reload your latest changes, it's safe to just hit the "Reload" button. This will restart the adventure from the beginning, with no ill effect to your character.

### Special developer cheats

To make testing and debugging easier, there are a few special commands you can enter within the game:

Teleport to a specific room:

    GOTO {room number}
    e.g., GOTO 1
    
Open the JavaScript debugger:

    DEBUGGER
    
This lets you inspect the current game state using your browser's developer tools.