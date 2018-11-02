import axios from 'axios';
import * as React from 'react';
import PlayerListItem from "./PlayerListItem";

class PlayerList extends React.Component {
  public state: any = {
    players: [],
    uuid: ""
  };

  public componentDidMount() {
    const uuid = window.localStorage.getItem('eamon_uuid');
    console.log("uuid", uuid);
    this.setState({ uuid });
    axios.get('/api/players.json?uuid=' + uuid)
      .then(res => {
        console.log("Loaded something from API", res.data);
        this.setState({ players: res.data });
      });
  }

  public render() {
    return (
      <div id="PlayerList">
        <p>You are in the outer chamber of the hall of the Guild of Free Adventurers. Many men and women are guzzling beer and there is loud singing and laughter.</p>
        <p>On the north side of the chamber is a cubbyhole with a desk. Over the desk is a sign which says: <strong>&quot;REGISTER HERE OR ELSE!&quot;</strong></p>
        <p>Behind the desk is a burly Irishman who looks at you with a scowl and asks, &quot;What's your name?&quot;</p>
        <p>The guest book on the desk lists the following adventurers:</p>
        <div className="row">
          {this.state.players.map(player => <PlayerListItem key={player.id} player={player} /> )}
        </div>
      </div>
    );
  }
}

export default PlayerList;
