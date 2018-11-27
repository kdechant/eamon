import * as React from 'react';
import axios from "axios";

import {getHeaders, log} from "../utils/api";

class SavedGameTile extends React.Component<any, any> {
  public state: any = {
    message: "",
  };

  public loadSavedGame = () => {
    window.localStorage.setItem('saved_game_slot', this.props.savedGame.slot);
    window.location.href = '/adventure/' + this.props.savedGame.adventure.slug;
  };

  public deleteSavedGame = () => {
    if (confirm("Are you sure you want to delete this saved game?")) {
      this.setState({message: 'Deleted!'});
      setTimeout(() => {
        const uuid = window.localStorage.getItem('eamon_uuid');
        console.log(this.props.savedGame);
        axios.delete("/api/saves/" + this.props.savedGame.id + '.json?uuid=' + uuid, {headers: getHeaders()})
          .then(res => {
            const player = this.props.player;
            player.saved_games = player.saved_games.filter(sv => sv.id !== this.props.savedGame.id);
            log("delete saved game #" + this.props.savedGame.id)
              .then(r => {
                this.props.setPlayerState(player);
              })
              .catch(err => {
                console.error(err);
                this.setState({message: 'Error'});
              });
          })
          .catch(err => {
            console.error(err);
            this.setState({message: 'Error'});
          });
      }, 1250);
    }
  };

  public render() {

    const messageStyle = {
      "opacity": this.state.message === "" ? 0 : 1
    };

    return (
      <div className="artifact-tile col-sm-6 col-md-4 col-lg-3">
        <div className="artifact-tile-inner">
          <div className="artifact-icon">
            <img src="/static/images/ravenmore/128/map.png" title={this.props.savedGame.description} />
          </div>
          <div className="artifact-name">
            <strong>{this.props.savedGame.adventure.name}</strong>
          </div>
          <div className="artifact-data">
            <p>Save #{this.props.savedGame.slot}: {this.props.savedGame.description}</p>
          </div>
          <div className="artifact-buttons">
            <button className="btn btn-primary" onClick={this.loadSavedGame}>Resume</button>
            <button className="btn btn-warning" onClick={this.deleteSavedGame}>Delete</button>
          </div>
          <div className="message" style={messageStyle}>
            {this.state.message}
          </div>
        </div>
      </div>
    );
  }
}

export default SavedGameTile;
