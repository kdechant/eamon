import axios from 'axios';
import * as React from 'react';
import { Link } from "react-router-dom";
import diceRoll from "../utils/dice";
import * as uuid from 'uuid';

class PlayerCreate extends React.Component {
  public state: any = {
    id: null,
    name: "",
    gender: "m",
    hardiness: 0,
    agility: 0,
    charisma: 0
  };

  public componentDidMount() {
    this.rollStats();

    // set the UUID if it's not already in local storage
    if (!window.localStorage.getItem('eamon_uuid')) {
      window.localStorage.setItem('eamon_uuid', uuid());
    }
  }

  /**
   * Re-rolls the stats if the player didn't like them
   */
  public reroll = () => {
    this.rollStats();
  };

  /**
   * Rolls a set of stats for the player
   */
  private rollStats(): void {
    let hardiness = 0;
    let agility = 0;
    let charisma = 0;
    while (hardiness < 15 || agility < 12
      || hardiness + agility + charisma < 42) {
      hardiness = diceRoll(3, 7);
      agility = diceRoll(3, 7);
      charisma = diceRoll(3, 7);
    }
    this.setState({ hardiness, agility, charisma });
  }

  public handleChange = (event) => {
    const change = {};
    change[event.target.name] = event.target.value;
    this.setState(change);
  };

  public handleSubmit = (event) => {
    event.preventDefault();

    // save new player to the API
    let {id, error, ...player} = this.state;
    player.uuid = window.localStorage.getItem('eamon_uuid');
    axios.post("/api/players", player)
      .then((res) => {
        this.setState({id: res.data.id});
        window.localStorage.setItem('player_id', res.data.id);
      }).catch((err) => {
        console.error(err);
        this.setState({error: true});
      });
  };

  public render() {



    if (this.state.id) {
      return (
        <div className="col-sm-12" id="PlayerCreate">
          <div id="prosper">
            <p>The man behind the desk says, &quot;It is now time for you to start your life. Your first
              task will be to buy weapons and armor and test your skill on a suitable Beginner adventure.&quot;
              He makes an odd sign with his hand and says, &quot;Live long and prosper.&quot;</p>
            <p>You now wander into the Main Hall...</p>
            <Link to="/main-hall/hall" className="btn btn-primary">Next</Link>
          </div>
        </div>
      )
    }

    // TODO: show an error message in the browser if the POST XHR failed

    return (
      <div className="col-sm-12" id="PlayerCreate">
        <p>The burly Irishman hits his forehead and says, &quot;Ah, ye must be new here! Well, wait just a minute and
          I'll bring someone out to take care of ye.&quot;</p>
        <p>The Irishman walks away and in walks a serious, pointy-eared man of possibly Elfish descent.</p>
        <p>He studies you for a moment and says, &quot;Please enter your name and gender.&quot;</p>

        <form onSubmit={this.handleSubmit}>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" className="form-control" id="name" name="name" value={this.state.name} onChange={this.handleChange} />
          </div>
          <div className="row margin-bottom-md">
            <div className="col-sm-2">
              <label>
                  <input name="gender" type="radio" value="m" checked={this.state.gender === "m"} onChange={this.handleChange} />
                  Male
              </label>
            </div>
            <div className="col-sm-2">
              <label>
                  <input name="gender" type="radio" value="f" checked={this.state.gender === "f"} onChange={this.handleChange} />
                  Female
              </label>
            </div>
          </div>
          <p>&quot;Your prime attributes are--&quot;</p>
          <div className="row margin-bottom-md">
            <div className="col-sm-4 col-lg-3 text-center">
              <p><strong>Hardiness</strong></p>
              <p className="stat">{this.state.hardiness}</p>
              <p><small>Hit points. Also determines how much you can carry.</small></p>
            </div>
            <div className="col-sm-4 col-lg-3 text-center">
              <p><strong>Agility</strong></p>
              <p className="stat">{this.state.agility}</p>
              <p><small>Increases your chance to hit, and makes you harder to hit.</small></p>
            </div>
            <div className="col-sm-4 col-lg-3 text-center">
              <p><strong>Charisma</strong></p>
              <p className="stat">{this.state.charisma}</p>
              <p><small>Makes some monsters and NPCs more friendly.</small></p>
            </div>
          </div>
          <div className="buttons">
            <button type="button" className="btn btn-secondary mr-2" id="reroll" onClick={this.reroll}>Reroll</button>
            <button type="submit" className="btn btn-primary mr-2">Begin Your Adventuring Career</button>
            <Link to="/main-hall" className="btn btn-secondary" id="cancel">Cancel</Link>
          </div>
        </form>

      </div>
    );
  }
}

export default PlayerCreate;
