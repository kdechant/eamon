import {Inject} from "angular2/core";

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

  private static _instance: Game = new Game();

  /**
   * @var string The current adventure's name
   */
  name: string;

  /**
   * @var string The current adventure's description
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

  /**
   * "Game over" flag
   */
  ended: boolean = false;

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
    this.monsters.player.moveToRoom(1);

    this.triggerEvent("start", "");

    // Tick the game clock. This builds the list of monsters/items in the first room.
    this.tick();

  }

  /**
   * Tick the game clock. Monster/artifact maintenance and things like changing
   * torch fuel will happen here.
   */
  tick() {
    this.timer++;

    // check if there is a light source; decrement its fuel count
    let light = this.artifacts.isLightSource();
    for (let i in this.artifacts.all) {
      let a = this.artifacts.all[i];
      if (a.type === Artifact.TYPE_LIGHT_SOURCE && a.is_lit) {
        a.quantity--;
        if (a.quantity === 0) {
          a.is_lit = false;
          this.history.write("Your " + a.name + " just went out.");
        }
      }
    }

    // if the player is seeing the room for the first time, show the description
    if (this.rooms.current_room.is_dark && !light) {
      this.history.write("It's too dark to see anything.");
    } else if (!this.rooms.current_room.seen) {
      this.history.write(this.rooms.current_room.description);
      this.rooms.current_room.seen = true;
    }

    this.artifacts.updateVisible();
    this.monsters.updateVisible();

    // non-player monster actions
    if (this.in_battle && !this.skip_battle_actions) {
      for (let i in this.monsters.visible) {
        let m = this.monsters.visible[i];
        m.doBattleActions();
      }
      this.artifacts.updateVisible();
      this.monsters.updateVisible();
    }
    this.skip_battle_actions = false;

    // show monster and artifact descriptions
    if (light || !this.rooms.current_room.is_dark) {
      for (let i in this.monsters.visible) {
        let m = this.monsters.visible[i];
        if (!m.seen) {
          this.history.write(m.description);
          m.seen = true;
          this.triggerEvent("see_monster", m);
        } else {
          this.history.write(m.name + " is here.");
        }
      }

      for (let i in this.artifacts.visible) {
        let a = this.artifacts.visible[i];
        if (!a.seen) {
          this.history.write(a.description);
          this.triggerEvent("see_artifact", a);
          a.seen = true;
        } else {
          this.history.write("You see " + a.name);
        }
      }
    }

    this.monsters.player.rechargeSpellAbilities();

    // if speed spell is active, decrease its time remaining
    if (this.monsters.player.speed_time > 0) {
      this.monsters.player.speed_time--;
      if (this.monsters.player.speed_time === 0) {
        this.history.write("You speed spell just expired!");
        this.monsters.player.speed_multiplier = 1;
      }
    }

  }

  /**
   * Rolls a set of dice
   */
  diceRoll(dice, sides) {
    let result = 0;
    for (let i = 0; i < dice; i++) {
      result += Math.floor(Math.random() * sides + 1);
    }
    return result;
  }

  /**
   * Triggers a game event.
   * @param string event_name
   *   The name of the event, e.g., "beforeGet", "look", "open", "read"
   * @param string arg
   *   An argument to the event. e.g., the Artifact that was picked up or read,
   *   or the word that was said.
   */
  public triggerEvent(event_name, arg1: any, arg2?: any, arg3?: any): any {
    for (let i in this.event_handlers) {
      if (this.event_handlers[i].name === event_name) {
        return this.event_handlers[i].run(arg1, arg2, arg3);
      }
    }
    // if we didn't find a matching event handler, return true to continue executing remaining code
    return true;
  }

  /**
   * Handles player death.
   */
  public die() {
    this.history.write("You are dead!", "danger");
    this.ended = true;
  }

}
