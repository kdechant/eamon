# Eamon Adventure Design Manual - Event Handlers

In Classic Eamon for the Apple 2 and Eamon Deluxe for MS-DOS, adventure designers could edit the "Main Program" as they
 pleased to insert custom features into the game, such as a special effect when the player picks up an item, drinks
 a potion, enters a specific room, etc.
 
This system made sense at the time, but required each adventure to keep its own copy of the main program and all the
core logic. With over 250 adventures, it becomes difficult to keep each one up to date with bug fixes and new features
of the core engine.

In the web-based Eamon, all adentures share the core game logic, which provides basic features like moving, getting
 items, combat, etc. A system of event handlers is used to allow adventure designers the capability to insert their
 own special effects at important points in the game.
 
## How do I use event handlers?

Each adventure contains its own "event-handlers.ts" file. This contains all the event handlers for the adventure.

Event handlers are just TypeScript functions which take a few parameters. The parameters themselves vary with each event
handler, but they make sense for the type of event that is occurring. A "use item" handler might accept the artifact
object as an parameter, while a "say" event handler might accept the word being said as its parameter.

An example of a simple event handler:
    
      "say": function(phrase: string) {
        let game = Game.getInstance();
        if (phrase === 'magic' && game.artifacts.get(5).isHere()) {
          game.history.write("POOF!!", "special");
          game.artifacts.get(5).destroy();
        }
      },

What happened here?
- The "say" event handler takes one parameter, the phrase being said
- We can test for the phrase. In this case, we test if the player says "magic" while carrying artifact #5
- If true, we call `game.history.write()` to print a string to the output, using the "special" color (blue)
- We also destroy artifact #5. This removes it from the player's inventory and the game.

Some event handlers also return a value, usually a boolean. This is a signal to the core code that processing on that
event should continue, or stop. For example, a "beforeMove" handler might return `false` if the movement should be
prevented.

Another example:
    
      "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
        let game = Game.getInstance();
        if (exit.room_to === -1) {
          // print an effect -- can't go that way
          game.effects.print(3);
          return false;
        }
        return true;
      },
  
What happened here?
- The "beforeMove" handler takes three parameters, the direction the player typed in, the Room object for the room the
 player is *currently* in, and the RoomExit object representing the exit the player is trying to take.
- The adventure designer has used a special exit code of -1 to indicate a connection that requires special handling
- We use `game.effects.print()` to print a specific event text from the `effects` table in the database
- We return *false* here to prevent the player from moving
- The event handler is called for all player movement, not just movement to exit -1. Thus, we need to return true
 if no conditions were met.

# Example event handlers

The following is a list of all the available event handlers, how they're used, and a sample handler of each type.

## Game Intro

The "intro" event handler is called after the game data is initialized, right as the intro text is shown. Use this to 
alter the intro text if you need to.

Parameters: none

Sample code:

      "intro": function() {
        let game = Game.getInstance();
        // change the intro text if the player is female
        if (game.player.gender === 'f') {
          game.intro_text = game.intro_text.replace("Larcenous Lil", "Slippery Sven");
        }
      },

## Game Start

The "start" eveny handler runs once at the very beginning of the game. Use this to set up initial variables and move
monsters and artifacts around before the player can interact with them. Any text or effects printed in this event 
handler will appear at the very beginning of the game output. To change the pre-game intro text, use the "intro"
event handler instead.

Parameters: none

Sample code:

      "start": function() {
        let game = Game.getInstance();
    
        // declare some variables
        game.data['my var'] = true;
        game.data['another var'] = 5;
        
        // give monster #1 custom attack messages
        game.monsters.get(1).combat_verbs = ["breathes fire at", "claws at", "swings its tail at"];
        
        // move monster #2 to a random room
        game.monsters.get(2).moveToRoom(game.diceRoll(1,6));
      },

## End of Turn

There are three useful event handlers that happen at the end of each turn. These are used in many adventures and it
helps to be familiar with them. They happen in this order:

1. The monsters take their turns (attacking, picking up weapons, etc.)
1. The `endTurn` event handler runs
1. The room name or description is shown
1. The `endTurn1` event handler runs
1. The artifact and monster names or descriptions are shown
1. The `endTurn2` event handler runs

All these event handlers are called with no arguments. You may access the game variables like `game.player`, `game.rooms`,
 `game.artifacts`, `game.monsters`, etc. from within your event handlers.

Examples:

### End Turn

This happens after movement and monster actions, but before the room name or description is shown.

      "endTurn": function() {
        let game = Game.getInstance();
    
        // merlin appears, if he hasn't already appeared
        if (game.player.room_id == 77 && !game.effects.get(11).seen) {
          game.effects.print(11);
          game.monsters.get(48).moveToRoom();
        }
      },

### End Turn 1

This happens after the room name or description is shown, but before the artifact and monster names or descriptions are shown. 

      "endTurn1": function () {
        let game = Game.getInstance();
        
        // the snowman melts when entering a room that's too warm
        if (room_id == 37 && game.monsters.get(2).isHere()) {
            game.history.write("Frosty just melted!", "special2");
            game.monsters.get(2).destroy();
        }
      }

### End Turn 2

This happens at the very end of the turn, after all names and descriptions are shown.

      "endTurn2": function() {
        let game = Game.getInstance();
    
        // a sudden death trap that occurs if a certain monster is in the room
        if (game.monsters.get(1).isHere()) {
          game.effects.print(5);
          game.die();
        }
      },

## Before Move and After Move

This is a pair of event handlers which provides special logic around player movement.

### Before Move

`beforeMove()` is called immediately before the player moves. It can do a special
effect, or it can block the movement if a condition isn't met.

* NOTE: Don't use beforeMove() to implement basic "locked door" logic. This is built into the core game engine.

Parameters: 
- arg (string): the direction the player entered (n, s, e, w, u, d, etc.)
- room (Room): The Room object of the room the player is moving *from*
- exit (RoomExit): The RoomExit object the player is trying to follow.

Sample:

      "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
        let game = Game.getInstance();
    
        if ((exit.room_to === -5 && !game.data["elevator on"]) {
          game.history.write("The elevator must first be turned on.");
          return false;  // this prevents movement. player will stay in current room
        } else {
          switch (exit.room_to) {
            case -5:
              // going up, after elevator has been turned on
              exit.room_to = 5;
              break;
          }
        }
        // any other connections return true. this allows movement unimpeded.
        return true;
      },

### After Move

`aftermove()` is triggered immediately after the player completes his/her movement. Use this to trigger a special effect
that happens as soon as a player enters a new room. Any text displayed in this event handler will appear before any combat
text and room descriptions shown in this turn.

Parameters:
- arg (string): the direction the player entered (n, s, e, w, u, d, etc.)
- room_from (Room): The Room object that the player moved *from*
- room (Room): The Room object that the player moved *to*
    
Sample:

      "afterMove": function(arg: string, room_from: Room, room_to: Room) {
        let game = Game.getInstance();
        // show a warning when entering this room
        if (room_to.id === 28 && !game.data["player was warned"]) {
          game.data["player was warned"] = true;
          game.history.write("You are in grave danger", "emphasis");
        }
      },

## Open and Close

These effects are common with doors and containers.

### Open


### Close

This is called when the player tries to close an artifact like a container or door. It can be used to handle situations
where the player shouldn't be able to close something (like a door that's been broken open), or when a player should
try to close something that is not an explicit artifact.

Parameters:
- arg (string) - What the player typed after CLOSE (e.g., "close *chest*" or "close *window*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in the current room or in the player's inventory, this will contain the Artifact object.

Example:

    "close": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        // trying to close a drawbridge when the winch has been smashed
        if (artifact.name === 'drawbridge' && game.data['drawbridge winch smashed']) {
          game.history.write("The winch has been smashed. You can't close it.");
          return false; // stops the game from running the rest of the "close" command logic
        }
        return true; // normal situation not handled above; resume regular command logic
      },
    },

A note on standard doors/gates and containers like chests or bags:

These common types of artifacts are handled by the core game and don't require a custom event handler. Set the artifact type to "Door/Gate" (8) or "Container" (4). Optionally give it a "key_id" to lock it using that artifact ID, or put items into a container by setting their "container_id" property to the ID of the container artifact.

## Eat

This is called when the player tries to eat something. It can be used to handle situations where the player needs
to eat something that is not an explicit artifact, or to prevent eating an otherwise edible artifact.

Parameters:
- arg (string) - What the player typed after EAT (e.g., "eat *donut*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in the current room or in the player's inventory, this will contain the Artifact object.

Example:

    "eat": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        if (artifact && artifact.name === 'poison donut') {
          game.history.write("You don't like the smell of that donut. Better not eat it.");
          return false; // stops the game from running the rest of the "eat" command logic
        }
        return true; // normal situation not handled above; resume regular command logic (healing food, etc.) 
      },
    },

## Drink

This is called when the player tries to drink something. It can be used to handle situations where the player needs
to drink something that is not an explicit artifact. For example, to order a drink at a bar.

Parameters:
- arg (string) - What the player typed after DRINK (e.g., "drink *water*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in the current room or in the player's inventory, this will contain the Artifact object.

Example:

    "drink": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        // use the "drink" command (with no arguments) to order a drink from the bartender
        if (game.player.room_id === 5) {  // the bar
          game.history.write("The bartender pours you a drink.");
          game.artifacts.get(6).moveToRoom(); // moves the "beer" artifact to the current room
          return false; // stops the game from running the rest of the "drink" command logic
        }
        return true; // normal situation not handled above; resume regular command logic (healing potions, etc.) 
      },
    },

A note on healing potions and healing food items:

These common types of artifacts are handled by the core game and don't require a custom event handler. Set the artifact type to "Edible" (9) or "Drinkable" (6), then set the dice and sides to match the amount of healing effect you want.

## Use

The `use()` handler is called whenever a player tries to USE an artifact. This includes eating or drinking artifacts. (Healing potions and healing food are built into the core game, but other special effects should use this event handler).

Parameters:
- arg (string) - What the player typed after USE (e.g., "use *lever*" )
- artifact (Artifact) - If the player's text matched the name of an artifact in the current room or in the player's inventory, this will contain the Artifact object.

Example:

    "use": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        if (artifact) {
          if (artifact.name === 'strength potion') {
            game.history.write("The potion increased your hardiness!", "special")
            game.player.hardiness++;
          }
        }
      },
    },

The example above works for using a specific artifact. You can also program in special effects for other strings that aren't artifacts.

Example 2:

    "use": function(arg: string, artifact: Artifact) {
        let game = Game.getInstance();
        if (arg === "the force") {
          game.history.write("You pull the light saber to you using the Force.");
          game.artifacts.get(10).player_id = Monster.PLAYER;
        }
      },
    },

A note on healing potions and healing food:

These common types of artifacts are handled by the core game and don't require a custom event handler. Set the artifact type to "Edible" (9) or "Drinkable" (6), then set the dice and sides to match the amount of healing effect you want.

## Give

The "give" event is triggered when the player tries to give an artifact to an NPC. It runs just before the actual artifact transfer occurs.
 
Parameters:
- arg (string) - What the player typed after USE (e.g., "give *sword to alfred*" )
- artifact (Artifact) - What the player is trying to give
- recipient (Monster) - To whom the player is trying to give it

Example:

      "give": function(arg: string, artifact: Artifact, recipient: Monster) {
        let game = Game.getInstance();
        // ranger
        if (recipient.id === 11) {
          game.history.write(recipient.name + " is still pretending that you aren't here.");
          return false;
        }
        return true;
      },

## Combat

### Fumble

This is called whenever a monster fumbles. You can change the fumble behavior, e.g., preventing cursed weapons from
being dropped accidentally.

Parameters:
- attacker (Monster) - The monster doing the attacking. This is the one who fumbled.
- defender (Monster) - The monster being attacked
- fumble_roll (number) - A random number from 1-100 which was rolled by the combat routine, to determine the fumble type:

1-40 = fumble recovered
41-80 = weapon dropped
81-85 = weapon hits user
86-95 = weapon damaged
96-99 = weapon broken (with potential to hurt user)
100 = weapon broken, hurts user with extra damage

Example:
    
      "fumble": function(attacker: Monster, defender: Monster, fumble_roll: number) {
        let game = Game.getInstance();
        // cannot drop a cursed weapon
        if (attacker.id === 0 && attacker.weapon.name === 'hellsblade') {
          game.history.write("-- fumble recovered!", "no-space");
          return false;
        }
        return true;  // otherwise, use regular fumble logic
      },

### Attack Odds

The "attackOdds" event handler is called when a monster attacks another monster, after the standard odds have been
calculated, but before the hit check is performed. It can adjust the odds to, for example, make a monster harder or
easier to hit based on a game condition like having an artifact, or a special type of monster.

Any output printed by this event handler will appear before the "Monster1 swings at Monster2" combat message.

Parameters:
- attacker (Monster) - The monster doing the attacking. This is the one who fumbled.
- defender (Monster) - The monster being attacked
- odds (number) - The normal to-hit odds for the attacker, calculated by the combat routine. This is a number from 0-100
representing a percentage, though it may in rare cases be outside the range of 0-100.

Return value:
This can return true if no adjustment should be made, or it can return a number representing the new "to hit" odds.

Example:

      "attackOdds": function (attacker: Monster, defender: Monster, odds: number) {
        let game = Game.getInstance();
        // the umber hulk's gaze makes it harder to hit
        if (attacker.id === Monster.PLAYER && defender.name === 'Umber Hulk') {
          game.history.write("Your vision seems to swim making it hard to concentrate on fighting.");
          return odds - 10;
        }
        return true;  // this makes the game use the normal odds in situations not covered above.
      },

### Attack Damage

The "attackDamage" event handler is called when a monster attacks another monster, after the standard damage amount
 has been calculated, but before the damage is dealt. It can adjust the damage amount to, for example, create a
 magic spell that makes the player do more damage, or make a certain monster resistant to damage from a specific
 weapon.

Any output printed by this event handler will appear after the "Monster1 swings at Monster2" combat message.

Parameters:
- attacker (Monster) - The monster doing the attacking. This is the one who fumbled.
- defender (Monster) - The monster being attacked
- damage (number) - The normal damage done by the attacker, calculated by the combat routine, measured in hit points

Return value:
This can return true if no adjustment should be made, or it can return a number representing the new "to hit" odds.

Example:

      "attackDamage": function (attacker: Monster, defender: Monster, odds: number) {
        let game = Game.getInstance();
        // a dragon-slaying weapon
        if (attacker.weapon.name === 'dragonlance' && defender.name === 'green dragon') {
          return damage * 2;
        }
        return true;  // this makes the game use the normal odds in situations not covered above.
      },

### Armor Class

The "armorClass" event handler allows you to customize the player's armor class. It is called every time a monster's inventory and armor are recalculated, just after the normal calculation is performed. It can adjust the armor class depending on game conditions, e.g., whether a certain spell is active.
 
If present, this event handler will be called frequently, so it is not recommended to output any messages.

Parameters:
- monster (Monster) - The monster whose armor class is being calculated

Example:
    
      "armorClass": function (monster: Monster) {
        let game = Game.getInstance();
        if (monster.id === Monster.PLAYER && monster.spell_counters['protection'] > 0) {
          // protection spell ac bonus
          monster.armor_class += 3;
        }
      },

## Magic spells

There are several events related to casting spells. These include the POWER spell which has no built-in functionality but relies entirely on event handlers.
 
### Power 

The base adventure includes a default implementation of POWER, but you should customize it to your needs.

Parameters:
- roll (number) - a dice roll from 1 to 100. This is the roll to determine the Power effect. It is not the roll for spell success. This event handler is called only if the spell has succeeded.

Example:

      "power": function(roll) {
        let game = Game.getInstance();
        if (roll <= 50) {
          game.history.write("You hear a loud sonic boom which echoes all around you!");
        } else if (roll <= 75) {
          // teleport to random room
          game.history.write("You are being teleported...");
          let room = game.rooms.getRandom();
          game.player.moveToRoom(room.id);
          game.skip_battle_actions = true;
        } else {
          game.history.write("All your wounds are healed!");
          game.player.heal(1000);
        }
      },

### Blast

This is called when the player tries to use the BLAST spell on a monster. Return false to prevent the spell from affecting the target. Otherwise, this should return true, or the spell will not work. 

Example:

      "blast": function(arg: string, target: Monster) {
        let game = Game.getInstance();
        // this monster disappears if blasted
        if (target.id === 20) {
          game.effects.print(21);
          game.monsters.get(20).room_id = null;
        }
        return true;
      },

### Before a Spell

The "beforeSpell" event handler is a general-purpose handler that can be called before any spell is cast. It can alter the spell or prevent it from firing.

Parameters:
- spell_name (string) - The name of the spell ("blast", "heal", "power", or "speed")

Example:

      "beforeSpell": function(spell_name: string) {
        let game = Game.getInstance();
        // this prevents all spell casting in a certain room
        if (game.player.room_id === 7) {
          game.history.write("This is an anti-magic area!");
          return false;
        }
        // this prevents only POWER in a different room
        if (game.player.room_id === 8 && spell_name === 'power') {
          game.history.write("A wizard's magic has prevented the POWER spell from working in this area!");
          return false;
        }
        return true;
      },

## Monster Action

To make a monster do something special during its turn, instead of the usual combat routine, you can use the
"monsterAction" event. This is triggered each turn during a monster's normal combat phase. If the function returns
false, the normal combat action will be skipped. If the function returns true, this means that the event handler
did nothing, and the monster will perform its normal combat actions (attacking, fleeing, picking up a weapon).

Parameters:
- monster (Monster) - The monster whose turn it is

Example:

      "monsterAction": function(monster: Monster) {
        let game = Game.getInstance();
    
        // this monster knows a "heal" spell and will sometimes cast it if injured
        if (monster.id === 17 game.diceRoll(1,3) === 3 && monster.damage > monster.hardiness * 0.4) {
          game.history.write(monster.name + " casts a heal spell!");
          let heal_amount = game.diceRoll(2, 6);
          monster.heal(heal_amount);
          return false; // skip the default combat actions
        }
        return true;
      },

## After selling items

The `afterSell` event handler provides extra logic on the final screen of the game, after the player has sold treasures to Sam Slicker, but before the return to the Main Hall. This is useful for giving a reward to the player for completing a quest.

In this event handler, you will need to use `game.exit_message.push()` instead of the usual `game.history.write()` to display output to the player.

Parameters: none

Example:

      "afterSell": function() {
        let game = Game.getInstance();
        let cynthia = game.monsters.get(3);
        // Duke Luxom's Reward - given if Cynthia made it to the exit and still likes the player.
        // The "here" in "isHere()" refers to the last room the player was in before stepping out the exit.
        if (cynthia.isHere() && cynthia.reaction !== Monster.RX_HOSTILE) {
          let reward = game.player.charisma * 10;
          game.exit_message.push("Additionally, you receive " + reward + " gold pieces for the safe return of Cynthia.");
          game.player.gold += reward;
        }
      },

# Requesting player input

In some event handlers, you may need to ask for additional input from the player before proceeding. For this purpose, the game engine contains a "modal" object which displays a prompt.

Function: `game.modal.show()`

Parameters:
- text (string) - The text of the question to ask the player
- callback (function) - A TypeScript function to run as a callback. Within this function, check if the player's answer matches what you expected.

Example:

      "open": function(arg: string, artifact: Artifact, command: OpenCommand) {
        let game = Game.getInstance();
        // open a vault door with a combination lock
        if (artifact !== null && artifact.id === 3) {
          command.opened_something = true; // specific to "open" event handler - this suppress the built-in messages
          
          // show the modal here
          game.modal.show("Enter combination (use dashes):", function(value) {
            if (value === '11-16-27') {
              game.history.write("The vault door opened!", "success");
              artifact.is_open = true;
            } else {
              game.history.write("The vault door did not open.");
            }
          });
          
        }
      },

The modal handles the logic for collecting the user's input and pausing the game clock until the player answers the question. The text the user entered will be available in the `value` parameter of the callback function.

The modal is designed to work in early-turn event handlers like "beforeMove", "open", and "use". Due to the animation of Eamon's results display, it should not be used in "endTurn" event handlers, as it may behave unpredictably.
