import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game;

export var event_handlers = {

  "start": function(arg: string) {
    // monster talk effects
    game.monsters.get(1).data.talk = 1;  // maya
    // most monsters have a talk effect 200 + id
    game.monsters.all.forEach(m => {
      if (game.effects.get(200 + m.id)) {
        m.data.talk = 200 + m.id;
      }
    });
    // soldiers + inquisitors all say the same thing
    game.monsters.all.filter(m => m.name === 'soldier' || m.name === 'inquisitor').forEach(m => m.data.talk = 203);

    game.data = {
      ainha_maya: false,
      arrested: false,
      cf_defeated: false,
      defoliated: false,
      fine_due: false,
      jailbreak: false,
      house: false,
      maya_letter: false,
      maya_sees_orb: false,
      // talia: false
    };

    // monster combat effects and spells - TODO

    // items for sale
    for (let id of [28, 32, 33, 34, 35, 36]) {
      game.artifacts.get(id).data.for_sale = true;
    }
  },

  //region combat

  "attackDamage": function (attacker: Monster, defender: Monster, damage: number) {
    // shambling mound
    if (defender.data.engulfed === attacker.id) {
      return Math.floor(damage * 1.5);
    }
    return true;
  },

  "attackDamageAfter": function (attacker: Monster, defender: Monster, damage_dealt: number) {
    // shambling mound/assassin vine
    if (attacker.special === 'plant' && game.diceRoll(1,2) > 1) {
      // engulfs its target
      let name = defender.id === Monster.PLAYER ? 'you' : defender.name;
      if (attacker.id === 19) {
        game.history.write(`The shambling mound engulfs ${name} with its rotting tendrils!`, 'special');
      } else if (attacker.id === 21) {
        game.history.write(`Deadly vines wrap around ${name}!`, 'special');
      }
      defender.data.engulfed = attacker.id;
      if (defender.id === Monster.PLAYER) {
        defender.status_message = 'constricted';
      }
    }
  },

  "attackOdds": function (attacker: Monster, defender: Monster, odds: number) {
    // shambling mound/assassin vine
    return defender.data.engulfed === attacker.id ? 100 : odds;
  },

  "attackMonster": function(arg: string, target: Monster) {
    if (target.reaction !== Monster.RX_HOSTILE) {
      // soldiers and duke
      if (game.data.cf_defeated) {
        game.history.write("That wouldn't be very nice!");
      } else if ((target.special === 'cobalt' || target.special === 'inquisitor' || target.special === 'virrat') && game.data.jailbreak) {
        soldiersAttack();
        return true;
      } else if (target.special === 'cobalt' || target.special === 'inquisitor') {
        game.effects.print(28);
        goToJail();
      } else if (target.special === 'virrat') {
        game.effects.print(34);
        goToJail();
      } else {
        game.history.write("That wouldn't be very nice!");
      }
      return false;
    }
    return true;
  },

  "afterDeath": function(monster: Monster) {
    // free anyone engulfed by the dying monster
    game.monsters.all.filter(m => m.data.engulfed === monster.id)
      .forEach(m => {
        m.data.engulfed = false;
        m.status_message = '';
      });
  },

  "flee": function() {
    if (game.player.data.engulfed) {
      let m = game.monsters.get(game.player.data.engulfed);
      game.history.write(`You are held fast by the ${m.name} and cannot flee!`, "emphasis");
      return false;
    }
    return true;
  },

  //endregion

  "endTurn1": function () {
    // stuff that happens after room desc is shown, but before monster/artifacts

    // old man, after fight
    if (game.monsters.get(14).isHere() && !game.monsters.get(15).isHere()) {
      game.effects.print(12);
      game.monsters.get(14).destroy();
    }
    // magic weapon
    if (inquisitorIsHere() && game.player.weapon && game.player.weapon.type === Artifact.TYPE_MAGIC_WEAPON) {
      game.effects.print(13);
      game.player.weapon.moveToRoom(24);
      game.player.updateInventory();
      game.data.fine_due = true;
    }
  },

  "endTurn2": function() {
    let maya = game.monsters.get(1);
    // grandmother's house
    if (game.player.room_id === 35 && !game.data.house) {
      game.data.house = true;
      if (maya.isHere()) {
        game.effects.print(2);
        game.monsters.get(1).data.talk = 2;
      }
    }

    // maya / orb
    let orb = game.artifacts.get(5);
    if (orb.isHere() && maya.isHere() && !game.data.maya_sees_orb) {
      game.data.maya_sees_orb = true;
      game.effects.print(6);
      maya.data.talk = 6;
    }

    // maya / letter
    if (game.artifacts.get(8).isHere() && maya.isHere() && !game.data.maya_letter) {
      game.data.maya_letter = true;
      game.effects.print(8);
      maya.data.talk = 8;
    }

    // ainha / maya
    if (game.monsters.get(1).isHere() && game.monsters.get(33).isHere() &&
        !game.data.ainha_maya) {
      game.data.ainha_maya = true;
      game.effects.print(23);
    }

    // soldiers / orb
    if (orb.room_id === game.rooms.current_room.id) {
      // orb is on the ground
      game.effects.print(37);
      let inquisitor = game.monsters.get(6);
      game.monsters.visible.filter(m => isCobaltFront(m)).forEach(m => {
          m.moveToRoom(inquisitor.room_id);
          m.reaction = Monster.RX_NEUTRAL;
      });
    }
    if (game.player.hasArtifact(orb.id) && cobaltFrontIsHere()) {
      game.effects.print(15);
      game.monsters.visible.filter(m => isCobaltFront(m)).forEach(
        m => m.reaction = Monster.RX_HOSTILE
      );
    }

    // old mage (after escaping prison)
    if (game.monsters.get(34).isHere() && game.player.room_id !== 30) {
      game.effects.print(26);
      game.monsters.get(34).destroy();
    }

    // display items for sale
    let for_sale = game.artifacts.all.filter(a => a.data.for_sale && game.monsters.get(a.monster_id).isHere());
    if (for_sale.length) {
      game.history.write("Items for sale here: " + for_sale.map(a => a.name).join(', '));
    }

  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    if (game.data.fine_due && inquisitorIsHere()) {
      game.effects.print(32);
      return false;
    }
    return true;
  },

  "beforeOpen": function(arg: string, artifact: Artifact) {
    if (artifact && artifact.id === 16) {
      // vault door
      game.modal.show(`A slit slides open, and a voice says, "What's the password?"`, function(value) {
        if (value.toLowerCase() === 'owlfeather') {
          game.history.write("The door opens!", "success");
          artifact.is_open = true;
        } else {
          game.history.write(`"Go away!"`);
        }
      });
      return false;
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    if (isCobaltFront(recipient) && artifact.id !== 5) {
      game.effects.print(39);
      return false;
    }
    if ([3,4,5].indexOf(artifact.id) !== -1 && !isCobaltFront(recipient)) {
      if (recipient.special === 'quest') {
        game.history.write(`${recipient.name} says, "Hold on to that. Don't give it to anyone until you free the prisoners.`);
      } else {
        game.history.write(`${recipient.name} says, "Is that magic? Better keep it hidden!"`);
      }
      return false;
    }
    return true;
  },

  "afterGive": function(arg: string, artifact: Artifact, recipient: Monster) {
    let inquisitor = game.monsters.get(6);
    if (artifact.id === 5 && isCobaltFront(recipient)) {
      game.effects.print(36);
      game.monsters.visible.filter(m => isCobaltFront(m)).forEach(m => {
          m.moveToRoom(inquisitor.room_id);
          m.reaction = Monster.RX_NEUTRAL;
      });
    }
  },

  "say": function(phrase) {
    phrase = phrase.toLowerCase();
    if (phrase === 'irkm desmet daem' && game.player.hasArtifact(5)) {
      if (game.artifacts.get(24).isHere() || game.artifacts.get(23).isHere()) {
        game.effects.print(21);
        game.artifacts.get(23).destroy();
        game.artifacts.get(24).destroy();
        game.artifacts.get(37).moveToRoom(39);
        game.artifacts.get(38).moveToRoom(22);
        game.data.jailbreak = true;
      } else {
        game.effects.print(20);
      }
    }
  },

  "seeMonster": function(monster: Monster): void {
    switch (monster.id) {
      case 1:
        game.effects.print(1);
        break;
      case 18:
        game.effects.print(14);
        break;
      // case 34:  // old mage
      //   if (game.data.arrested) {
      //     game.effects.print(24);
      //   }
      //   break;
    }
  },

  "seeRoom": function() {
    // prisoners
    if (game.rooms.current_room.id === 29 || game.rooms.current_room.id === 27) {
      game.effects.print(29);
    }
  },

  "beforeSpell": function(spell_name: string) {
    // get arrested
    if (cobaltFrontIsHere()) {
      if (game.data.jailbreak) {
        soldiersAttack();
        return true;
      } else {
        game.effects.print(27);
        goToJail();
      }
      // maya
      // if (game.monsters.get(1).isHere()) {
      //   if (game.data.talia) {
      //     game.monsters.get(1).moveToRoom(67);
      //   }
      // }
      return false;
    }
    return true;
  },

  "use": function(arg, artifact) {
    switch (artifact.id) {
      case 3:  // wand
        let plant_monsters = game.monsters.all.filter(m => m.special === 'plant');
        if (plant_monsters.length) {
          plant_monsters.forEach(m => m.injure(game.diceRoll(1, 10)));
        }
        if (game.artifacts.get(10).isHere()) {
          game.effects.print(17);
          game.artifacts.get(10).destroy();
        }
        if (game.artifacts.get(11).isHere() && !game.data.defoliated) {
          game.effects.print(18);
          game.artifacts.get(5).moveToRoom();
          game.data.defoliated = true;
        } else {
          game.history.write("Some nearby weeds shrivel and die.");
        }
        break;
      case 5: // orb
        game.effects.print(19);
        break;
    }
  },

  // every adventure should have a "power" event handler.
  // 'power' event handler takes a 1d100 dice roll as an argument.
  // this event handler only runs if the spell was successful.
  "power": function(roll) {
    if (game.data.arrested && game.player.room_id === 30) {
      game.effects.print(25);
      game.rooms.get(30).createExit('u', 36);
      return;
    }

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

}; // end event handlers

export function isCobaltFront(monster: Monster) {
  return monster.special === 'cobalt' || monster.special === 'inquisitor';
}

export function cobaltFrontIsHere(include_hostile = false) {
  if (include_hostile) {
    return game.monsters.visible.some(m => isCobaltFront(m));
  }
  return game.monsters.visible.some(m => isCobaltFront(m) && m.reaction !== Monster.RX_HOSTILE);
}

export function inquisitorIsHere(include_hostile = false) {
  if (include_hostile) {
    return game.monsters.visible.some(m => m.special === 'inquisitor');
  }
  return game.monsters.visible.some(m => m.special === 'inquisitor' && m.reaction !== Monster.RX_HOSTILE);
}

function goToJail() {
  game.player.inventory.forEach(a => a.moveToRoom(24));
  game.player.updateInventory();
  game.player.moveToRoom(30, false);
  game.data.arrested = true;
}

function soldiersAttack() {
  game.effects.print(35);
  game.monsters.all
    .filter(m => isCobaltFront(m) || m.special === 'virrat')
    .forEach(m => m.reaction = Monster.RX_HOSTILE);
}
