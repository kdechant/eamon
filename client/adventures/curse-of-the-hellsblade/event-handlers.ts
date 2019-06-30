import Game from "../../core/models/game";
import {Artifact} from "../../core/models/artifact";
import {Monster} from "../../core/models/monster";
import {RoomExit} from "../../core/models/room";
import {Room} from "../../core/models/room";

export var event_handlers = {

  "start": function(arg: string) {
    let game = Game.getInstance();

    // game.data["open coffin"] = false;
    game.data["guardian protects box"] = true;
    game.data["hb safe"] = false;
    game.data['wizard spells'] = 5;

    // make the Hellsblade the ready weapon
    game.player.ready(game.artifacts.get(25));

  },

  "attackArtifact": function(arg: string, target: Artifact) {
    let game = Game.getInstance();
    if (target.id === 55) {
      game.history.write("The Guardian pushes you away!");
      return false;
    } else if (target.id === 63) {
      if (game.player.weapon_id === 4) {
        destroySlab();
      } else {
        game.history.write("You barely scratch the stone slab!");
        return false;
      }
    }
    return true;
  },

  "attackMonster": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // guardian
    if (target.id === 31) {
      game.history.write("The Guardian pushes you away!");
      return false;
    }
    return true;
  },

  "endTurn": function() {
    let game = Game.getInstance();
    let hb = game.artifacts.get(25);
    let scabbard = game.artifacts.get(56);
    let box = game.artifacts.get(55);
    let key = game.artifacts.get(58);
    let door = game.artifacts.get(71);

    if (hb.container_id === scabbard.id && scabbard.container_id === box.id && key.monster_id === 31 && !game.data['hb safe']) {
      game.effects.print(20);
      game.data['hb safe'] = true;
      door.moveToRoom();
      let re = new RoomExit();
      re.direction = 'n';
      re.room_to = -999;
      game.rooms.getRoomById(64).addExit(re);
    }

  },

  "endTurn2": function() {
    let game = Game.getInstance();
    if (game.player.weapon_id === 25 && !game.player.isWearing(57) && game.monsters.visible.length > 0 && game.player.room_id !== 64) {
      game.delay(1);
      game.history.write("The Hellsblade whirls in your hand! You can't stop swinging!", "special2");
      game.delay(1);
      let m = game.monsters.visible[game.diceRoll(1, game.monsters.visible.length) - 1]; // can choose friends
      game.player.attack(m);
      game.tick();
    }

    // hb starts in inventory, so show description manually
    let hb = game.artifacts.get(25);
    if (!hb.seen) {
      game.history.write(hb.description);
      hb.seen = true;
    }

  },

  "beforeMove": function(arg: string, room: Room, exit: RoomExit): boolean {
    let game = Game.getInstance();
    if (exit.room_to === -1) {
      game.effects.print(17);
      return false;
    }

    // guardian's warnings
    if (room.id === 64 && exit.room_to === 62) {
      if (!game.monsters.get(31).hasArtifact(58)) {
        game.effects.print(16);
      }
    }

    return true;
  },

  "afterMove": function(arg: string, room_from: Room, room_to: Room) {
    let game = Game.getInstance();
    // soggy torch
    let torch = game.artifacts.get(27);
    if ((room_to.id === 50 || room_to.id == 71) && torch.isHere() && torch.is_lit) {
      game.history.write("The " + torch.name + " is quenched!");
      torch.is_lit = false;
      torch.quantity = 0;
      torch.name = "soggy " + torch.name;
    }
  },

  "drop": function(arg: string, artifact: Artifact): boolean {
    if (artifact.id === 25) {
      Game.getInstance().history.write("You can't drop the Hellsblade!");
      return false;
    }
    return true;
  },

  "give": function(arg: string, artifact: Artifact, monster: Monster) {
    let game = Game.getInstance();
    // cursed sword
    if (artifact.id === 25) {
      game.history.write("You can't pry the Hellsblade from your hand!");
      return false;
    }
    if (monster.id === 31 && artifact.id !== 58) {
      game.history.write("He refuses it!");
      return false;
    }
    return true;
  },

    "fumble": function(attacker: Monster, defender: Monster, fumble_roll: number) {
      let game = Game.getInstance();
      // prevent accidental dropping of the hellsblade
      // also, prevent "weapon hurts user" which would kill you instantly :O
      if (attacker.id === 0 && attacker.weapon.id === 25) {
        game.history.write("-- fumble recovered!", "no-space");
        return false;
      }
      return true;  // otherwise, use regular fumble logic
    },


  "monsterAction": function(monster: Monster) {
    let game = Game.getInstance();

    // wizard can cast spells
    if (monster.id === 16 && game.data['wizard spells'] > 0 && game.diceRoll(1,3) === 3) {
      if (monster.damage > monster.hardiness * 0.4) {
        // heal
        game.history.write(monster.name + " casts a heal spell!");
        let heal_amount = game.diceRoll(2, 6);
        monster.heal(heal_amount);
      } else {
        // blast
        let monster_target = monster.chooseTarget();
        if (monster_target) {
          let damage = game.diceRoll(2, 5);
          game.history.write(monster.name + " casts a blast spell at " + monster_target.name + "!");
          game.history.write("--a direct hit!", "success");
          monster_target.injure(damage, true);
        }
      }
      game.data['wizard spells']--;
      return false; // skip the default combat actions
    }

    return true;
  },

  "beforeOpen": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    if (artifact !== null) {
      if (artifact.id === 55 && game.data["guardian protects box"]) {
        game.history.write("The Guardian pushes you away!");
        return false;
      }
    }
    return true;
  },

  "beforePut": function(arg: string, item: Artifact, container: Artifact) {
    let game = Game.getInstance();
    // some items are containers because they have things inside, but you can't put anything into them
    if (container.id === 17 || container.id === 30) {
      game.history.write("You can't put anything into that.");
      return false;
    }
    // anything other than hb into scabbard
    if (container.id === 56 && item.id !== 25) {
      game.history.write("It won't fit.");
      return false;
    }
    // hb into anything but scabbard
    if (item.id === 25 && container.id !== 56) {
      game.history.write("It won't go!");
      return false;
    }
    return true;
  },

  "afterPut": function(arg: string, item: Artifact, container: Artifact) {
    let game = Game.getInstance();
    if (item.id === 25 && container.id === 56) {
      game.history.write("The Hellsblade is contained, for now...", "special2");
      container.inventory_message = "with Hellsblade inside";
    }
  },

  "specialPut": function(arg: string, item: Artifact, container: Artifact) {
    let game = Game.getInstance();
    if (item.id === 47 && container.id === 69) {
      container.quantity = -1;
      game.history.write("You fill the lantern, it will now LIGHT.");
      return false;   // skips the rest of the "put" logic
    }
    return true;
  },

  "afterRemoveFromContainer": function(arg: string, artifact: Artifact, container: Artifact) {
    let game = Game.getInstance();
    // hb from scabbard
    if (container && container.id == 56 && artifact.id === 25) {
      game.effects.print(19);
      game.player.ready(artifact);
      game.data['hb safe'] = false;
    }
    // scabbard from box
    if (container && container.id == 55 && artifact.id === 56) {
      game.data['hb safe'] = false;
    }
    // clam and lump quit being containers
    if (container && container.id == 17 || container.id == 30) {
      container.type = Artifact.TYPE_TREASURE;
    }
    return true;
  },

  "afterRemoveWearable": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    // take off gauntlets
    if (artifact && artifact.id === 57 && game.player.hasArtifact(25)) {
      game.history.write("The Hellsblade twitches eagerly!", "special2");
    }
    return true;
  },

  "say": function(phrase) {
    let game = Game.getInstance();
    phrase = phrase.toLowerCase();
    if (phrase === 'elizabeth' && game.monsters.get(31).isHere()) {
      game.history.write("The guardian stands aside!", "success");
      game.data["guardian protects box"] = false;
    }
  },

  "use": function(arg: string, artifact: Artifact) {
    let game = Game.getInstance();
    let slab = game.artifacts.get(63);
    if (artifact && artifact.id === 4 && slab.isHere()) {
      destroySlab();
    }
  },

  "wear": function(arg: string, target: Artifact) {
    let game = Game.getInstance();
    if (target && target.id === 57 && game.artifacts.get(25).isHere()) {
      game.history.write("The Hellsblade whines...", "special2");
    }
    return true;
  },

  "blast": function(arg: string, target: Monster) {
    let game = Game.getInstance();
    // guardian
    if (target.id === 31) {
      game.history.write("The Guardian pushes you away!");
      return false;
    }
    return true;
  },

  // 'power' event handler takes a 1d100 dice roll as an argument
  "power": function(roll) {
    let game = Game.getInstance();
    if (roll <= 90) {
      game.history.write("You hear a loud sonic boom which echoes all around you!");
    } else {
      game.history.write("All your wounds are healed!");
      game.player.heal(1000);
    }
  },

  "exit": function() {
    let game = Game.getInstance();
    if (!game.data['hb safe']) {
      if (game.player.hasArtifact(25)) {
        game.effects.print(6, "special2");
      } else if (game.player.hasArtifact(56)) {
        game.effects.print(5, "special2");
      } else {
        game.effects.print(3, "special2");
      }
      game.die(false);
      return false;
    }
    return true; // this permits normal exit logic
  }

}; // end event handlers

function destroySlab() {
  let game = Game.getInstance();
  game.history.write("You chop at the slab with the pick. After a few minutes, it shatters!", "success");
  game.artifacts.get(63).destroy();
}
