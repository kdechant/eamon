import {RoomRepository} from "../repositories/room.repo";
import {ArtifactRepository} from "../repositories/artifact.repo";
import {EffectRepository} from "../repositories/effect.repo";
import {MonsterRepository} from "../repositories/monster.repo";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";

import {HistoryManager} from "../models/history-manager";
import {CommandParser} from "../models/command-parser";
import {EventHandler} from "../commands/event-handler";
import {event_handlers} from "adventure/event-handlers";

/**
 * Game Data class. Contains game state and data like rooms, artifacts, monsters.
 */
export class Game {

  // constants
  static STATUS_ACTIVE: number = 0;
  static STATUS_WON: number = 1;
  static STATUS_DIED: number = 2;
  static STATUS_SELLING: number = 3;

  private static _instance: Game = new Game();

  /**
   * @var {string} The current adventure's name
   */
  name: string;

  /**
   * @var {string} The current adventure's description
   */
  description: string;

  /**
   * A container for all the Room objects
   */
  rooms: RoomRepository;

  /**
   * A container for all the Artifact objects
   */
  artifacts: ArtifactRepository;

  /**
   * A container for all the Effect objects
   */
  effects: EffectRepository;

  /**
   * A container for all the Monster objects
   */
  monsters: MonsterRepository;

  /**
   * A Monster object representing the player.
   */
  player: Monster;

  /**
   * A container for custom data and game flags used by specific adventures
   * (e.g., rising water level, or whether someone has given the player an item)
   */
  data: { [key: string]: any; } = {};

  /**
   * The game timer. Keeps track of the number of game clock ticks.
   */
  timer: number = 0;

  /**
   * Command history and results
   */
  history: HistoryManager;

  /**
   * Command parser object
   */
  command_parser: CommandParser;

  /**
   * Game event handlers defined in the adventure's "event-handers" file
   */
  event_handlers: EventHandler[] = [];

  /**
   * In Battle flag
   */
  in_battle: boolean = false;

  /**
   * "skip battle actions" flag. Set this to true to not have battle actions
   * happen this turn (e.g., when first moving into a room)
   */
  skip_battle_actions: boolean = false;

  // Status flags - the Angular templates can't seem to read class constants, so these are boolean flags for now.

  /**
   * Flag to indicate that the game is active (i.e., the player can still enter commands)
   */
  active: boolean = true;

  /**
   * Flag to indicate that the player exited the adventure successfully
   */
  won: boolean = false;

  /**
   * Flag to indicate that the player died
   */
  died: boolean = false;

  /**
   * Flag to indicate that the selling items phase is running
   */
  exit_message: string[] = [];

  /**
   * Flag to indicate that the selling items phase is running
   */
  selling: boolean = false;

  constructor() {
    if (Game._instance) {
      throw new Error("Error: Instantiation failed: Use Game.getInstance() instead of new.");
    }
    Game._instance = this;
  }

  public static getInstance(): Game {
    return Game._instance;
  }

  /**
   * Sets up data received from the GameLoaderService.
   */
  init(data) {

    this.name = data[0].name;
    this.description = data[0].description;

    this.rooms = new RoomRepository(data[1]);
    this.artifacts = new ArtifactRepository(data[2]);
    this.effects = new EffectRepository(data[3]);
    this.monsters = new MonsterRepository(data[4]);

    this.monsters.addPlayer(data[5]);

    this.history = new HistoryManager;
    this.command_parser = new CommandParser();

    // register the event handlers defined in the adventure
    for (let i in event_handlers) {
      let e = new EventHandler();
      e.name = i;
      e.run = event_handlers[i];
      this.event_handlers.push(e);
    }

    // Show the adventure description
    this.history.push("");
    this.history.write(this.description);

    // Place the player in the first room
    this.player.moveToRoom(1);

    this.triggerEvent("start", "");

    // Tick the game clock. This builds the list of monsters/items in the first room.
    this.tick();

  }

  /**
   * Tick the game clock. Monster/artifact maintenance and things like changing
   * torch fuel will happen here.
   */
  tick() {
    if (!this.active) {
      return;
    }

    this.timer++;

    this.player.rechargeSpellAbilities();

    // if speed spell is active, decrease its time remaining
    if (this.player.speed_time > 0) {
      this.player.speed_time--;
      if (this.player.speed_time === 0) {
        this.history.write("You speed spell just expired!");
        this.player.speed_multiplier = 1;
      }
    }

    // check if there is a light source; decrement its fuel count
    let light = this.artifacts.isLightSource();
    for (let i in this.artifacts.all) {
      let a = this.artifacts.all[i];
      if (a.type === Artifact.TYPE_LIGHT_SOURCE && a.is_lit) {
        a.quantity--;
        if (a.quantity === 0) {
          a.is_lit = false;
          this.history.write("Your " + a.name + " just went out!");
        } else if (a.quantity < 10) {
          this.history.write("Your " + a.name + " is almost out!");
        } else if (a.quantity < 20) {
          this.history.write("Your " + a.name + " grows dim!");
        }
      }
    }

    this.artifacts.updateVisible();
    this.monsters.updateVisible();

    // non-player monster actions
    if (this.in_battle && !this.skip_battle_actions) {
      for (let i in this.monsters.all) {
        if (this.monsters.all[i].id !== Monster.PLAYER && this.monsters.all[i].isHere()) {
          this.monsters.all[i].doBattleActions();
        }
        this.artifacts.updateVisible();
        this.monsters.updateVisible();
      }
    }
    // clear the "skip battle" flag if it was set
    this.skip_battle_actions = false;

    // the first end turn event triggers here, so we can see any artifacts or monsters that have appeared,
    // but any monsters that have just entered the room won't be able to attack.
    this.triggerEvent("endTurn");
    this.monsters.updateVisible();

    this.endTurn();
  }

  /**
   * Shows the room, artifact, and monster descriptions. Normally called right after tick() unless there
   * was a command exception, in which case the tick is bypassed.
   */
  public endTurn(): void {

    let light = this.artifacts.isLightSource();
    // show room name and description
    if (this.rooms.current_room.is_dark && !light) {
      this.history.write("It's too dark to see anything.");
    } else {
      this.history.write(this.rooms.current_room.name);
      if (!this.rooms.current_room.seen) {
        this.history.write(this.rooms.current_room.description);
        this.rooms.current_room.seen = true;
      }
    }

    // show monster and artifact descriptions
    if (light || !this.rooms.current_room.is_dark) {
      this.history.write(""); // blank line for white space
      for (let i in this.monsters.visible) {
        let m = this.monsters.visible[i];
        if (!m.seen) {
          m.showDescription();
          m.seen = true;
          this.triggerEvent("see_monster", m);
        } else {
          if (m.count > 1) {
            this.history.write(m.count + " " + m.name + "s are here.", "no-space");
          } else {
            this.history.write(m.name + " is here.", "no-space");
          }
        }
      }

      for (let i in this.artifacts.visible) {
        let a = this.artifacts.visible[i];
        if (!a.seen) {
          a.showDescription();
          this.triggerEvent("see_artifact", a);
          a.seen = true;
        } else {
          this.history.write("You see " + a.name, "no-space");
        }
      }
    }

    // the second end turn event triggers here, so things can happen after we have seen the artifact
    // and monster descriptions (e.g., some monsters may speak when you see them)
    this.triggerEvent("endTurn2");
  }

  /**
   * Rolls a set of dice
   * @param {number} dice
   *   The number of dice
   * @param (number} sides
   *   The number of sides on each dice. Normally a positive integer but zero and negative numbers are also supported.
   */
  diceRoll(dice, sides) {
    if (sides === 0) {
      return 0;
    }
    let result = 0;
    for (let i = 0; i < dice; i++) {
      if (sides > 0) {
        result += Math.floor(Math.random() * sides + 1);
      } else {
        // this supports a negative number of sides to produce a random negative number
        result += Math.ceil(Math.random() * sides - 1);
      }
    }
    return result;
  }

  /**
   * Triggers a game event.
   * @param {string} event_name
   *   The name of the event, e.g., "beforeGet", "look", "open", "read"
   * @param {string} arg1
   *   An argument to the event. e.g., the Artifact that was picked up or read,
   *   or the word that was said.
   * @param {string} arg2
   *   Another argument to the event.
   * @param {string} arg3
   *   Another argument to the event.
   */
  public triggerEvent(event_name, arg1?: any, arg2?: any, arg3?: any): any {
    for (let i in this.event_handlers) {
      if (this.event_handlers[i].name === event_name) {
        return this.event_handlers[i].run(arg1, arg2, arg3);
      }
    }
    // if we didn't find a matching event handler, return true to continue executing remaining code
    return true;
  }

  /**
   * Handles successful game exit.
   */
  public exit() {
    this.active = false;
    this.won = true;
  }

  /**
   * Handles player death.
   */
  public die() {
    this.player.damage = this.player.hardiness;
    this.player.showHealth();
    this.active = false;
    this.died = true;
  }

}
