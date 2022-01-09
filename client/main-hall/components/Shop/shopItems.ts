import Artifact, {ARMOR_TYPES, ARTIFACT_TYPES, getTypeName, maxDamage} from "../../models/artifact";
import diceRoll from "../../utils/dice";
import { v4 as uuidv4 } from 'uuid';

export let weapons: Artifact[] = [];
export const armors: Artifact[] = [];

// always have some standard weapons
for (let t = 1; t <= 5; t++) {
  const item = {
    uuid: uuidv4(),
    type: ARTIFACT_TYPES.WEAPON,
    weapon_type: t,
    weapon_odds: 10,
    weight: 5,
    dice: 1,
  } as Artifact;
  item.name = t === 3 ? "mace" : getTypeName(item);
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
const artifact_names = {
  1: ["Slaymor", "Falcoor", "Ironheart", "Blood Claw", "Orenmir", "Shadowfury", "Mooncleaver"],
  2: ["Stinger", "Meteor", "Featherdraw", "Heartpiercer", "Quintain", "Ashwood", "Arrowsong"],
  3: ["Scrunch", "Warmace", "Earthshatter", "Spinefall", "Justifier", "Haunted Hammer", "Guiding Star"],
  4: ["Centuri", "Shiverspine", "Twisted Spike", "Mithril Lance", "Blinkstrike", "Nightbane", "Ebon Halberd"],
  5: ["Slasher", "Freedom", "Ghost Reaver", "Doombringer", "Malevolent Crusader", "Swiftblade", "Oathkeeper"]
};
const magic_weapons: Artifact[] = [];
const num_weapons = 3;
for (let i = 0; i < num_weapons; i++) {
  const item = {
    uuid: uuidv4(),
    type: ARTIFACT_TYPES.MAGIC_WEAPON,
    weapon_type: diceRoll(1, 5),
  } as Artifact;
  // choose a unique name
  const name_index = diceRoll(1, artifact_names[item.weapon_type].length) - 1;
  item.name = artifact_names[item.weapon_type][name_index];
  artifact_names[item.weapon_type].splice(name_index, 1);

  item.description = "You see " + (item.weapon_type === 1 ? "an" : "a") +
    " " + getTypeName(item) + " named " + item.name + ".";
  item.weapon_odds = diceRoll(1, 7) * 5 - 10;
  item.hands = item.weapon_type === 2 ? 2 : 1;
  // item.dice = i + 1;  // always generate 1 x 1d*, 1 x 2d*, and 1 x 3d*
  item.dice = 2;  // always generate 2 2d* weapons and 1 3d* weapon
  if (i <= num_weapons * .33) { item.dice = 1; }
  if (i >= num_weapons * .66) { item.dice = 3; }
  item.sides = 8 - (item.dice * 2) + diceRoll(1, 4) * 2;
  item.value = Math.floor(maxDamage(item) ** 1.5 + item.weapon_odds) * 5;
  item.weight = 3;
  magic_weapons.push(item);
}
magic_weapons.sort((w1, w2) => w1.value - w2.value);
weapons = weapons.concat(magic_weapons);

// some basic armor and shields
const armor_types = ["leather", "chain", "scale", "plate"];
for (const a of armor_types) {
  const item = {
    uuid: uuidv4(),
    type: ARTIFACT_TYPES.WEARABLE,
    armor_type: ARMOR_TYPES.ARMOR,
    name: a === 'chain' ? "chain mail" : a + " armor",
  } as Artifact;
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
const shield = {
  uuid: uuidv4(),
  type: ARTIFACT_TYPES.WEARABLE,
  armor_type: ARMOR_TYPES.SHIELD,
  name: 'shield',
  description: "You see a standard shield.",
  value: 50,
  armor_class: 1,
  armor_penalty: 5
} as Artifact;
armors.push(shield);
