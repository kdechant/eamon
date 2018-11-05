import axios from 'axios';
import * as React from 'react';
import { Player } from '../models/player';
import PlayerListItem from "./PlayerListItem";
import { Link } from "react-router-dom";

class PlayerList extends React.Component {
  public state: any = {
    players: [],
    uuid: ""
  };

  public componentDidMount() {
    const uuid = window.localStorage.getItem('eamon_uuid');
    this.setState({ uuid });
    axios.get('/api/players.json?uuid=' + uuid)
      .then(res => {
        const players = res.data.map(pl => {
          let p = new Player();
          p.init(pl);
          p.update();
          return p;
        });
        this.setState({ players });
      });
  }

  public render() {

    let empty_message = (<span />);
    if (this.state.players.length === 0) {
      empty_message = (<p>There are no adventurers in the guest book.</p>)
    }

    return (
      <div id="PlayerList">
        <p>You are in the outer chamber of the hall of the Guild of Free Adventurers. Many men and women are guzzling beer and there is loud singing and laughter.</p>
        <p>On the north side of the chamber is a cubbyhole with a desk. Over the desk is a sign which says: <strong>&quot;REGISTER HERE OR ELSE!&quot;</strong></p>
        <p>Behind the desk is a burly Irishman who looks at you with a scowl and asks, &quot;What's your name?&quot;</p>
        <p>The guest book on the desk lists the following adventurers:</p>
        <div className="row">
          {this.state.players.map(player => <PlayerListItem key={player.id} player={player} /> )}
        </div>
        {empty_message}
        <p className="addplayer"><Link to="/main-hall/register"><strong>Create a New Adventurer</strong></Link></p>
      </div>
    );
  }
}

export default PlayerList;
