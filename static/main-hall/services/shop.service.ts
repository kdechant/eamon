import {Injectable}     from '@angular/core';

import {Artifact} from "../../core/models/artifact";
import {Game} from "../../core/models/game";

/**
 * Shop service. Generates items that appear in Marcos' shop.
 */
@Injectable()
export class ShopService {

  public weapons: Artifact[] = [];
  public armors: Artifact[] = [];

  getWeapons(): Artifact[] {
    if (!this.weapons.length) {
      this.setupItems();
    }
    return this.weapons;
  }

  getArmor(): Artifact[] {
    if (!this.armors.length) {
      this.setupItems();
    }
    return this.armors;
  }

  private setupItems(): void {

    // always have some standard weapons
    let item: Artifact;
    for (let t = 1; t <= 5; t++) {
      item = new Artifact();
      item.type = Artifact.TYPE_WEAPON;
      item.weapon_type = t;
      item.weapon_odds = 10;
      item.weight = 5;
      item.dice = 1;
      if (item.weapon_type === 3) {
        item.name = "mace";
      } else {
        item.name = item.getWeaponTypeName();
      }
      item.description = "You see a standard " + item.name + ".";
      switch (t) {
        case 1:
          item.sides = 6;
          break;
        case 2:
          item.sides = 6;
          break;
        case 3:
          item.sides = 4;
          break;
        case 4:
          item.sides = 5;
          break;
        case 5:
          item.sides = 8;
          break;
      }
      item.value = 42;
      this.weapons.push(item);
    }

    // some special weapons
    let artifact_names = {
      1: ["Slaymor", "Falcoor"],
      2: ["Stinger", "Elfkill"],
      3: ["Scrunch", "Flasher"],
      4: ["Centuri", "Widower"],
      5: ["Slasher", "Freedom"]
    };
    for (let i = 0; i < 3; i++) {
      item = new Artifact();
      item.type = Artifact.TYPE_WEAPON;
      item.weapon_type = Game.getInstance().diceRoll(1, 5);
      item.name = artifact_names[item.weapon_type][Math.floor(Math.random() * artifact_names[item.weapon_type].length)];
      item.description = "You see a " + item.getWeaponTypeName() + " named " + item.name + ".";
      item.weapon_odds = Game.getInstance().diceRoll(1, 12) * 2;
      item.hands = item.weapon_type === 2 ? 2 : 1;
      item.dice = 2;
      item.sides = 4 + Game.getInstance().diceRoll(1, 5) * 2;
      item.value = (20 + 5 * item.sides + 2 * item.weapon_odds + Game.getInstance().diceRoll(2, 5)) * 10;
      this.weapons.push(item);
    }

    // some basic armor and shields
    let armor_types = ["leather", "chain", "plate"];
    for (let t in armor_types) {
      item = new Artifact;
      item.type = Artifact.TYPE_WEARABLE;
      item.armor_type = Artifact.ARMOR_TYPE_ARMOR;
      item.name = armor_types[t] + " armor";
      item.description = "You see a standard set of " + item.name + ".";
      item.value = 42;
      item.armor_class = 1;
      item.armor_penalty = 10;
      // item.armor_class = t * 3 - 1;
      this.armors.push(item);
    }
    item = new Artifact;
    item.type = Artifact.TYPE_WEARABLE;
    item.armor_type = Artifact.ARMOR_TYPE_SHIELD;
    item.name = "shield";
    item.description = "You see a standard shield.";
    item.value = 21;
    item.armor_class = 1;
    item.armor_penalty = 5;
    this.armors.push(item);

  }

}
