import * as pluralize from 'pluralize';
import * as React from 'react';
import axios from "axios";
import {getHeaders, getAxios} from "../../main-hall/utils/api";
import Game from "../models/game";

declare var game: Game;

class SamSlicker extends React.Component<any, any> {

  public constructor(props) {
    super(props);
    // the game object is created globally and gets added to the props here
    this.state = {
      game,
      player_id: window.localStorage.getItem('player_id'),
      uuid: window.localStorage.getItem('eamon_uuid'),
      rating: {
        overall: null,
        combat: null,
        puzzle: null
      }
    };
  }

  public componentDidMount() {
    const axios = getAxios();
    axios.get(`ratings.json?player_id=${game.player.id}&adventure_id=${game.id}&uuid=${this.state.uuid}`)
      .then(response => {
        if (response.data.length > 0) {
          this.setState({rating: response.data[0]});
        }
        setTimeout(() => { console.log(this.state)}, 50);
      })
      .catch(error => {
        game.after_sell_messages.push("Error loading rating!");
        console.error(error);
      });
  }

  private sell = (artifact) => {
    const game = this.props.game;
    let i = game.player.inventory.indexOf(artifact);
    game.player.inventory.splice(i, 1);
    game.player.profit += artifact.value;
    artifact.destroy();
    this.props.setGameState(game);
  };

  private savePlayer = () => {
    const game = this.props.game;
    game.player.gold += game.player.profit;
    let axios = getAxios();

    let rating_data = {
      ...this.state.rating,
      uuid: this.state.uuid,
      player_id: this.state.player_id,
      adventure_id: this.state.game.id
    };
    axios.post(`ratings.json`, rating_data)
      .then(res => {
        axios.put(`players/${this.state.player_id}`, game.player)
          .then(() => {
            window.location.href = "/main-hall/hall";
          })
          .catch(error => {
            game.after_sell_messages.push("Error saving player data!");
            this.props.setGameState(game);
            console.error(error);
          });
      }).catch(err => {
        game.after_sell_messages.push("Error saving rating!");
        console.error(err);
      }
    );

  };

  private updateRating = (type, value) => {
    const axios = getAxios();
    let rating = { ...this.state.rating };
    rating[type] = value;
    this.setState({rating});
  };

  public render() {
    const game = this.props.game;
    const weapons = game.player.inventory.filter(x => x.is_weapon);

    if (weapons.length > 4) {
      return (
        <div>
          <p>As you enter the Main Hall, {game.lwm_name} approaches you and says, &quot;You have too many weapons to keep them all. Four is the legal limit.&quot;</p>
          <p>Your weapons are:</p>
          <table className="table artifacts-list">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Odds</th>
                <th>Damage</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
            {weapons.map(artifact => {
              const icon_url = '/static/images/ravenmore/128/' + artifact.getIcon() + '.png';
              return (
                <tr className="artifact" key={artifact.id}>
                  <td>{ artifact.name }</td>
                  <td className="weapon-icon">
                    <img src={icon_url} alt={ artifact.getTypeName() } title={ artifact.getTypeName() } />
                  </td>
                  <td>{ artifact.weapon_odds }%</td>
                  <td>{ artifact.dice } d { artifact.sides }</td>
                  <td>{ artifact.value } gp</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => this.sell(artifact)}>Sell</button>
                  </td>
                </tr>
              );
            }
            )}
            </tbody>
          </table>
          </div>
      );
    }

    // query api for ratings for this player

    // build the rating buttons
    let ratingButtons = (
      <div className="container">
      <div className="row">
        <div className="ratings col-md-6 offset-md-3 p-2">
          <h3>Rate this adventure</h3>
          <p>What did you think of this adventure overall?</p>
          <p>
            {[1,2,3,4,5].map(i => (
              <a key={i} href="#"
                 onClick={() => this.updateRating('overall', i)}
                 className={this.state.rating.overall >= i ? 'active' : 'inactive'}>
                <img src="/static/images/ravenmore/128/star.png" alt={"Star " + i} />
              </a>
            ))}
          </p>
          <p>How would you rate the difficulty of combat?</p>
          <p>
            {[1,2,3,4,5].map(i => (
              <a key={i} href="#"
                 onClick={() => this.updateRating('combat', i)}
                 className={this.state.rating.combat >= i ? 'active' : ''}>
                <img src="/static/images/ravenmore/128/sword.png" alt={"Sword " + i} />
              </a>
            ))}
          </p>
          <p>How would you rate the difficulty of the puzzles?</p>
            {[1,2,3,4,5].map(i => (
              <a key={i} href="#"
                 onClick={() => this.updateRating('puzzle', i)}
                 className={this.state.rating.puzzle >= i ? 'active' : ''}>
                <img src="/static/images/ravenmore/128/tome.png" alt={"Book " + i} />
              </a>
            ))}
        </div>
      </div>
      </div>
    );

    let exitButtons = (
      <div>
        {ratingButtons}
        <button className="btn btn-primary" onClick={this.savePlayer}>Save and go to main hall</button>
      </div>
    );
    if (game.demo) {
      exitButtons = (
        <div>
          {ratingButtons}
          <p>You have completed the adventure with the demo character. The demo character cannot be saved.</p>
          <p>
            <button className="btn btn-primary mr-2" onClick={() => { window.location.href = "/main-hall" }}>Create your own character</button>
            <button className="btn btn-primary" onClick={() => { window.location.href = "/adventure-list" }}>Back to adventure list</button>
          </p>
        </div>
      )
    }

    let profit = game.player.profit.toLocaleString();
    let money_name = pluralize(game.money_name, game.player.profit);
    return (
      <div>
        <p>When you reach the main hall, you deliver your goods to {game.ss_name}, the local buyer for such things. He examines your items and pays you what they are worth...</p>
        <p>He pays you {profit} {money_name} total.</p>

        {/* messages that appear after the sale completes, like "the rebels reward you for killing darth vader" */}
        {game.after_sell_messages.map((msg, index) =>
          <p key={index}>{msg}</p>
        )}

        {exitButtons}
      </div>
    );
  }

}

export default SamSlicker;
