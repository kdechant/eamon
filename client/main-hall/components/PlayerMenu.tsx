import * as React from 'react';
import { Link } from "react-router-dom";
import Status from "./Status";

class PlayerMenu extends React.Component<any, any> {

  // TODO: show the saved game list here...

  public exit = (ev) => {
    console.log('exit');
    this.props.player.save()
      .then((res) => {
        window.localStorage.removeItem('player_id');
        window.location.href = "/main-hall";
      })
      .catch((err) => {
        console.error(err);
        this.setState({error: true});
      });
  };

  public render() {
    return (
      <div className="row">
        <div className="col-sm">
          <h2>Main Hall</h2>
          <p>You are in the main hall of the Guild of Free Adventurers. You can do the following:</p>
          <nav className="row icon-nav">
            <p className="col-6 col-lg-4">
              <Link to="/main-hall/adventure"><img src="/static/images/ravenmore/128/map.png" aria-hidden="true" /><br />
                Go on an adventure</Link>
            </p>
            <p className="col-6 col-lg-4">
              <Link to="/main-hall/shop"><img src="/static/images/ravenmore/128/axe2.png" aria-hidden="true" /><br />
                Visit the weapons shop</Link>
            </p>
            <p className="col-6 col-lg-4">
              <Link to="/main-hall/wizard"><img src="/static/images/ravenmore/128/tome.png" aria-hidden="true" /><br />
                Find a wizard to teach you some spells</Link></p>
            <p className="col-6 col-lg-4">
              <Link to="/main-hall/witch"><img src="/static/images/ravenmore/128/potion.png" aria-hidden="true" /><br />
                Visit the witch to increase your attributes</Link>
            </p>
            <p className="col-6 col-lg-4">
              <Link to="/main-hall/bank"><img src="/static/images/ravenmore/128/coin.png" aria-hidden="true" /><br />
                Find the banker to deposit or withdraw some gold</Link>
            </p>
            <p className="col-6 col-lg-4">
              <a onClick={this.exit} className="link"><img src="/static/images/ravenmore/128/x.png" aria-hidden="true" /><br />
                Temporarily leave the universe</a></p>
          </nav>
        </div>
        <div className="col-sm">
          <Status player={this.props.player} />
        </div>
      </div>
    );
  }
}

export default PlayerMenu;
