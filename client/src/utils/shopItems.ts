import Artifact from "../models/artifact";
import diceRoll from "./dice";
import * as uuid from 'uuid';

export let weapons: Artifact[] = [];
export const armors: Artifact[] = [];

// always have some standard weapons
let item: Artifact;
for (let t = 1; t <= 5; t++) {
  item = new Artifact();
  item.uuid = uuid();
  item.type = Artifact.TYPE_WEAPON;
  item.weapon_type = t;
  item.weapon_odds = 10;
  item.weight = 5;
  item.dice = 1;
  item.name = item.weapon_type === 3 ? "mace" : item.getTypeName();
  item.description = "You see a standard " + item.name + ".";
  switch (t) {
    case 1:
      item.sides = 6;
      item.value = 25;
      break;
    case 2:
      item.sides = 6;
      item.value = 40;
      break;
    case 3:
      item.sides = 4;
      item.value = 20;
      break;
    case 4:
      item.sides = 5;
      item.value = 25;
      break;
    case 5:
      item.sides = 8;
      item.value = 30;
      break;
  }
  weapons.push(item);
}

// some special weapons
let artifact_names = {
  1: ["Slaymor", "Falcoor", "Ironheart", "Blood Claw", "Orenmir", "Shadowfury", "Mooncleaver"],
  2: ["Stinger", "Meteor", "Featherdraw", "Heartpiercer", "Quintain", "Ashwood", "Arrowsong"],
  3: ["Scrunch", "Warmace", "Earthshatter", "Spinefall", "Justifier", "Haunted Hammer", "Guiding Star"],
  4: ["Centuri", "Shiverspine", "Twisted Spike", "Mithril Lance", "Blinkstrike", "Nightbane", "Ebon Halberd"],
  5: ["Slasher", "Freedom", "Ghost Reaver", "Doombringer", "Malevolent Crusader", "Swiftblade", "Oathkeeper"]
};
let magic_weapons: Artifact[] = [];
let num_weapons: number = 3;
for (let i = 0; i < num_weapons; i++) {
  item = new Artifact();
  item.uuid = uuid();
  item.type = Artifact.TYPE_MAGIC_WEAPON;
  item.weapon_type = diceRoll(1, 5);

  // choose a unique name
  let name_index = diceRoll(1, artifact_names[item.weapon_type].length) - 1;
  item.name = artifact_names[item.weapon_type][name_index];
  artifact_names[item.weapon_type].splice(name_index, 1);

  item.description = "You see " + (item.weapon_type === 1 ? "an" : "a") +
    " " + item.getTypeName() + " named " + item.name + ".";
  item.weapon_odds = diceRoll(1, 7) * 5 - 10;
  item.hands = item.weapon_type === 2 ? 2 : 1;
  // item.dice = i + 1;  // always generate 1 x 1d*, 1 x 2d*, and 1 x 3d*
  item.dice = 2;  // always generate 2 2d* weapons and 1 3d* weapon
  if (i <= num_weapons * .33) { item.dice = 1; }
  if (i >= num_weapons * .66) { item.dice = 3; }
  item.sides = 8 - (item.dice * 2) + diceRoll(1, 4) * 2;
  item.value = Math.floor(item.maxDamage() ** 1.5 + item.weapon_odds) * 5;
  item.weight = 3;
  magic_weapons.push(item);
}
magic_weapons.sort((w1, w2) => w1.value - w2.value);
weapons = weapons.concat(magic_weapons);

// some basic armor and shields
let armor_types = ["leather", "chain", "scale", "plate"];
for (let a of armor_types) {
  item = new Artifact;
  item.uuid = uuid();
  item.type = Artifact.TYPE_WEARABLE;
  item.armor_type = Artifact.ARMOR_TYPE_ARMOR;
  if (a === 'chain') {
    item.name = "chain mail";
  } else {
    item.name = a + " armor";
  }
  item.description = "You see a standard set of " + item.name + ".";
  switch (a) {
    case "leather":
      item.value = 100;
      item.armor_class = 1;
      item.armor_penalty = 10;
      item.weight = 5;
      break;
    case "chain":
      item.value = 250;
      item.armor_class = 3;
      item.armor_penalty = 20;
      item.weight = 15;
      break;
    case "scale":
      item.value = 350;
      item.armor_class = 4;
      item.armor_penalty = 40;
      item.weight = 18;
      break;
    case "plate":
      item.value = 500;
      item.armor_class = 5;
      item.armor_penalty = 60;
      item.weight = 20;
      break;
  }
  armors.push(item);
}
item = new Artifact;
item.uuid = uuid();
item.type = Artifact.TYPE_WEARABLE;
item.armor_type = Artifact.ARMOR_TYPE_SHIELD;
item.name = "shield";
item.description = "You see a standard shield.";
item.value = 50;
item.armor_class = 1;
item.armor_penalty = 5;
armors.push(item);
