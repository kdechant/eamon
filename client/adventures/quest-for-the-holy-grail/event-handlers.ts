import * as pluralize from 'pluralize';
import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

declare var game: Game;

export var event_handlers = {

  "start": function () {
    game.data['divine_intervention'] = 0; // divine intervention at death
    game.data['black_knight_damage'] = 0; // the Black Knight's special damage
    game.data['collector_last_room'] = 0;
    game.data['shrubbery'] = false; // Roger's shrubbery
    game.data['power_naked'] = false; // armor loss from Power spell
    game.data['dennis_starts'] = false; // Is it time for Dennis to yammer?
    game.data['minstrels_song'] = 1;
    game.data['questions'] = 0; // only a single chance to answer each question
    game.data['question_number'] = 1;
    game.data['answered_questions'] = false;
    game.data['real_name'] = game.player.name;
    // other setup
    initCustomCombatMessages();
    initCustomHealthMessages();
    game.flee_verbs = {'singular': "runs away", 'plural': "run away"};
    let parchment = game.artifacts.get(78);
    parchment.monster_id = Monster.PLAYER;
    game.player.updateInventory();
    // Tim the Enchanter
    let enchanter = game.monsters.get(7);
    enchanter.spells = ['blast','heal'];
    enchanter.spell_points = 100;
    enchanter.spell_frequency = 100;
    // the dead collector
    let collector = game.monsters.get(33);
    collector.moveToRoom(game.diceRoll(1,19));
  },

  "endTurn": function() {
    manageDeadCollector();
    if ((game.player.room_id == 64) && !game.data['answered_questions']) { // the bridge
      game.data['questions']++;
      if (game.data['questions'] > 1) { intoTheGorge(); }
    }
  },

  "endTurn1": function () {
    if (game.player.room_id == 10) { // the monks
      if (!game.effects.get(1).seen || game.diceRoll(1,100) <= 20) {
        game.effects.print(1);
      }
    }
    if ((game.player.room_id == 33) && !game.effects.get(82).seen) { // Swamp Castle
      game.effects.print(82);
    }
    if (game.player.room_id == 61 && !game.effects.get(2).seen) { // my brain hurts
      game.effects.printSequence([2,3]);
    }
    if (game.player.room_id == 16 && !game.effects.get(4).seen) { // Scene 24
      game.effects.printSequence([4,5]);
    }
    if (game.player.room_id == 49 && !game.effects.get(6).seen) { // Spanish Inquisition!
      game.effects.printSequence([6,7,8,17,24,25]);
    }
    if (game.player.room_id == 18) { // the French castle
      if (!game.effects.get(9).seen) {
        game.effects.print(9);
      } else {
        printRandomEffect(75,3,33);
      }
    }
    if (game.player.room_id == 29) { // on the way to Swamp Castle
      if (!game.effects.get(87).seen) { game.effects.print(87); }
}
  },

  // For some reason, the test suite won't pass if any of the endTurn event handlers
  // include a isHere() call on a Monster object unless you check for null first.
  "endTurn2": function () {
    if (game.artifacts.get(31).isHere()) { // the Black Knight's torso
      printRandomEffect(68,7,33);
    }
    if (game.monsters.get(25).isHere() && (game.player.room_id != 23)) { // the Minstrel
      theMinstrelSings();
    }
    if (game.monsters.get(32).isHere()) { // Dennis
      if (game.data["dennis_starts"] == false) {
        game.data["dennis_starts"] = true;
      } else {
        if (!game.effects.get(67).seen) { game.effects.print(67); }
      }
    }
    if (game.player.room_id == 13) { // Castle Anthrax
      if (!game.effects.get(80).seen) {
        game.effects.print(80);
      } else {
        game.effects.print(81);
      }
    }
    if (game.monsters.get(6).isHere() && !game.data['answered_questions']) { // old man
      game.effects.print(114 + game.data['question_number']);
    }
    if (game.monsters.get(20).isHere() && !game.effects.get(119).seen) { // head French knight
      game.effects.print(119);
    }
    if (game.monsters.get(33).isHere()) { printRandomEffect(124,3,33); } // dead collector
  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    if (room.id == 25 && exit.room_to !== 22) { // the Knights of Nee
      if (visibleKnightsOfNee().length > 0) {
        game.effects.print(10);
        return false;
      }
    }
    if (exit.room_to === -999) { // Castle Anthrax
      if (game.player.gender === "f") {
        game.effects.print(108);
      } else {
        game.effects.print(107);
      }
      game.die();
      return false;
    }
    if (exit.room_to === 35) { // heading in/out of the frozen wastes
      if (room.id < 35) { // heading toward
        game.effects.print(111);
      } else {
        game.effects.print(112);
      }
      return true;
    }
    if (game.monsters.get(6).isHere()) { // old man
      game.data['questions'] = 0;
      intoTheGorge();
      return false;
    }
    return true;
  },

  "flee": function() {
    if (game.monsters.get(9).isHere()) { // the Black Knight
      printRandomEffect(51,4,100);
      return false;
    }
    return true;
  },

  "attackMonster": function(arg: string, target: Monster) {
    if (target.special === "Camelot") {     // attacking one of Arthur's band
      game.monsters.all.filter(m => (m.special === "Camelot")).forEach(function(monster){
        monster.reaction = Monster.RX_HOSTILE;
        monster.attack_odds = 100;
        monster.friend_odds = 0;
      monster.friendliness = Monster.FRIEND_NEVER;
        game.in_battle = true;
      });
      return true;
    }
    if (target.special === "Nee") {     // attacking Knights of Nee
      game.monsters.all.filter(m => (m.special === "Nee")).forEach(function(monster){
        monster.reaction = Monster.RX_HOSTILE;
        monster.attack_odds = 100;
        monster.friend_odds = 0;
      monster.friendliness = Monster.FRIEND_NEVER;
        game.in_battle = true;
      });
      return true;
    }
    if (target.id == 6) { // old man
      intoTheGorge();
      return false
    }

    return true;
  },

  "attackArtifact": function(arg: string, target: Artifact) {
    if (target.id == 31) { // the Black Knight's torso
      game.effects.print(59);
      return false;
    }
    return true;
  },

  "attackDamage": function (attacker: Monster, defender: Monster, damage: number) {
    if (attacker.id == Monster.PLAYER && defender.id == 9) { // the Black Knight
      return blackKnightDamage();
    }
    if (defender.id == 32) { printRandomEffect(43,2,33); } // Dennis
    return true;
  },

  "death": function (monster: Monster): boolean {
    if (monster.parent) {
      if (monster.parent.id == 15) { // a Knight of Nee
        let body = getDeadGroupMember(83,5);
        if (body) { body.moveToRoom(game.player.room_id); }
      }
      if (monster.parent.id == 28) { // yeoman guards
        let body = getDeadGroupMember(79,2);
        if (body) { body.moveToRoom(game.player.room_id); }
        monster.description = game.effects.get(83).text;
        return true;
      }
      if (monster.parent.id == 30) { // royal guards
        let body = getDeadGroupMember(81,2);
        if (body) { body.moveToRoom(game.player.room_id); }
        monster.description = game.effects.get(83).text;
        return true;
      }
    }
    if (monster.id == Monster.PLAYER) { // the player (divine intervention at death)
      game.data['divine_intervention']++;
      switch(game.data["divine_intervention"]) {
        case 1: { // first intervention
          game.effects.printSequence([101,102,103,104]);
          monster.heal(1000);
          return false;
        }
        case 2: { // last chance…
          game.effects.print(105);
          monster.heal(1000);
          return false;
        }
        default: { // The Almighty has given up on you
          game.effects.print(106);
          return true;
        }
      }
    }
    return true;
  },

  "beforeOpen": function(arg: string, artifact: Artifact) {
    if (artifact) {
      if ((artifact.id == 7) && game.in_battle) { // chest
        game.effects.print(26);
        return false;
      }
    }
    return true;
  },

  "beforeGet": function (arg: string, artifact: Artifact): boolean {
    if (artifact) {
      if ((artifact.id == 2) || (artifact.id == 7)) { // chest or Grail
        if (game.in_battle) {
          game.effects.print(26);
          return false;
        }
      }
      if (artifact.id == 31) { // the Black Knight's torso
        game.effects.print(99);
        return false;
      }
      if (artifact.id == 106) { // decaying bodies
        game.effects.print(98);
        return false;
      }
    }
    return true;
  },

  "afterGet": function (arg: string, artifact: Artifact) {
    if (artifact) {
      updateArtifactDescription(artifact);
      if (artifact.id == 1) { // Holy Hand Grenade
        game.effects.print(27);
      }
      if (artifact.id == 2) { // the Holy Grail
        game.effects.printSequence([120,121,122]);
        game.exit();
      }
    }
  },

  "give": function(arg: string, artifact: Artifact, recipient: Monster) {
    // giving the dead collector a body
    if (recipient.id == 33) {
      if (deadCollectorCollectsABody(recipient, artifact)) { return false; }
      return true;
    }
    // giving the Knights Who Say Nee a shrubbery
    if ((artifact.id == 3) && (recipient.id >= 14 && recipient.id <= 19)) {
      game.effects.print(50);
      artifact.destroy();
      return false;
    }
    return true;
  },

  "seeMonster": function(monster: Monster): void {
    if (monster.id == 3) { // Lancelot
      game.effects.printSequence([85,86]);
    }
    if (monster.id == 9) { // the Black Knight
      game.effects.print(53);
    }
    if (monster.id == 4) { // Sir Bedivere
      game.effects.print(18); // European swallows!
    }
    if (monster.id == 10) { // the Vicious Chicken of Bristol
      monster.description = game.effects.get(100).text;
    }
    if (monster.id == 14) { // the Head Knight of Nee
      monster.description = game.effects.get(79).text;
    }
    if (monster.id == 25) { // Minstrel
      game.effects.printSequence([19,11,12,13,14,20]);
    }
    if (monster.id == 27) { // Dad/Herbert/etc
      game.effects.printSequence([88,89,15,21,22,23]);
    }
    if (monster.id == 28) { // yeoman guards
      game.effects.printSequence([109,110]);
    }
    if (monster.id == 30) { // royal guards
      game.effects.print(84);
    }
    if (monster.id == 7) { // Tim the Enchanter
      game.effects.print(16);
    }
    if (monster.id == 6) { // old man from scene 24
      if (game.player.gender === "m") { // male
        game.effects.print(113);
      } else { // female
        game.effects.print(114);
      }
    }
    if (monster.id == 32) { // Dennis
      if (game.monsters.get(5).isHere()) { // King Arthur
        game.effects.print(64);
      } else {
        game.effects.print(65);
      }
      game.effects.print(66);
    }
    if (monster.id == 14) { // head Knight of Nee
      monster.description = game.effects.get(79).text;
    }
    if (monster.id == 15) { // Knight of Nee
      monster.description = game.effects.get(78).text;
    }
  },

  "power": function(roll) {
    if ((roll <= 10) && (game.player.spell_abilities['speed'] > 0)) { // speed
      game.effects.print(91);
      game.command_parser.run("speed", false);
      return;
    } else if (roll <= 20) { // flash of light
      game.effects.print(92);
      return;
    } else if (roll <= 40) { // FEAR!
      game.effects.print(90);
      game.monsters.visible.forEach(function(monster){
        if (monster.id > 6) {
          strikeFear(monster);
        }
      });
      return;
    } else if (roll <= 50) { // reset spell abilities
      game.effects.print(93);
      game.player.rechargeSpellAbilities(1000);
      return;
    } else if (roll <= 60) { // hardiness decreased
      game.effects.print(94);
      game.player.hardiness -= 1;
      game.player.stats_original.hardiness -= 1;
      return;
    } else if (roll <= 75) { // armor disappeared
      game.effects.print(95);
      game.data['power_naked'] = true;
      game.player.updateInventory();
      game.player.name = ("Naked " + game.player.name);
      game.artifacts.get(88).moveToRoom(game.diceRoll(1,67));
      return;
    } else if (roll <= 90) { // hardiness increased
      game.effects.print(96);
      game.player.hardiness += 2;
      game.player.stats_original.hardiness += 2;
      return;
    } else { // player healed
      game.effects.print(97);
      game.player.heal(1000);
    }
  },

  "armorClass": function(monster: Monster) {
    if ((monster.id == Monster.PLAYER) && game.data['power_naked']) {
      monster.armor_class = 0;
    }
  },

  "wear": function(arg: string, artifact: Artifact) {
    if (artifact && (artifact.id == 88)) { // armor
      artifact.destroy();
      game.player.name = game.data['real_name'];
      game.data['power_naked'] = false;
      game.player.updateInventory();
      game.effects.print(123);
      return false;
    }
    return true;
  },

  "eat": function(arg: string, artifact: Artifact) {
    let monster = game.monsters.getLocalByName(arg);
    if (monster && (monster.id == 25) && monster.isHere()) { // the Minstrel
      monster.destroy();
      game.effects.print(45);
      return false;
    }
    return true;
  },

  "say": function(phrase: string) {
    phrase = phrase.toLowerCase();
    if (phrase.indexOf("it") === 0) {
      game.effects.print(128);
      visibleKnightsOfNee().forEach(function(knight){
        knight.flee();
      });
    }
    if (phrase.indexOf("nee") >= 0) {
      if (visibleKnightsOfNee().length > 0) {
        game.history.write(`"Showing off your vocabulary, eh? That's not the right word, anyway."`);
      }
      if (game.monsters.get(13).isHere()) { // Roger
        if ((game.data['shrubbery'] == false) && (game.artifacts.get(3).monster_id != Monster.PLAYER)) {
          game.data['shrubbery'] = true;
          game.effects.print(46); // just take it!
          game.artifacts.get(3).room_id = null;
          game.artifacts.get(3).monster_id = Monster.PLAYER;
          game.player.updateInventory();
          return;
        } else {
          game.effects.print(47); // I hope you're happy.
          game.monsters.get(13).injure(1000);
          return;
        }
      }
    }
    if (game.monsters.get(6).isHere()) { // old man
      switch(game.data['question_number']) {
        case 1: { // What is your name?
          if (phrase.indexOf(game.player.name.toLowerCase()) >= 0) {
            game.data['question_number']++;
            game.data['questions'] = 0;
          }
          break;
          }
        case 2: { // What is your quest?
          if (phrase.indexOf("grail") >= 0) {
            game.data['question_number']++;
            game.data['questions'] = 0;
          }
          break;
          }
        case 3: {
          game.data['answered_questions'] = true;
          game.effects.print(118);
          game.monsters.get(6).destroy();
          break;
        }
      }
    }
  }
}; // end event handlers

export function initCustomCombatMessages(): void {
  // the Knights Who Say Nee
  let neeCombatVerbs = [
      'screams "NEE!" at',
      'bellows "NEE!" at',
      'shouts "NEE!" at',
      'shrieks "NEEEE!" at',
      'growls "Nee..." in the general direction of',
      'whispers "Nee." toward',
      'chuckles "Nee-hee-hee!" gleefully at',
      'States simply, "Nee." to',
      'Mutters "Nee." under his breath at'];
  game.monsters.get(14).combat_verbs = neeCombatVerbs;
  game.monsters.get(15).children.forEach(m => (m.combat_verbs = neeCombatVerbs));
  // Vicious Chicken
  game.monsters.get(10).combat_verbs = [
    "pecks at",
    "squawks at",
    "claws at",
    "tears at"];
   // Vorpal Bunny
  game.monsters.get(11).combat_verbs = [
    "hops at",
    "hippity-hoppities at",
    "gnaws at",
    "claws at",
    "tears at"];
}


export function initCustomHealthMessages(): void {
  let health_messages = [
    "is spiffing!",
    "is in good shape.",
    "is hurting.",
    "is in pain.",
    "is very badly injured.",
    "is at death's door, knocking loudly!",
    "is dead!"
    ];
  game.player.health_messages = game.data['health_messages'];
  game.monsters.all.forEach(function(monster: Monster){
    monster.health_messages = health_messages;
  });
}

export function visibleKnightsOfNee(excludeHead: boolean = false): Monster[] {
  let knights: Monster[] = game.monsters.get(15).children.filter(m => m.isHere());
  if (!excludeHead && game.monsters.get(14).isHere()) { knights.push(game.monsters.get(14)); }
  return knights;
}

export function getDeadGroupMember(firstBodyId: number, quantity: number): Artifact {
  for (let i = firstBodyId; i < (firstBodyId + quantity); i++) {
    let deadBody = game.artifacts.get(i);
    if (deadBody.room_id == 0) { return deadBody; }
  }
  return null;
}

export function strikeFear(monster: Monster): void {
  monster.courage = monster.courage / 2;
  let strings = [];
  let name = monster.name;
  if (monster.count == 1) {
    strings = [
      " trembles in terror!",
      " is petrified!",
      " has gone white as a sheet!",
      " is a big fat chicken!",
      "'s eyes grow wide!",
      " gasps in fear!"
    ];
  } else {
    strings = [
      " tremble in terror!",
      " are petrified!",
      " have gone white as a sheet!",
      " are all a bunch of scaredy-cats!",
      " are frozen with fear!",
      " gasp in fear—in unison!"
    ];
    name = pluralize(name);
    monster.children.forEach(m => m.courage /= 2);
  }
  game.history.write(name + game.getRandomElement(strings));
}

export function blackKnightDamage(): number {
  game.data['black_knight_damage']++;
  switch(game.data['black_knight_damage']) {
    case 1: {
      game.effects.printSequence([36,37,56]);
      game.artifacts.get(95).moveToRoom(game.player.room_id); // the BK's right arm
      game.history.suppressNextMessage = true;
      return 0;
    }
    case 2: {
      game.effects.printSequence([38,39,57]);
      game.artifacts.get(96).moveToRoom(game.player.room_id); // the BK's left arm
      game.history.suppressNextMessage = true;
      return 0;
    }
    case 3: {
      game.effects.printSequence([40,41]);
      game.artifacts.get(97).moveToRoom(game.player.room_id); // the BK's right leg
      game.history.suppressNextMessage = true;
      return 0;
    }
    case 4: {
      game.effects.printSequence([42,58]);
      game.monsters.get(9).destroy();
      game.artifacts.get(98).moveToRoom(game.player.room_id); // the BK's left leg
      game.artifacts.get(31).moveToRoom(game.player.room_id); // the BK's torso
      game.artifacts.get(16).moveToRoom(game.player.room_id); // the BK's sword
      game.history.suppressNextMessage = true;
      return 0;
    }
  }
}

export function theMinstrelSings(): void {
  if (game.diceRoll(1,100) <= 33) {
    game.effects.print(19);
    game.effects.print(10 + game.data['minstrels_song']);
    game.data['minstrels_song']++;
    if (game.data['minstrels_song'] > 4) { game.data['minstrels_song'] = 1 } // reset
  }
}

export function manageDeadCollector(): void {
  let collector = game.monsters.get(33);
  if (deadCollectorCollects(collector)) { return; }
  if (deadCollectorIsInterested(collector)) { return; }
  deadCollectorMoves(collector);
}

export function deadCollectorCollects(collector: Monster): boolean {
  let bodies = game.artifacts.all.filter(a => (a.room_id === collector.room_id)).filter(a => (a.type === 13));
  bodies.forEach(function (body){
    deadCollectorCollectsABody(collector, body);
    return true;
  });
  return false;
}

export function deadCollectorCollectsABody(collector: Monster, body: Artifact): boolean {
  if (body.type != 13) { return false; }
  body.destroy();
  if (collector.room_id == game.player.room_id) {
    game.player.gold += body.value;
    game.history.write(`The dead collector throws ${body.name} into his cart and pays you ${body.value} gold pieces.`);
  game.player.updateInventory();
    }
  return true;
}

export function deadCollectorIsInterested(collector: Monster): boolean {
  if ((collector.room_id == game.player.room_id) && game.in_battle) {
    let interest = game.monsters.visible[game.diceRoll(0,game.monsters.visible.length-1)];
    if ((interest.id == 33) || (game.diceRoll(1,100) <= 50)) { return; } // not himself
    game.history.write(`The dead collector examines ${interest.name} closely. \"I can't take 'em like that,\" he tells you.`);
    return true;
  }
  return false;
}

export function deadCollectorMoves(collector: Monster): void {
  if ((collector.room_id != game.player.room_id) || (game.diceRoll(1,100) <= 20)) {
    let exit = collector.chooseRandomExit();
    let tries = 3;
    while ((exit.room_to == game.data['collector_last_room']) && (tries > 0)) {
      exit = collector.chooseRandomExit();
      tries--;
    }
    game.data['collector_last_room'] = collector.room_id;
    collector.moveToRoom(exit.room_to);
    if (collector.room_id === game.player.room_id) {
      game.history.write("The dead collector ambles into view.");
    } else if (game.data['collector_last_room'] == game.player.room_id) {
      game.history.write(`The dead collector wanders off to the ${exit.getFriendlyDirection()}.`);
    }
  }
}

export function intoTheGorge(): void {
  game.effects.printSequence([34,35]);
  game.die();
}

export function printRandomEffect(first: number, quantity: number, odds: number = 50): void {
  let offset = first - 1;
  if ((offset < 0) || (quantity < 1)) { return; } // sanity check
  if (game.diceRoll(1,100) > odds) { return; }
  game.effects.print(offset + game.diceRoll(1,quantity));
}

export function updateArtifactDescription(artifact: Artifact): void {
  let offset = 200;
  if (!game.effects.get(artifact.id + offset)) { return; } // no alternative description
  artifact.description = game.effects.get(artifact.id + offset).text;
}
