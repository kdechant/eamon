import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game: Game;

export var event_handlers = {

  "start": function (arg: string) {
    game.show_exits = true;

    // monster talk effects
    game.monsters.get(1).data.talk = 1;  // maya
    // soldiers + inquisitors all say the same thing
    game.monsters.all.filter(m => m.name === 'soldier' || m.name === 'inquisitor').forEach(m => m.data.talk = 203);
    // many monsters have a talk effect equal to 200 + id
    game.monsters.all.forEach(m => {
      if (game.effects.get(200 + m.id)) {
        m.data.talk = 200 + m.id;
      }
    });

    game.data = {
      ainha_maya: false,
      arrested: false,
      cf_defeated: false,
      defoliated: false,
      fine_due: false,
      jailbreak: false,
      house: false,
      letter_duke: false,
      letter_maya: false,
      letter_velatha: false,
      maya_sees_orb: false,
      velatha_sees_orb: false,
      old_man_rescued: false,
      given_ring: false,
      maya_healed: false,
    };

    // monster combat effects and spells
    game.monsters.get(19).combat_verbs = ['gropes at', 'slithers toward', 'heaves rotting vegetation at'];
    game.monsters.get(20).combat_verbs = ['swings a branchlike arm at', 'shoots lightning bolts toward', 'flails at'];
    game.monsters.get(21).combat_verbs = ['snaps a razor-sharp tendril at', 'whips a vine toward', 'bites at'];
    game.monsters.get(38).combat_verbs = ['bites at', 'chews on', 'wallops'];
    game.monsters.get(30).spells = ['blast', 'heal'];
    game.monsters.get(30).spell_points = 10;
    game.monsters.get(30).spell_frequency = 40;
    let mage_verbs = ['conjures a firebolt at', 'swings at', 'shoots lightning at'];
    game.monsters.get(31).children.forEach(c => c.combat_verbs = mage_verbs);

    game.monsters.get(1).health_messages = [
      "is in perfect health.",
      "is in good shape.",
      "is hurting.",
      "is in pain.",
      "is very badly injured.",
      "is barely standing!",
      "is knocked unconscious!"
    ];

    // items for sale
    for (let id of [28, 32, 33, 34, 35, 36]) {
      game.artifacts.get(id).data.for_sale = true;
    }
    // no teleport into jail (22-30), safe house (67-68), or castle (51-54)
    game.data.no_teleport_rooms = [22, 23, 24, 25, 26, 27, 28, 29, 30, 51, 52, 53, 54, 67, 68];
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
    if (attacker.special === 'plant' && !defender.data.engulfed && game.diceRoll(1, 2) > 1) {
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
    // chance to break free if engulfed
    if (attacker.data.engulfed === defender.id && game.diceRoll(1, 2) > 1) {
      breakFree(attacker);
    }
    // thugs
    if (defender.id === 15) {
      if (defender.children.some(m => m.damage > m.hardiness * 2 / 3)) {
        game.effects.print(50);
        defender.destroy();
      }
    }
  },

  "attackOdds": function (attacker: Monster, defender: Monster, odds: number) {
    // shambling mound/assassin vine
    return defender.data.engulfed === attacker.id ? 100 : odds;
  },

  "attackMonster": function (arg: string, target: Monster) {
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

  "afterDeath": function (monster: Monster) {
    // free anyone engulfed by the dying monster
    game.monsters.all.filter(m => m.data.engulfed === monster.id).forEach(breakFree);
    // last bandit drops the key
    // TODO: make this a core feature of group monsters, that the last one drops
    //  any non-weapon artifacts in the group inventory
    // if (monster.parent && monster.parent.id === 22 && !game.monsters.get(22).children.some(c => c.isActive())) {
    //   game.monsters.get(22).inventory.forEach(a => a.moveToRoom());
    // }
  },

  "attackArtifact": function(arg: string, target: Artifact) {
    if (target.id === 10 || target.id === 11) {
      game.history.write("The vines seem to grow back as fast as you cut them.");
      return false;
    } else if (target.id === 23 || target.id === 24) {
      game.history.write("The boards are too tough. It would take hours to chop through them, and you would create a terrible racket.");
      return false;
    }
    return true;
  },

  "flee": function () {
    if (game.player.data.engulfed) {
      let m = game.monsters.get(game.player.data.engulfed);
      game.history.write(`You are held fast by the ${m.name} and cannot flee!`, "emphasis");
      return false;
    }
    return true;
  },

  //endregion

  "eat": function(arg: string, artifact: Artifact) {
    if (artifact) {
      if (artifact.id === 40) {
        game.history.write("Sorry, I'm not hungry.");
        return false;
      }
    }
    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    // if you leave the prison by the front entrance
    if (room_from.id === 22 && room_to.id === 21 && game.monsters.get(8).room_id === 21 && game.monsters.get(8).reaction !== Monster.RX_HOSTILE) {
      // FIXME: this isn't working, and effect should be displayed in endTurn2
      game.effects.print(54);
      game.monsters.get(8).reaction = Monster.RX_HOSTILE;
    }
  },

  "endTurn1": function () {
    // stuff that happens after room desc is shown, but before monster/artifacts

    // old man, after fight
    let old_man = game.monsters.get(14);
    if (old_man.isHere() && !game.monsters.get(15).isHere() && !game.data.old_man_rescued) {
      game.effects.print(12);
      old_man.destroy();
      game.data.old_man_rescued = true;
    }
    // old man, at standing stones
    if (old_man.isHere() && game.data.cf_defeated && !game.data.given_ring) {
      game.effects.print(48);
      let ring = game.artifacts.get(6);
      game.history.write(`You receive: ${ring.name}`);
      ring.moveToInventory();
      game.data.given_ring = true;
      game.monsters.get(1).data.talk = 9;
    }

    // Maya's return
    let maya = game.monsters.get(1);
    if (game.countdown('maya')) {
      maya.moveToRoom();
      maya.reaction = Monster.RX_FRIEND;
      game.effects.print(67);
      if (game.artifacts.get(1).isHere()) {
        game.effects.print(68);
      }
    }
  },

  "endTurn2": function () {
    let maya = game.monsters.get(1);
    let duke = game.monsters.get(4);
    let inquisitor = game.monsters.get(6);
    let velatha = game.monsters.get(30);
    let ainha = game.monsters.get(33);

    // magic weapons confiscated
    if (inquisitorIsHere() && game.player.weapon && game.player.weapon.type === Artifact.TYPE_MAGIC_WEAPON) {
      game.effects.get(13).replacements = {'{weapon name}': game.player.weapon.name};
      game.effects.print(13);
      game.player.weapon.moveToRoom(24);
      game.player.updateInventory();
      game.data.fine_due = true;
    }

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

    // ainha / maya
    if (maya.isHere() && ainha.isHere() && !game.data.ainha_maya) {
      game.data.ainha_maya = true;
      game.effects.print(23);
    }

    // inquisitor / orb
    if (game.player.hasArtifact(orb.id) && inquisitorIsHere()) {
      game.effects.print(57);
      game.die();
      return;
    }
    // if soldiers took orb to inquisitor
    let inquisitor_has_orb = game.monsters.all.find(m =>
      m.special === 'inquisitor' && m.hasArtifact(orb.id) && m.isHere());
    if (inquisitor_has_orb) {
      game.effects.print(38);
      game.die();
      return;
    }
    // soldiers / orb
    if (cobaltFrontIsHere()) {
      if (orb.room_id === game.rooms.current_room.id) {
        // orb is on the ground
        game.effects.print(37);
        if (inquisitor.isActive()) {
          orb.moveToInventory(6);
        } else if (game.monsters.get(7).isActive()) {
          orb.moveToInventory(7);
        } else {
          // goes to prison; no way to get it back
          orb.moveToRoom(24);
        }
        game.monsters.visible.filter(m => isCobaltFront(m)).forEach(m => {
          if (inquisitor.isActive()) {
            m.moveToRoom(inquisitor.room_id);
          } else {
            m.moveToRoom(69);
          }
          m.reaction = Monster.RX_NEUTRAL;
        });
      }
      if (game.player.hasArtifact(orb.id)) {
        game.effects.print(15);
        game.monsters.visible.filter(m => isCobaltFront(m)).forEach(
          m => m.reaction = Monster.RX_HOSTILE
        );
      }
    }

    // velatha / orb
    if (velatha.isHere() && (game.player.hasArtifact(5) || hasOrbInBag()) && !game.data.velatha_sees_orb) {
      game.data.velatha_sees_orb = true;
      game.effects.print(22);
      game.monsters.get(30).data.talk = 22;
      maya.data.talk = 7;
    }

    // old mage (after escaping prison)
    if (game.monsters.get(34).isHere() && game.player.room_id !== 30) {
      game.effects.print(26);
      game.monsters.get(34).destroy();
    }
    // freed prisoner - runs away immediately after her description is shown
    if (game.monsters.get(41).isHere()) {
      game.monsters.get(41).destroy();
      game.monsters.updateVisible();
    }

    // maya / letter
    if (game.artifacts.get(8).isHere() && maya.isHere() && !game.data.maya_letter) {
      game.data.maya_letter = true;
      game.effects.print(8);
      maya.data.talk = 8;
    }

    // mages confront duke
    if (game.data.letter_velatha && !game.data.letter_duke &&
        velatha.isHere() && duke.isHere()) {
      game.effects.print(41);
      game.data.letter_duke = true;
      game.monsters.get(4).reaction = Monster.RX_FRIEND;
      game.monsters.get(5).reaction = Monster.RX_FRIEND;
      game.monsters.get(5).children.forEach(c => c.reaction = Monster.RX_FRIEND);
    }

    // duke vs. inquisitors
    if (game.data.letter_duke && duke.isHere() && inquisitor.isHere() && inquisitor.reaction !== Monster.RX_HOSTILE) {
      game.effects.print(43);
      game.monsters.all.filter(isCobaltFront).forEach(m => m.reaction = Monster.RX_HOSTILE);
      // move some combatants to the square to cut down on the crowds
      game.monsters.get(5).moveToRoom(2);
      game.monsters.get(31).children.slice(2).forEach(c => c.moveToRoom(2));
    }

    // after inquisitors defeated
    if (game.data.letter_duke && !game.data.cf_defeated &&
        !inquisitor.room_id && !game.monsters.get(7).room_id) {
      game.data.cf_defeated = true;
      game.effects.print(44);
      if (duke.isActive()) {
        duke.moveToRoom();  // in case he fled, or you did...
      }
      if (duke.isHere()) {
        game.effects.print(45);
        game.player.gold += 1000;
      } else {
        game.effects.print(49);
      }
      // mages take the magic stuff
      game.artifacts.get(3).destroy();
      game.artifacts.get(4).destroy();
      game.artifacts.get(5).destroy();
      game.monsters.all.filter(m => m.isAlive() && (m.id === 30 || m.id === 31)).forEach(m => {
        m.moveToRoom(51);
        m.reaction = Monster.RX_NEUTRAL;
        if (m.children) {
          m.children.forEach(c => {
            c.moveToRoom(51);
            c.reaction = Monster.RX_NEUTRAL;
          });
        }
      });
      // duke and guards move back to palace
      game.monsters.all.filter(m => m.isAlive() && m.special === 'virrat').forEach(m => {
        m.moveToRoom(4);
        m.reaction = Monster.RX_NEUTRAL;
        if (m.children) {
          m.children.forEach(c => c.reaction = Monster.RX_NEUTRAL);
        }
      });
      // cobalt front gets the boot
      game.monsters.all.filter(isCobaltFront).forEach(m => m.destroy());
      game.monsters.all.filter(m => !isCobaltFront(m)).forEach(m => m.data.talk = 299);
      maya.data.talk = 9;
      // the old man's ring
      if (game.data.old_man_rescued) {
        game.monsters.get(14).moveToRoom(46);
        game.monsters.get(14).reaction = Monster.RX_NEUTRAL;
        game.effects.print(46);
        maya.data.talk = 10;
      } else {
        // if player hasn't seen old man and thugs yet, they just go away (and no ring!)
        game.monsters.get(14).destroy();
        game.monsters.get(15).destroy();
      }
      // if maya was recovering from injuries, she comes back in a few moves
      if (maya.room_id === 68) {
        game.counters['maya'] = 4;
      }
    }

    // Maya's healing potion
    if (maya.isHere() && maya.damage > maya.hardiness / 2 && maya.hasArtifact(41) && !cobaltFrontIsHere()) {
      game.history.write("Maya sips her healing potion.");
      game.artifacts.get(41).use();
    }

    // resurrect Maya
    let mages = game.monsters.get(31);
    if (game.artifacts.get(101).isHere()) {
      // take to safe house
      if (game.player.room_id === 67 && (velatha.isHere() || mages.isHere())) {
        game.effects.print(62);
        healMaya();
      } else if (ainha.isHere()) {
        game.effects.print(63);
        healMaya();
        ainha.moveToRoom(67);
        game.data.maya_healed = true;
      } else if (velatha.isHere()) {
        game.effects.print(64);
        healMaya();
        ainha.moveToRoom(67);
        game.data.maya_healed = true;
      }
    }
    if (game.player.room_id === 67 && (velatha.isHere() || mages.isHere()) && game.data.maya_healed) {
      game.data.maya_healed = false;
      game.effects.print(65);
    }

    // orb warning
    if (game.player.hasArtifact(orb.id) && !cobaltFrontIsHere() && !velatha.isHere()) {
      game.effects.print(24);
    }

    // display items for sale
    let for_sale = game.artifacts.all.filter(a => a.data.for_sale && a.monster_id && game.monsters.get(a.monster_id).isHere());
    if (for_sale.length) {
      game.history.write("Items for sale here: " + for_sale.map(a => a.name).join(', '));
    }

  },

  "afterGet": function(arg, artifact) {
    if (artifact && artifact.id == 5) {
      game.data.found_orb = true;
      game.monsters.get(30).data.talk = 22;
    }
    return true;
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
      // safe house door
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
        game.history.write(`${recipient.name} says, "Hold on to that. Don't give it to anyone until you free the prisoners."`);
      } else {
        game.history.write(`${recipient.name} says, "Is that magic? Better keep it hidden!"`);
      }
      return false;
    }
    // letter / Duke
    if (artifact.id === 8 && recipient.id === 4) {
      game.effects.print(47);
      return false;
    }
    return true;
  },

  "heal": function(arg) {
    let artifact = game.artifacts.getLocalByName(arg);
    if (artifact && artifact.id === 101) {  // maya
      game.effects.print(61);
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
    } else if (artifact.id === 8) {
      if (recipient.id === 30 || Math.floor(recipient.id) === 31 && !game.data.velatha_letter) {
        game.effects.print(40);
        game.data.letter_velatha = true;
        game.monsters.get(30).reaction = Monster.RX_FRIEND;
        game.monsters.get(31).reaction = Monster.RX_FRIEND;
        game.monsters.get(31).children.forEach(c => c.reaction = Monster.RX_FRIEND);
        game.monsters.get(33).reaction = Monster.RX_FRIEND;
      }
    }
  },

  "say": function(phrase) {
    phrase = phrase.toLowerCase();
    if (phrase === 'irkm desmet daem') {
      if (hasOrbInBag()) {
        game.effects.print(56);
      } else if (game.player.hasArtifact(5)) {
        if (game.artifacts.get(24).isHere() || game.artifacts.get(23).isHere()) {
          game.effects.print(21);
          if (game.monsters.get(1).isHere()) {
            game.effects.print(68);
          }
          game.artifacts.get(23).destroy();
          game.artifacts.get(24).destroy();
          game.artifacts.get(37).moveToRoom(39);
          game.artifacts.get(38).moveToRoom(22);
          game.data.jailbreak = true;
        } else if (game.player.room_id >= 51 && game.player.room_id <= 54) {
          game.effects.print(51);
          game.player.injure(game.diceRoll(1, 4), true);
        } else {
          game.effects.print(20);
        }
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
    // spells don't work in prison due to shielding
    console.log('casting spell in room ' + game.player.room_id);
    if (game.player.room_id >= 22 && game.player.room_id <= 29) {
      game.effects.print(55);
      return false;
    }
    return !checkIfCaughtUsingMagic();
  },

  "use": function(arg, artifact) {
    switch (artifact.id) {
      case 3:  // wand
        let defoliated = false;
        let plant_monsters = game.monsters.all.filter(m => m.special === 'plant' && m.isHere());
        if (plant_monsters.length) {
          game.history.write("A ray of brown light shoots from the Wand of Defoliation!", 'special');
          plant_monsters.forEach(m => m.injure(game.diceRoll(3, 3), true));
          defoliated = true;
        }
        if (game.artifacts.get(10).isHere()) {
          game.effects.print(17);
          game.artifacts.get(10).destroy();
          defoliated = true;
        }
        if (game.artifacts.get(11).isHere() && !game.data.defoliated) {
          game.effects.print(18);
          game.artifacts.get(5).moveToRoom();
          game.data.defoliated = true;
          defoliated = true;
        }
        if (!defoliated) {
          game.history.write("Some nearby weeds shrivel and die.");
        }
        break;
      case 5: // orb
        if (hasOrbInBag()) {
          game.effects.print(56);
        } else {
          game.effects.print(19);
        }
        break;
      case 48: // strange potion
        game.history.write("A strange sensation comes over you. Your movements seem to quicken.");
        game.player.agility += 2;
        break;
      case 50: // detector
        game.effects.print(53);
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
      game.rooms.get(36).createExit('d', 30);
      return;
    }

    if (roll <= 50) {
      game.history.write("The air crackles around you, and nearby animals scatter in all directions. Other than your hair standing on end, nothing seems to have happened.");
    } else if (roll <= 75) {
      // teleport to random room
      game.history.write("Your vision wavers. You find yourself standing, disoriented, somewere far from where you just were.");
      let room = game.rooms.getRandom(game.data.no_teleport_rooms);
      game.player.moveToRoom(room.id);
      game.skip_battle_actions = true;

      // you can get arrested for teleporting into a room with cf soldiers in it
      checkIfCaughtUsingMagic();

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

function checkIfCaughtUsingMagic() {
  if (cobaltFrontIsHere()) {
    if (game.data.jailbreak) {
      soldiersAttack();
    } else {
      game.effects.print(27);
      goToJail();
    }
    return true;
  }
  return false;
}

function goToJail() {
  game.player.inventory.forEach(a => a.moveToRoom(24));
  let sack = game.artifacts.get(39);
  sack.value = game.player.gold;
  sack.moveToRoom(24);
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

/**
 * Break free of the engulfing monster
 * @param attacker
 */
function breakFree(monster: Monster) {
  if (monster.data.engulfed) {
    const captor = game.monsters.get(monster.data.engulfed);
    game.history.write(`${monster.name} breaks free of the ${captor.name}!`, 'success');
    monster.data.engulfed = false;
    monster.status_message = '';
  }
}

function hasOrbInBag() {
  return game.player.hasArtifact(4) && game.artifacts.get(4).contains(5);
}

function healMaya() {
  let maya = game.monsters.get(1);
  maya.resurrect();
  maya.moveToRoom(68);
  maya.reaction = Monster.RX_NEUTRAL;
  maya.data.talk = 66;
}
