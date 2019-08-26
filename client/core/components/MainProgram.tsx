import * as React from 'react';
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

declare var game;

class MainProgram extends React.Component<any, any> {

  public constructor(props) {
    super(props);
    // the game object is created globally and gets added to the props here
    this.state = {
      game,
      uuid: window.localStorage.getItem('eamon_uuid'),
      statusOpen: false,
      menuOpen: false
    };
  }

  public componentDidMount() {
    const game: Game = this.state.game;

    // In a real game we want to log to the API, so pass in a live Logger class.
    // This replaces the dummy logger class which is the default in the Game object.
    game.logger = new Logger;

    // pass this component's "set state" method into the game class to
    // allow the object's methods to trigger re-render of components. hacky...
    game.refresher = this.setGameState;

    // load game data from the API
    // TODO: this could be refactored into a method on the Game class.
    if (game.slug === 'demo1') {
      // The "demo" adventure. Load everything from the mock data.
      let path = "/static/mock-data";
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
          this.setState({game});
        });
    } else {
      // All "real" adventures. We load adventure data from the API, and the player data comes from either
      // the API (for "real" players) or from mock data (if running in "demo" mode)
      let player_id = window.localStorage.getItem('player_id');

      // check if we're using mock or real player data
      let player_path = "/api/players/" + player_id + '.json?uuid=' + this.state.uuid;
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
          this.setState({game});
        });
    }

  };

  /**
   * Persists the game object to the state. Pass this as a prop
   * to a child element to allow it to alter the game state.
   * @param {Game} game The game object
   */
  public setGameState = (game: Game) => {
    this.setState({ game });
  };

  /**
   * Toggles whether the status window is open (for mobile)
   */
  public toggleStatus = () => {
    console.log("toggle status");
    this.setState({statusOpen: !this.state.statusOpen});
  };

  /**
   * Toggles whether the menu window is open (for mobile)
   */
  public toggleMenu = () => {
    this.setState({menuOpen: !this.state.menuOpen});
    console.log("toggle menu to", this.state.menuOpen);
  };

  public render() {

    const game = this.state.game;

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
          <GameHeading game={game} toggleStatus={this.toggleStatus} toggleMenu={this.toggleMenu} menuOpen={this.state.menuOpen} />

          <div className="parchment">
            <div className="parchment-inner">
              <IntroText game={this.state.game} setGameState={this.setGameState}/>
            </div>
          </div>
        </div>
      );
    }

    if (game.selling) {
      return (
        <div className="container-fluid" id="game">
          <GameHeading game={game} toggleStatus={this.toggleStatus} toggleMenu={this.toggleMenu} menuOpen={this.state.menuOpen} />

          <div className="parchment">
            <div className="parchment-inner">
              <SamSlicker game={this.state.game} setGameState={this.setGameState} />
            </div>
          </div>
        </div>
      );
    }

    // the regular game engine
    let historyClass = this.state.statusOpen ? 'd-none': '';
    let menuClass = this.state.menuOpen ? '' : 'd-none';
    return (
      <div className="container-fluid" id="game">
          <GameHeading game={game} toggleStatus={this.toggleStatus} toggleMenu={this.toggleMenu} menuOpen={this.state.menuOpen} />

        <div className="game row">

          {/* history parchment and command prompt */}
          <div className={`command col-md-7 ${historyClass}`}>
            <div className="parchment">
              <div className="parchment-inner">
                <History game={this.state.game}/>
                {!game.modal.visible && (
                  <div>
                    <CommandPrompt game={this.state.game} setGameState={this.setGameState}/>
                    <div className="hints-command-list d-none d-md-block">
                      <HowToPlay game={this.state.game}/>
                      <Hints game={this.state.game}/>
                      <CommandList game={this.state.game}/>
                    </div>
                  </div>
                )}

                {game.modal.visible && (
                  <Question game={this.state.game} setGameState={this.setGameState}/>
                )}
              </div>
            </div>
          </div>

          {/* status box (outside the parchment */}
          <Status game={this.state.game} open={this.state.statusOpen}/>

          {/* hamburger menu */}
          <div id="menu" className={'container-fluid ' + menuClass}>
            <div className="row">
              <ul>
                <li>How to Play</li>
                <li>Hints</li>
                <li>List Commands</li>
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
        </div>
      </div>
    );
  }
}

export default MainProgram;

class GameHeading extends React.Component<any, any> {

  public render() {
    let game = this.props.game;
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
            <button aria-haspopup={true} aria-expanded={this.props.statusOpen}
              onClick={this.props.toggleStatus}>
              {this.props.statusOpen ?
                <img src="/static/images/ravenmore/128/backpack.png" alt="Backpack Icon - Opens status screen"
                     title="View Status"/> :
                <img src="/static/images/ravenmore/128/backpack_open.png" alt="Backpack Icon - Closes status screen"
                     title="Hide Status"/>
              }
            </button>
          </div>
          <div className="player-menu col-1">
            <button className={'sidebarIconToggle' + (this.props.menuOpen ? ' open' : ' closed')} aria-haspopup={true} aria-expanded={this.props.menuOpen}
              onClick={this.props.toggleMenu}>
              <div className="spinner diagonal part-1" />
              <div className="spinner horizontal" />
              <div className="spinner diagonal part-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
