# Eamon Adventure Design Manual

So you want to build an Eamon adventure? This requires some basic knowledge of databases, JavaScript programming, and using a command-line terminal.

Eamon is built on ReactJS and Django, but you don't need in-depth knowledge about either to contribute. You can build an entire adventure with no programming if you use the built-in features. Or, to add custom special effects, all you need to know is a bit of JavaScript. (Eamon is written in TypeScript, which is just a fancier version of JavaScript and is easy to learn if you already know JavaScript.)

## Getting started

## Prerequisites

For the manual install, you'll need the following:

* Python v3.10.x or higher
* Node.js v10.x or higher

The tools required to run Eamon are compatible with Linux, Windows 10, and OSX.

## Setup instructions

* Open a terminal or PowerShell and navigate to the repository root
* Copy the base database file (`db/eamon.sqlite3.dist`) to a new file named `db/eamon3.sqlite3`
    * Best to copy this and not rename it, so Git doesn't think the file is modified
* Create a "local settings" file from the base one in the repo:
    * `cp eamon/local_settings_example.py eamon/local_settings.py`
    * Best to copy this and not rename it, so Git doesn't think the file is modified
* Install pipenv: `pip3 install pipenv` (or just `pip install pipenv` if your system Python is v3.x)
* Install the packages: `pipenv install`
* Activate the pipenv shell with `pipenv shell`
* Create a user for the admin: `python manage.py createsuperuser`
* Run `python manage.py runserver`
    * If you're using PyCharm, you can skip this step and set up your development server inside PyCharm itself. This provides the ability to use step debugging in the Python code.
* Open a second command prompt and navigate to the "client" folder
* Install React and other JS packages using `npm install`
* Run `npm start`
* Open your web browser and navigate to http://localhost:8000. You should see the Eamon welcome screen.

URLs:
Eamon home page: http://localhost:8000
Admin page (for building adventure data): http://localhost:8000/admin
To log into the admin, use the username and password you used when you ran the "createsuperuser" command above.

## Yarn or NPM?

If you want to use Yarn instead of NPM, you can run `yarn import` then `yarn` to install packages.
You can then use `yarn` instead of `npm` in all the `npm` commands described here. I no longer
keep a `yarn.lock` file in the repo because it's one more thing to maintain.

## Creating and Editing Adventures

You can edit your adventure and its rooms, artifacts, effects, and monsters using the admin site. This provides basic forms for listing adventure content and creating and editing.

The adventure objects are defined in the following tables in the database:

* adventure_adventure
* adventure_room
* adventure_roomexit
* adventure_artifact
* adventure_effect
* adventure_monster
* adventure_hint
* adventure_hintanswer

### Using Markdown and HTML in text blocks

Most of the larger blocks of text support Markdown to allow finer control over the formatting. This uses GitHub-flavored Markdown. [See the official documentation for a syntax reference](https://guides.github.com/features/mastering-markdown/).

Example:

```md
This is regular text

**This is bold**

**_This is italic_**

`a code block` which will be rendered in a monospaced, pinkish font (for better ways to create colors, see below.)

An image: ![alt text here](http://example.com/some/image/path.jpg)
```

You can also mix in some basic HTML with the Markdown. This is mainly useful to create colored text:

```md
<span style="color: blue;">This text is blue</span>
```

Note that you can also create colored text for Effects by setting the Effect's "style" field. See EVENT-HANDERS.md for examples of the available styles.

### Creating your adventure

First, create an Adventure. The following fields are important:

* name - The title of the adventure (e.g., "The Beginner's Cave")
* slug - The slug is used to build the URL and should contain letters, numbers, and hyphens (e.g., 'the-beginners-cave')
* description - This is shown in the adventure list in the Main Hall
* intro_text - This is shown to the player at the very beginning of the adventure. Supports Markdown. If you want to split it into multiple pages, separate them with a line containing only three hyphens ('---')
* intro_question - If you want to ask a question to the player on the intro screen, put the question in the `intro_question` field.
* active - Adventures must have this flag set to 1 before they will appear in the Adventure List in the Main Hall
* tags - A comma-separated list of tags, which can be used to filter the adventure list
* authors - One or more authors for the adventure. For Classic Eamon or Eamon Deluxe adventures ported to Eamon Remastered, this should be the original author's name (e.g., Donald Brown or John Nelson)

The fields with names beginning with `EDX`, as well as the `first_hint` and `last_hint` fields, are used for importing data from the EDX databases. For new adventures, leave these blank.

### Adding rooms

From the admin dashboard, click "+ Add" next to "Rooms" to create a new room.

Fields are:

- Adventure: Choose the adventure you created above in the drop-down
- Room ID: Give it an ID number. Room 1 is the where the player will start. Typically, rooms are numbered sequentially starting with 1, though the program currently won't calculate this for you.
- Name
- Text format - Use "Plain Text" unless you need custom formatting. Use "Markdown" to allow Markdown formatting in the description.
- Description - Unlike Classic Eamon, this can contain as much text as you like.
- Is Dark - Check this box if the room is dark and requires a light source

#### Room Exits

Each room typically has one or more exits, connecting it to other rooms.

Fields are:

- Direction: n, e, s, w, ne, se, sw, nw, u, d
- Room To: The room id of the destination room. Enter -999 for the exit to the main hall. Other negative numbers may be used for special connections. These will require a custom event handler.
- Door ID: If this connection is blocked by a door, enter the artifact ID of the door. Leave blank if there is no door.
- Message: currently unused

### Artifacts, Effects, and Monsters

Adding/editing artifacts and monsters is generally the same as adding/editing rooms. Most of the fields on the form contain help text that will explain the purpose of the field.

### Hints

If you want to provide special hints in your adventure, add these to the `adventure_hint` and `adventure_hintanswer` tables. These can be edited in the admin interface, as well.

Each hint can have one or more answers. If there is more than one, the game will show "next" and "previous" links to page through them. Hint answers support Markdown.

Some hint answers may contain spoilers. There is a special "spoiler" flag that can be set on each answer, which will blur the text until the player clicks a link to reveal it.

## Programming Custom Commands and Event Handlers

Make a copy of the folder "static/adventures/base-adventure". Name it the machine-friendly slug of your adventure (e.g., "the-beginners-cave").

You should have the following files:

    static/
        adventures/
            your-adventure/
                index.ts
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
* Weapons, both normal and magic
* Armor and other wearable items
    *  Any artifact of the "wearable" type can be worn by the player, but you will need to add custom event handlers if these should have any effect beyond changing the player's armor class
* Light sources, including ones that can run our of fuel
* Containers like chests, bags, and backpacks
* Disguised monsters, such as the chest mimic in the Beginner's Cave
* Bound monsters, such as prisoners, who need to be freed
* Monsters that live inside containers, which appear as soon as you open the container (e.g., a vampire in a coffin)

### Event handler examples

There are dozens of different event handlers, each with its own unique implementation.

Examples include:

* Game start and custom variable initialization
* Movement and custom exit codes
* Using items
* Giving items to NPCs
* Attacking monsters (and being prevented from attacking)
* Setting off a trap when opening a container
* Random effects of the POWER spell

See EVENT-HANDERS.md for full documentation and examples of each.

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

## Automated testing

Eamon has a suite of tests which test both the core game logic and also the custom logic for many of the adventures. These tests use the Jest test framework and can be called from the terminal or PowerShell.

_Make sure the Django development server is running_, then run:

```
cd client
npm run test
```

Tests can also be run one file at a time, which is much faster than running the whole suite. To run a single test, append a filename to the command, like this:

```
npm run test adventures/the-beginners-cave/event-handlers.spec.ts
```

To keep watching and compiling the Typescript files between test runs, the easiest way is to have two terminals open.
In the first terminal, kick off `npm start` and leave it running. In the second terminal, run the tests via the commands
above. You can then edit some code and run the tests again to see the result.

## Running your adventure

After you have created some rooms, artifacts, effects, and monsters, and created the "commands.ts" and "even-handlers.ts" files, it's time to give it a try.

Go to your browser and reload the Eamon tab. You should be able to load your character and go on your adventure.

If you're already in the adventure and you want to reload your latest changes, it's safe to just hit the "Reload" button. This will restart the adventure from the beginning, with no ill effect to your character.

### Special developer cheats

To make testing and debugging easier, there are a few special commands you can enter within the game:

Teleport to a specific room:

    XGOTO {room number}
    e.g., XGOTO 1

Get an artifact from anywhere in the adventure:

    XACCIO {artifact name}
    e.g., XACCIO TROLLSFIRE

Open the JavaScript debugger:

    XDEBUGGER

This lets you inspect the current game state using your browser's developer tools. It only works if the developer panel is already open.

## Exporting Adventure Data

The rooms, artifacts, effects, monsters, and hints data for an adventure can be exported to a
JSON file. This allows it to be committed to Git, and also allows moving adventure data from one
computer to another.

To export an adventure's data, run the following command:

    python manage.py dump_adventure <adventure id>

Put the number of your adventure in the command in place of `<adventure id>`, e.g.,

    python manage.py dump_adventure 123

This will create a .json file in /adventure/data. You can then commit the file to Git, or email it
to someone else if necessary.

To load the adventure data from a .json file, run the following command:

    python manage.py loaddata path/to/datafile.json
    e.g.:
    python manage.py loaddata adventure/data/001-the-beginners-cave.json

Note: There is currently no safeguard to prevent overwriting data. If the JSON file contains objects
with the same IDs as other new rows you created in your DB, they will be overwritten. (This is not
likely, unless you were editing two different adventures at once.)

## Porting Adventures from Classic Eamon or Eamon Deluxe

Many of the adventures in Eamon Remastered are ports of adventures from these legacy systems. There are separate instructions for porting an adventure from each of these systems:

[Porting Adventures from Eamon Deluxe 5.0](PORTING-EDX-ADVENTURES.md)
[Porting Adventures from Classic Eamon](PORTING-CLASSIC-ADVENTURES.md)
