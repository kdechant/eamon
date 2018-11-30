import * as React from 'react';
import axios from "axios";
import {getHeaders} from "../../main-hall/utils/api";

class SamSlicker extends React.Component<any, any> {

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
    axios.put("/api/players/" + window.localStorage.getItem('player_id'), game.player, {headers: getHeaders()})
      .then(() => {
        window.location.href = "/main-hall/hall";
      })
      .catch(error => {
        game.after_sell_messages.push("Error saving player data!");
        this.props.setGameState(game);
        console.error(error);
      });
  };

  public render() {
    const game = this.props.game;

    const weapons = game.player.inventory.filter(x => x.is_weapon);
    
    if (weapons.length > 4) {
      return (
        <div>
          <p>As you enter the Main Hall, Lord William Missilefire approaches you and says, &quot;You have too many weapons to keep them all. Four is the legal limit.&quot;</p>
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
                    <img src={icon_url} title={ artifact.getTypeName() } />
                  </td>
                  <td>{ artifact.weapon_odds }%</td>
                  <td>{ artifact.dice } d { artifact.sides }</td>
                  <td>{ artifact.value } gp</td>
                  <td>
                    <button className="btn" onClick={() => this.sell(artifact)}>Sell</button>
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

    let exitButtons = (
      <button className="btn btn-primary" onClick={this.savePlayer}>Save and go to main hall</button>
    );
    if (game.demo) {
      exitButtons = (
        <div>
          <p>You have completed the adventure with the demo character. The demo character cannot be saved.</p>
          <p>
            <button className="btn btn-primary mr-2" onClick={() => { window.location.href = "/main-hall" }}>Create your own character</button>
            <button className="btn btn-primary" onClick={() => { window.location.href = "/adventure-list" }}>Back to adventure list</button>
          </p>
        </div>
      )
    }

    return (
      <div>
        <p>When you reach the main hall, you deliver your goods to Sam Slicker, the local buyer for such things. He examines your items and pays you what they are worth...</p>
        <p>He pays you {game.player.profit} gold pieces total.</p>

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
