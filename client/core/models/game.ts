import { compressToBase64, decompressFromBase64 } from 'lz-string';

import RoomRepository from "../repositories/room.repo";
import ArtifactRepository from "../repositories/artifact.repo";
import EffectRepository from "../repositories/effect.repo";
import MonsterRepository from "../repositories/monster.repo";
import HintRepository from "../repositories/hint.repo";
import {Modal} from "../models/modal";
import {Artifact} from "../models/artifact";
import {Monster} from "../models/monster";

import {HistoryManager} from "../models/history-manager";
import {CommandParser} from "../models/command-parser";
import EventHandler from "../commands/event-handler";
import {ILoggerService, DummyLoggerService} from "../utils/logger.interface";
import {getAxios} from "../../main-hall/utils/api";
import * as React from "react";
import {OperationsQueue} from "./operations-queue";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare let game;

/**
 * Game Data class. Contains game state and data like rooms, artifacts, monsters.
 */
export default class Game {

  // constants
  static STATUS_ACTIVE = 0;
  static STATUS_WON = 1;
  static STATUS_DIED = 2;
  static STATUS_SELLING = 3;

  /**
   * @var {number} The current adventure's id in the database
   */
  id: number;

  /**
   * @var {string} The current adventure's slug, e.g., 'the-beginners-cave'
   */
  slug: string;

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
   * A container for game counters. See countdown()
   */
  counters: { [key: string]: any; } = {};

  /**
   * The game timer. Keeps track of the number of game clock ticks.
   */
  timer = 0;

  /**
   * Operations Queue
   */
  queue: OperationsQueue;

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
  in_battle = false;

  /**
   * Has there been fighting this turn? If so, NPCs can pick up a weapon if they dropped it.
   */
  is_battle_turn = false;

  /**
   * "skip battle actions" flag. Set this to true to not have battle actions
   * happen this turn (e.g., when first moving into a room)
   */
  skip_battle_actions = false;

  /**
   * Verbs that are displayed when monsters flee
   */
  flee_verbs: any = {
    'singular': "flees",
    'plural': "flee"
  };

  /**
   * Messages that are displayed during the exit phase, after the sale of treasure
   */
  exit_message = "You successfully ride off into the sunset.";

  /**
   * Whether to prompt the player when they try to exit the adventure
   */
  exit_prompt = true;

  /**
   * Name of the person who tells you you have too many weapons when you leave
   */
  lwm_name = 'Lord William Missilefire';

  /**
   * Name of the person who buys treasure at the end
   */
  ss_name = 'Sam Slicker';

  /**
   * Name of the money in this adventure
   */
  money_name = 'gold piece';

  /**
   * Whether to automatically show room exits next to the description in the
   * history window. (Opt-in by setting this in start event handler)
   */
  show_exits = false;

  /**
   * Messages that are displayed during the exit phase, after the sale of treasure
   */
  after_sell_messages: string[] = [];

  /**
   * Spell recharge rate, per turn. Element 0 can be either "constant" or "percentage"
   * and element 1 is the amount to increase
   * e.g., ["constant", 3] recharges each spell ability by 3 points every turn
   * e.g., ["percentage", 10] recharges each spell ability by 10% of the current value every turn
   */
  spell_recharge_rate: [string, number] = ["constant", 2];

  // Status flags

  /**
   * Flag to indicate that the turn has completed and the player may enter another command.
   */
  ready = true;

  /**
   * Flag to indicate that the game is active (i.e., the player can still enter commands)
   * The game object is created in an inactive fashion and is activated during the startup prompt.
   */
  active = false;

  /**
   * Flag to indicate whether the game has started.
   */
  started = false;

  /**
   * Flag to indicate that the player exited the adventure successfully
   */
  won = false;

  /**
   * Flag to indicate that the player died
   */
  died = false;

  /**
   * Flag to indicate that the selling items phase is running
   */
  selling = false;

  /**
   * A container for the modal object
   */
  modal: Modal;

  /**
   * Flag for whether we're in demo mode
   */
  demo = false;

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

  // Saved game stuff
  public saved_games: any = {};

  /**
   * Saved games used only when player died
   */
  public saves: any = [];

  /**
   * Function to refresh the React display
   * (This is a function that is passed in from the React components)
   */
  public refresher: any;

  constructor() { }

  /**
   * Re-renders the game display on the screen
   *
   * This calls a method on the React MainProgram component, which is passed in to the model class at runtime.
   * It's kind of a hack. Wish I knew of a nicer way. Maybe Redux could help, someday.
   */
  public refresh() {
    if (this.refresher) {
      this.refresher(this);
    }
  }

  /**
   * Registers the event handlers and custom commands defined in the adventure's custom code
   * @param {any} event_handlers
   *   The object of event handler functions defined in the adventure
   * @param {any} commands
   *   The array of custom commands defined in the adventure
   */
  public registerAdventureLogic(event_handlers, commands): void {
    for (const i in event_handlers) {
      const e = new EventHandler();
      e.name = i;
      e.run = event_handlers[i];
      this.event_handlers.push(e);
    }
    this.command_parser = new CommandParser(commands);
  }

  /**
   * Sets up data received from the GameLoaderService.
   */
  public init(adv, rooms, artifacts, effects, monsters, hints, player, saved_games) {

    this.id = adv.id;
    this.name = adv.name;
    this.description = adv.description;
    this.intro_text = adv.intro_text.split('---').map(Function.prototype.call, String.prototype.trim);
    if (this.data.bort) {
      this.intro_text = [""];  // faster start, for local development
    }
    this.intro_question = adv.intro_question;
    this.dead_body_id = adv.dead_body_id;

    this.rooms = new RoomRepository(rooms);
    this.artifacts = new ArtifactRepository(artifacts);
    this.effects = new EffectRepository(effects);
    this.monsters = new MonsterRepository(monsters);
    this.hints = new HintRepository(hints);

    this.modal = new Modal;

    this.monsters.addPlayer(player);

    // de-duplicate the artifact names
    this.artifacts.deduplicate();

    this.history = new HistoryManager;
    this.queue = new OperationsQueue;

    // for unit tests, the logger won't usually be initialized, so create a dummy logger
    if (!this.logger) {
      this.logger = new DummyLoggerService;
    }

    this.skip_battle_actions = true; // prevent fighting when player first arrives in room 1

    // load the saved games
    if (this.demo) {
      // demo player with no saved games. just start the game.
      this.fresh_start();
    } else {
      // real player. check if loading a saved game, otherwise init normally
      for (const sv of saved_games) {
        this.saved_games[sv.slot] = sv;
      }
      // determine if resuming a saved game
      const saved_game_slot = window.localStorage.getItem('saved_game_slot');
      if (saved_game_slot) {

        // loading a saved game
        this.restore(saved_game_slot);
        window.localStorage.removeItem('saved_game_slot');
      } else {
        // new game
        this.fresh_start();
      }

    }

  }

  /**
   * Helper method to start the game when in demo mode or not loading a saved game
   */
  private fresh_start() {
    // new game
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
  tick(): void {
    if (!this.active) {
      return;
    }

    this.timer++;

    this.player.rechargeSpellAbilities();

    // if speed spell (or other timed spell) is active, decrease its time remaining
    for (const spell_name in this.player.spell_counters) {
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
    const light = this.artifacts.isLightSource();
    for (const a of this.artifacts.all) {
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

    if (this.in_battle) {
      this.is_battle_turn = true;
    }

    this.monsters.visible.forEach(m => m.turn_taken = false);
    this.queue.callback = () => this.monsterActions();
    this.queue.run();
  }

  monsterActions(): void {
    // non-player monster actions
    if (this.skip_battle_actions || !this.is_battle_turn) {
      this.afterMonsterActions();
      return;
    }

    const actor = this.monsters.visible.find(m => !m.turn_taken && !m.parent);
    if (actor === undefined) {
      // Everyone has acted. Begin end turn phase.
      this.afterMonsterActions();
      return;
    }

    if (this.in_battle) {
      this.queue.push(() => {
        actor.doBattleActions();
        actor.turn_taken = true;
      });
      this.queue.callback = () => this.monsterActions();
      this.queue.run();
    } else {
      // TODO: allow monsters to pick up weapons or cast heal spells even if the battle is over.
      actor.turn_taken = true;
      this.queue.callback = () => this.monsterActions();
      this.queue.run();
    }
  }

  afterMonsterActions(): void {
    // the first end turn event triggers here, so we can see any artifacts or monsters that have appeared,
    // but any monsters that have just entered the room won't be able to attack.
    this.triggerEvent("endTurn");
    this.artifacts.updateVisible();
    this.monsters.updateVisible();

    // clear the "skip battle" flag if it was set
    this.skip_battle_actions = false;
    this.is_battle_turn = false;

    this.queue.callback = () => this.endTurn();
    this.queue.run();
  }

  /**
   * Shows the room, artifact, and monster descriptions.
   */
  public endTurn(): void {
    if (game.died) return;

    const light = this.artifacts.isLightSource();
    // show room name and description
    if (this.rooms.current_room.is_dark && !light) {
      if (this.rooms.current_room.dark_name) {
        this.history.write(this.rooms.current_room.dark_name);
      }
      if (this.rooms.current_room.dark_description) {
        if (!this.rooms.current_room.visited_in_dark) {
          this.rooms.current_room.show_dark_description();
          this.rooms.current_room.visited_in_dark = true;
        }
      } else {
        game.history.write("It's too dark to see anything.");
      }
    } else {
      let room_name = this.rooms.current_room.name
      if (game.data['bort']) {
        room_name += ` (${this.rooms.current_room.id})`;
      }
      if (this.show_exits) {
        const possible_exits = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'u', 'd'];
        const available_exits = this.rooms.current_room.getVisibleExits().map(x => x.direction);
        const visible_exits = possible_exits.filter(x => available_exits.indexOf(x) !== -1).join('/').toUpperCase();
        room_name += ` (${visible_exits})`;
      }
      this.history.write(room_name);
      if (!this.rooms.current_room.seen) {
        this.rooms.current_room.show_description();
        this.rooms.current_room.seen = true;
        this.triggerEvent("seeRoom");
      }
    }

    // special effects that happen after room name/desc is shown, but before monster/artifact name/desc
    this.triggerEvent("endTurn1");

    // show monster and artifact descriptions
    if (light || !this.rooms.current_room.is_dark) {
      this.history.write(""); // blank line for white space
      let space = false;
      for (const m of this.monsters.visible) {
        if (!m.seen) {
          m.showDescription();
          m.seen = true;
          space = true;  // padding between desc and next monster
          this.triggerEvent("seeMonster", m);
        } else {
          if (!m.children.length) {
            this.history.write(`${m.getDisplayName()} is here.`, space ? "" : "no-space");
          } else {
            const count_here = m.children.filter(m => m.isHere()).length;
            if (count_here > 1) {
              this.history.write(`${count_here} ${m.name_plural} are here.`, space ? "" : "no-space");
            } else {
              this.history.write(`${m.name} is here.`, "no-space");
            }
          }
          space = false;
        }
      }

      space = false;
      for (const a of this.artifacts.visible) {
        if (!a.seen) {
          a.showDescription();
          space = true;  // padding between desc and next monster
          this.triggerEvent("seeArtifact", a);
          a.seen = true;
        } else {
          if (a.player_brought) {
            this.history.write(`Your ${a.name} is here.`, space ? "" : "no-space");
          } else {
            this.history.write(`You see ${a.getDisplayName()}.`, space ? "" : "no-space");
          }
          space = false;
        }
      }
    }

    // the third end-turn event triggers here, so things can happen after
    // we have seen the artifact and monster descriptions (e.g., some
    // monsters may speak when you see them)

    // Note: set callback before running event handler, so EH can change
    // to a different callback (e.g., hellsblade repeats attack phase)
    this.queue.callback = () => this.setReady();
    this.triggerEvent("endTurn2");
    this.queue.run();
  }

  /**
   * Resets the "ready" state
   */
  public setReady() {
    this.ready = true;
  }

  /**
   * Rolls a set of dice
   * @param {number} dice
   *   The number of dice
   * @param {number} sides
   *   The number of sides on each dice. Normally a positive integer but zero and negative numbers are also supported.
   */
  diceRoll(dice, sides) {

    // for unit testing, it's possible to set mock random numbers
    if (this.mock_random_numbers.length) {
      const num = this.mock_random_numbers.shift();
      console.debug("Used mock random number: " + num);
      return num;
    }

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
   * Returns a random element from an array
   * @param array
   *   A one-dimensional array; e.g., the array of rooms or monsters
   * @returns {any}
   */
  getRandomElement(array: any[]) {
    if (array.length === 1) {
      return array[0];
    }
    const index = this.diceRoll(1, array.length) - 1;
    if (typeof(array[index]) === 'undefined') {
      console.log('oops: getRandomElement rolled index: ', index, array);
      console.trace();
    }
    return array[index];
  }

  /**
   * Counts down a game counter and returns true if it just counted
   * down to zero
   * @param key
   */
  public countdown(key: string): boolean {
    if (this.counters[key] > 0) {
      this.counters[key] -= 1;
      if (this.counters[key] === 0) {
        return true;
      }
    }
    return false;
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
    for (const e of this.event_handlers) {
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
    // TODO: make this pause the queue
    this.active = false;
  }

  /**
   * Resumes a paused game
   */
  public resume() {
    // TODO: make this resume the queue
    this.active = true;
  }

  /**
   * Delays the output for a bit
   * @param {number} time
   *   The amount of time to delay, in seconds
   */
  public delay(time = 3): void {
    this.queue.delay(time);
  }

  /**
   * Handles successful game exit.
   */
  public exit() {
    if (this.triggerEvent('exit')) {
      this.active = false;
      this.won = true;
      this.queue.run();

      this.logger.log('exit adventure', this.timer);
      for (const s in this.statistics) {
        this.logger.log(s, this.statistics[s]);
      }

      // delete the saved games
      const axios = getAxios();
      for (let slot=1; slot <= 10; slot++) {
        const saved_game = this.saved_games[slot];
        if (saved_game) {
          axios.delete("/saves/" + saved_game.id + '.json?uuid=' + window.localStorage.getItem('eamon_uuid'))
            .then(res => {
              delete this.saved_games[slot];
              this.logger.log("deleted saved game #" + saved_game.id);
            })
            .catch(err => {
              console.error(err);
            });
        }
      }
    }
  }

  /**
   * Handles player death.
   * @param {boolean} show_health
   *   whether to show the "player is dead" message. Usually true, except if the player
   *   was killed during combat, when the message will already have been shown.
   */
  public die(show_health = true) {
    this.player.damage = this.player.hardiness;
    if (show_health) this.player.showHealth();
    if (this.triggerEvent("death", this.player)) {
      this.active = false;
      this.died = true;
      this.queue.run();

      // saved games needs to be an array for rendering in browser
      this.saves = [];
      for (let i = 1; i <= 10; i++) {
        if (this.saved_games.hasOwnProperty(i)) {
          this.saves.push(i + ": " + this.saved_games[i].description);
        }
      }

      this.logger.log('died on move', this.timer);
      this.logger.log('died in room', this.player.room_id);
      for (const s in this.statistics) {
        if (s.indexOf('damage') !== -1) {
          this.logger.log(s, this.statistics[s]);
        }
      }
    }
  }

  /**
   * Save the game
   * @param {number} slot
   *   The saved game slot (1-10)
   * @param {string} description
   *   The description to give the saved game (e.g., "before maze" or "after fighting dragon")
   */
  public save(slot, description) {
    this.logger.log('save game to slot ' + slot + ': ' + description);
    const sv = {
      player_id: window.localStorage.getItem('player_id'),
      uuid: window.localStorage.getItem('eamon_uuid'),
      adventure_id: this.id,
      slot,
      description,
      data: {
        version: 2.1,
        rooms: this.rooms.rooms,
        artifacts: this.artifacts.serialize(),
        effects: this.effects.all,
        monsters: this.monsters.serialize(),
        timer: this.timer,
        gamedata: this.data
      },
    };

    // save to the API
    const axios = getAxios();
    sv.data = compressToBase64(JSON.stringify(sv.data));
    axios.post("/saves?uuid=" + window.localStorage.getItem('eamon_uuid'), sv)
      .then(res => {
        this.saved_games[slot] = res.data;
      }).catch(err => {
        this.history.write("Error saving game!");
        console.error(err);
      }
    );
  }

  /**
   * Restore a save game
   * @param {number} slot
   *   The saved game slot (1-10)
   */
  public restore(slot) {
    this.logger.log('restore game from slot ' + slot);
    const axios = getAxios();
    const save = this.saved_games[slot];
    if (!save) {
      this.history.write("Error restoring saved game!");
      this.logger.log(`failed to restore save ${slot}. saved game might have been deleted.`);
      return;
    }
    axios.get("/saves/" + save.id + ".json?uuid=" + window.localStorage.getItem('eamon_uuid'))
      .then(
      res => {
        const data = JSON.parse(decompressFromBase64(res.data.data));
        // the serialized data looks just like the data from the API, so we just need to recreate the repositories.
        this.rooms = new RoomRepository(data.rooms);
        this.artifacts = new ArtifactRepository(data.artifacts);
        this.effects = new EffectRepository(data.effects);
        // older saved games didn't have the child monsters for groups, so we'll need to unpack those in that case.
        const skip_unpacking_groups = data.version && data.version >= 2.1;
        this.monsters = new MonsterRepository(data.monsters, skip_unpacking_groups);
        this.player = this.monsters.get(0);
        this.rooms.current_room = this.rooms.getRoomById(this.player.room_id);
        this.player.updateInventory();
        this.artifacts.updateVisible();
        this.monsters.updateVisible();
        this.timer = data.timer;
        this.data = data.gamedata;

        this.died = false;
        this.active = true;
        this.started = true;
        this.ready = true;

        this.history = new HistoryManager;
        this.history.push("restore");
        this.history.write("Game restored from slot " + slot + ".");

        // run end turn method to show location, monsters, and artifacts
        this.endTurn();

        // this forces the React component to re-render
        this.refresh();
      }
    ).catch(error => {
      this.history.write("Error restoring saved game! Not found.");
      console.error(error);
    });
  }

}
