import {RoomRepository} from "../repositories/room.repo";
import {ArtifactRepository} from "../repositories/artifact.repo";
import {EffectRepository} from "../repositories/effect.repo";
import {MonsterRepository} from "../repositories/monster.repo";
import {HintRepository} from "../repositories/hint.repo";
import {Modal} from "../models/modal";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";

import {HistoryManager} from "../models/history-manager";
import {CommandParser} from "../models/command-parser";
import {EventHandler} from "../commands/event-handler";
import {event_handlers} from "adventure/event-handlers";
import {ILoggerService, DummyLoggerService} from "../services/logger.service";

declare var LZString;

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
   * @var {number} The current adventure's id in the database
   */
  id: number;

  /**
   * @var {string} The current adventure's name
   */
  name: string;

  /**
   * @var {string} The current adventure's description
   */
  description: string;

  /**
   * @var {string[]} The text to display at the adventure start
   */
  intro_text: string[];

  /**
   * @var {number} The current index of the multi-page intro
   */
  intro_index: number;

  /**
   * @var {string} A question to ask the player during adventure start
   */
  intro_question: string;

  /**
   * What the player answered for the intro question, if there was one.
   */
  intro_answer: string;

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
   * The ID of the first dead body artifact. Zero or null means don't use dead bodies.
   */
  dead_body_id: number = null;

  /**
   * A container for all the Hint objects
   */
  hints: HintRepository;

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

  /**
   * Messages that are displayed during the exit phase, after the sale of treasure
   */
  exit_message: string[] = [];

  // Status flags - the Angular templates can't seem to read class constants, so these are boolean flags for now.

  /**
   * Flag to indicate that the turn has completed and the player may enter another command.
   */
  ready: boolean = true;

  /**
   * Flag to indicate that the game is active (i.e., the player can still enter commands)
   * The game object is created in an inactive fashion and is activated during the startup prompt.
   */
  active: boolean = false;

  /**
   * Flag to indicate whether the game has started.
   */
  started: boolean = false;

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
  selling: boolean = false;

  /**
   * A container for the modal object
   */
  modal: Modal;

  /**
   * Flag for whether we're in demo mode
   */
  demo: boolean = false;

  /**
   * Saved game descriptions
   */
  saves: string[] = [];

  /**
   * Statistics for the game (damage taken, secret doors found, etc.)
   */
  statistics: { [key: string]: number; } = {
    'damage taken': 0,
    'damage dealt': 0,
    'secret doors found': 0
  };

  // Mock objects for testing
  /**
   * Pre-defined random numbers. If you put X numbers into this array, these will be used
   * as the results of the next X calls to game.diceRoll().
   */
  mock_random_numbers: number[] = [];

  logger: ILoggerService;

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

    this.id = data[0].id;
    this.name = data[0].name;
    this.description = data[0].description;
    this.intro_text = data[0].intro_text.split('---').map(Function.prototype.call, String.prototype.trim);
    this.intro_index = 0;
    this.intro_question = data[0].intro_question;
    this.dead_body_id = data[0].dead_body_id;

    this.rooms = new RoomRepository(data[1]);
    this.artifacts = new ArtifactRepository(data[2]);
    this.effects = new EffectRepository(data[3]);
    this.monsters = new MonsterRepository(data[4]);
    this.hints = new HintRepository(data[5]);

    this.modal = new Modal;

    this.monsters.addPlayer(data[6]);

    // de-duplicate the artifact names
    this.artifacts.deduplicate();

    this.history = new HistoryManager;
    this.command_parser = new CommandParser();

    // register the event handlers defined in the adventure
    for (let i in event_handlers) {
      let e = new EventHandler();
      e.name = i;
      e.run = event_handlers[i];
      this.event_handlers.push(e);
    }

    // for unit tests, the logger won't usually be initialized, so create a dummy logger
    if (!this.logger) {
      this.logger = new DummyLoggerService;
    }
    this.logger.log("start adventure");

    // Show the adventure description
    this.history.push("");

    // if there is no intro text, just start the game
    if (this.intro_text[0] === "") {
      this.start();
    } else {
      // event handler that can change the intro text
      this.triggerEvent("intro");
    }

  }

  /**
   * Starts the game, after the user clears the intro screen
   */
  public start() {
    this.started = true;
    this.active = true;

    // Place the player in the first room
    this.player.moveToRoom(1);

    this.triggerEvent("start", "");

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

    // if speed spell (or other timed spell) is active, decrease its time remaining
    for (let spell_name in this.player.spell_counters) {
      if (this.player.spell_counters[spell_name] > 0) {
        this.player.spell_counters[spell_name]--;
        if (this.player.spell_counters[spell_name] === 0) {
          if (spell_name === 'speed') {
            this.history.write("Your speed spell just expired!", "success");
            this.player.speed_multiplier = 1;
          }
          // other spells (typically custom spells in adventures) don't have an "expires" message.
          // if a message is desired, print it inside the "spellExpires" event handler.
          this.triggerEvent('spellExpires', spell_name);
        }
      }
    }

    // check if there is a light source; decrement its fuel count
    let light = this.artifacts.isLightSource();
    for (let a of this.artifacts.all) {
      if (a.type === Artifact.TYPE_LIGHT_SOURCE && a.is_lit && a.quantity !== -1) {
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
      for (let m of this.monsters.all) {
        if (m.id !== Monster.PLAYER && m.isHere() && this.player.status === Monster.STATUS_ALIVE) {
          m.doBattleActions();
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
    this.artifacts.updateVisible();
    this.monsters.updateVisible();

    this.endTurn();
  }

  /**
   * Shows the room, artifact, and monster descriptions. Normally called right after tick() unless there
   * was a command exception, in which case the tick is bypassed.
   */
  public endTurn(): void {

    if (Game.getInstance().died) return;

    let light = this.artifacts.isLightSource();
    // show room name and description
    if (this.rooms.current_room.is_dark && !light) {
      this.history.write("It's too dark to see anything.");
    } else {
      this.history.write(this.rooms.current_room.name);
      if (Game.getInstance().data['bort']) {
        this.history.append(" (" + this.rooms.current_room.id + ")");
      }

      if (!this.rooms.current_room.seen) {
        this.rooms.current_room.show_description();
        this.rooms.current_room.seen = true;
        this.triggerEvent("seeRoom");
      }
    }

    // show monster and artifact descriptions
    if (light || !this.rooms.current_room.is_dark) {
      this.history.write(""); // blank line for white space
      for (let m of this.monsters.visible) {
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

      for (let a of this.artifacts.visible) {
        if (!a.seen) {
          a.showDescription();
          this.triggerEvent("see_artifact", a);
          a.seen = true;
        } else {
          if (a.player_brought) {
            this.history.write("Your " + a.name + " is here.", "no-space");
          } else {
            this.history.write("You see " + a.name + ".", "no-space");
          }
        }
      }
    }

    // the second end turn event triggers here, so things can happen after we have seen the artifact
    // and monster descriptions (e.g., some monsters may speak when you see them)
    this.triggerEvent("endTurn2");

    this.setReady();
  }

  /**
   * Resets the "ready" state
   */
  public setReady() {
    // set a timeout to activate the command prompt once everything finishes
    setTimeout(() => { this.ready = true; }, this.history.total_delay);
  }

  /**
   * Rolls a set of dice
   * @param {number} dice
   *   The number of dice
   * @param (number} sides
   *   The number of sides on each dice. Normally a positive integer but zero and negative numbers are also supported.
   */
  diceRoll(dice, sides) {

    // for unit testing, it's possible to set mock random numbers
    if (this.mock_random_numbers.length) return this.mock_random_numbers.shift();

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
    for (let e of this.event_handlers) {
      if (e.name === event_name) {
        return e.run(arg1, arg2, arg3);
      }
    }
    // if we didn't find a matching event handler, return true to continue executing remaining code
    return true;
  }

  /**
   * Pauses the game so the clock won't tick while waiting for something (e.g., a user prompt)
   */
  public pause() {
    this.active = false;
  }

  /**
   * Resumes a paused game
   */
  public resume() {
    this.active = true;
  }

  /**
   * Delays the output for a bit
   * @param {number} time
   *   The amount of time to delay, in seconds
   */
  public delay(time: number = 3) {
    if (this.history.delay > 0) {
      this.history.total_delay += time * 1000;
    }
  }

  /**
   * Handles successful game exit.
   */
  public exit() {
    if (this.triggerEvent('exit')) {
      this.active = false;
      this.won = true;

      this.logger.log('exit adventure');
      for (let s in this.statistics) {
        this.logger.log(s, this.statistics[s]);
      }

      // delete the saved games
      for (let i = 1; i <= 10; i++) {
        window.localStorage.removeItem('savegame_' + this.id + '_' + i);
        window.localStorage.removeItem('savegame_description_' + this.id + '_' + i);
      }
    }
  }

  /**
   * Handles player death.
   * @param boolean show_health whether to show the "player is dead" message. Usually true, except if the player
   * was killed during combat, when the message will already have been shown.
   */
  public die(show_health = true) {
    this.player.damage = this.player.hardiness;
    if (show_health) this.player.showHealth();
    this.triggerEvent("death", this.player);
    this.active = false;
    this.died = true;
    this.getSavedGames();

    this.logger.log('died');
    for (let s in this.statistics) {
      if (s.indexOf('damage') !== -1) {
        this.logger.log(s, this.statistics[s]);
      }
    }

  }

  /**
   * Save the game
   */
  public save(slot, description) {
    this.logger.log('save game to slot ' + slot + ': ' + description);
    let sv = {
      description: description,
      rooms: this.rooms.rooms,
      artifacts: this.artifacts.serialize(),
      effects: this.effects.all,
      monsters: this.monsters.serialize(),
      gamedata: this.data
    };
    let savegame = JSON.stringify(sv);
    savegame = LZString.compressToBase64(savegame);

    // put in local storage? or save to the API?
    window.localStorage.setItem('savegame_' + this.id + "_" + slot, savegame);
    window.localStorage.setItem('savegame_description_' + this.id + "_" + slot, description);
  }

  /**
   * Restore a save game
   */
  public restore(slot) {
    this.logger.log('restore game from slot ' + slot);
    let savegame = window.localStorage.getItem('savegame_' + this.id + "_" + slot);
    if (savegame) {
      let data = JSON.parse(LZString.decompressFromBase64(savegame));
      // the serialized data looks just like the data from the API, so we just need to recreate the repositories.
      this.rooms = new RoomRepository(data.rooms);
      this.artifacts = new ArtifactRepository(data.artifacts);
      this.effects = new EffectRepository(data.effects);
      this.monsters = new MonsterRepository(data.monsters);
      this.player = this.monsters.get(0);
      this.rooms.current_room = this.rooms.getRoomById(this.player.room_id);
      this.player.updateInventory();
      this.artifacts.updateVisible();
      this.monsters.updateVisible();
      this.data = data.gamedata;

      this.died = false;
      this.active = true;
      this.ready = true;

      this.history = new HistoryManager;
      this.history.push("restore");
      this.history.write("Game restored from slot " + slot + ".");
    }
  }

  public getSavedGames() {
    this.saves = [];
    for (let i = 1; i <= 10; i++) {
      let description = window.localStorage.getItem('savegame_description_' + this.id + '_' + i);
      if (description !== null) {
        this.saves.push(i + ": " + description);
      }
    }
    return this.saves;
  }
}
