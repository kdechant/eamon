import * as React from 'react';
import {useEffect, useState} from "react";
import axios from "axios";
import Game from "../models/game";
import IntroText from "./IntroText";
import Hints from "./Hints";
import History from "./History";
import CommandPrompt from "./CommandPrompt";
import Question from "./Question";
import HowToPlay from "./HowToPlay";
import CommandList from "./CommandList";
import Status from "./Status";
import SamSlicker from "./SamSlicker";
import Logger from "../utils/logger";

declare const game: Game;
const globalGame = game;


const MainProgram: React.FC = () => {
  const [game, setGame] = useState(globalGame);
  const [statusOpen, setStatusOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [, forceRefresh] = useState(0);  // used for forcing re-render

  useEffect(() => {

    // In a real game we want to log to the API, so pass in a live Logger class.
    // This replaces the dummy logger class which is the default in the Game object.
    game.logger = new Logger;

    // Pass this component's "set state" function into the game class to
    // allow the object's methods to trigger re-render of components. hacky...
    game.refresher = () => forceRefresh(Date.now());

    // load game data from the API
    if (game.slug === 'demo1') {
      // The "demo" adventure. Load everything from the mock data.
      const path = "/static/mock-data";
      axios.all([
        axios.get(path + '/adventure.json'),
        axios.get(path + '/rooms.json'),
        axios.get(path + '/artifacts.json'),
        axios.get(path + '/effects.json'),
        axios.get(path + '/monsters.json'),
        axios.get(path + '/player.json'),
      ])
       .then(responses => {
          game.init(responses[0].data, responses[1].data, responses[2].data, responses[3].data, responses[4].data, [], responses[5].data, []);
          setGame(game);
          forceRefresh(Date.now());
        });
    } else {
      // All "real" adventures. We load adventure data from the API, and the player data comes from either
      // the API (for "real" players) or from mock data (if running in "demo" mode)
      const player_id = window.localStorage.getItem('player_id');
      const uuid = window.localStorage.getItem('eamon_uuid');

      // check if we're using mock or real player data
      let player_path = "/api/players/" + player_id + '.json?uuid=' + uuid;
      if (game.demo) {
        // playing a normal adventure with the demo player
        player_path = "/static/mock-data/player.json";
      }

      axios.all([
        axios.get("/api/adventures/" + game.slug),
        axios.get("/api/adventures/" + game.slug + "/rooms"),
        axios.get("/api/adventures/" + game.slug + "/artifacts"),
        axios.get("/api/adventures/" + game.slug + "/effects"),
        axios.get("/api/adventures/" + game.slug + "/monsters"),
        axios.get("/api/adventures/" + game.slug + "/hints"),
        axios.get(player_path),
        axios.get('/api/saves.json?player_id=' + (game.demo ? 0 : player_id) + '&slug=' + game.slug)
      ])
      // Note: I tried using axios.spread as shown in the axios documentation but it seemed to hang
      // at the end of the callback. Just using regular callback instead.
       .then(responses => {
          game.init(responses[0].data, responses[1].data, responses[2].data, responses[3].data, responses[4].data, responses[5].data, responses[6].data, responses[7].data);
          setGame(game);
          forceRefresh(Date.now());
        });
    }
  }, []);

  /**
   * Toggles whether the status window is open (for mobile)
   */
  const toggleStatus = () => {
    setStatusOpen(statusOpen => !statusOpen);
  };

  /**
   * Toggles whether the menu window is open (for mobile)
   */
  const toggleMenu = () => {
    setMenuOpen(menuOpen => !menuOpen);
  };

  const toggleHints = () => {
    setHintsOpen(hintsOpen => !hintsOpen);
  };

  const toggleCommands = () => {
    setCommandsOpen(commandsOpen => !commandsOpen);
  };

  const toggleHowToPlay = () => {
    setHowToPlayOpen(howToPlayOpen => !howToPlayOpen);
  };

  /**
   * Closes the active modal
   */
  const closeModal = () => {
    setHintsOpen(false);
    setCommandsOpen(false);
    setHowToPlayOpen(false);
  }

  if (!game || !game.player) {
    return (
      <div className="container-fluid" id="game">
        <div className="main-heading">
          <h1>{game.name}</h1>
        </div>

        <div className="parchment">
          <div className="parchment-inner">
            Waking up the monsters...
          </div>
        </div>
      </div>
    );
  }

  // show the intro text, if the game has any, and the player hasn't seen it yet
  if (!game.started && game.intro_text) {
    return (
      <div className="container-fluid" id="game">
        <GameHeading game={game} toggleStatus={toggleStatus} toggleMenu={toggleMenu} menuOpen={menuOpen} />

        <div className="parchment">
          <div className="parchment-inner">
            <IntroText game={game} setGameState={setGame}/>
          </div>
        </div>
      </div>
    );
  }

  if (game.selling) {
    return (
      <div className="container-fluid" id="game">
        <GameHeading game={game} toggleStatus={toggleStatus} toggleMenu={toggleMenu} menuOpen={menuOpen} />

        <div className="parchment">
          <div className="parchment-inner">
            <SamSlicker game={game} setGameState={setGame} />
          </div>
        </div>
      </div>
    );
  }

  // the regular game engine
  const historyClass = statusOpen ? 'd-none': '';
  const menuClass = menuOpen ? '' : 'd-none';
  return (
    <div className="container-fluid" id="game">
      <GameHeading game={game} toggleStatus={toggleStatus} toggleMenu={toggleMenu} menuOpen={menuOpen} />

      <div className="game row">

        {/* history parchment and command prompt */}
        <div className={`command col-md-7 ${historyClass}`}>
          <div className="parchment">
            <div className="parchment-inner">
              <History historyManager={game.history} />
              {!game.modal.visible && (
                <div>
                  <CommandPrompt game={game} setGameState={setGame}/>
                  <div className="hints-command-list d-none d-md-block">
                    <button type="button" className="btn btn-secondary" onClick={toggleHowToPlay}>
                      How to Play
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={toggleHints}>
                      Hints
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={toggleCommands}>
                      Command List
                    </button>
                  </div>
                </div>
              )}

              {game.modal.visible && (
                <Question game={game} setGameState={setGame}/>
              )}
            </div>
          </div>
        </div>

        {/* status box (outside the parchment */}
        <Status game={game} open={statusOpen}/>

        {/* hamburger menu */}
        <div id="menu" className={'container-fluid ' + menuClass}>
          <div className="row">
            <ul>
              <li><a className="text-primary" onClick={toggleHowToPlay}>How to Play</a></li>
              <li><a className="text-primary" onClick={toggleHints}>Hints</a></li>
              <li><a className="text-primary" onClick={toggleCommands}>Command List</a></li>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About Eamon</a></li>
              <li><a href="/news">News</a></li>
              <li><a href="/manual">Manual</a></li>
              <li><a href="https://github.com/kdechant/eamon" target="_blank">Source Code</a></li>
              <li><a href="https://github.com/kdechant/eamon/issues" target="_blank">Report a Bug</a></li>
              <li><a href="https://www.kdechant.com/">About the Author</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* modals */}
        <HowToPlay game={game} visible={howToPlayOpen} toggle={closeModal}/>
        <Hints game={game} visible={hintsOpen} toggle={closeModal}/>
        <CommandList game={game} visible={commandsOpen} toggle={closeModal}/>

      </div>
    </div>
  );
}

export default MainProgram;

type GameHeadingProps = {
  game: Game;
  toggleStatus: () => void;
  toggleMenu: () => void;
  menuOpen: boolean
  statusOpen?: boolean
}

const GameHeading: React.FC<GameHeadingProps> = (props) => {
  const game = props.game;
  return (
    <div className="container-fluid main-heading">
      <div className="row no-gutters">
        <div className="col-6 col-md-12">
          <h1>{game.name}</h1>
        </div>
        <div className="player-name col-4 text-right">
          <span>{game.player.name}<br />
            ({ game.player.hardiness - game.player.damage }/{ game.player.hardiness })</span>
        </div>
        <div className="player-menu col-1">
          <button aria-haspopup={true} aria-expanded={props.statusOpen}
            onClick={props.toggleStatus}>
            {props.statusOpen ?
              <img src="/static/images/ravenmore/128/backpack.png" alt="Backpack Icon - Opens status screen"
                   title="View Status"/> :
              <img src="/static/images/ravenmore/128/backpack_open.png" alt="Backpack Icon - Closes status screen"
                   title="Hide Status"/>
            }
          </button>
        </div>
        <div className="player-menu col-1">
          <button className={'sidebarIconToggle' + (props.menuOpen ? ' open' : ' closed')} aria-haspopup={true} aria-expanded={props.menuOpen}
            onClick={props.toggleMenu}>
            <div className="spinner diagonal part-1" />
            <div className="spinner horizontal" />
            <div className="spinner diagonal part-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
