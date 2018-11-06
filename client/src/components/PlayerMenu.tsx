import * as React from 'react';
import { Link } from "react-router-dom";
import Status from "./Status";

class PlayerMenu extends React.Component<any, any> {
  // constructor(props: any){
  //   super(props);
  //   this.state = { player: this.props.player };
  // }

  // TODO: show the saved game list here...

  public exit = () => {
    console.log('exit');
  };

  public render() {
    console.log('render PlayerMenu', this.props.player);
    return (
      <div className="row">
        <div className="col-sm">
          <h2>Main Hall</h2>
          <p>You are in the main hall of the Guild of Free Adventurers. You can do the following:</p>
          <nav className="row icon-nav">
            <p className="col-6 col-sm-4 col-md-6 col-lg-4">
              <Link to="/main-hall/adventure"><img src="/static/images/ravenmore/128/map.png" /><br />
                Go on an adventure</Link>
            </p>
            <p className="col-6 col-sm-4 col-md-6 col-lg-4">
              <Link to="/main-hall/shop"><img src="/static/images/ravenmore/128/axe2.png" /><br />
                Visit the weapons shop</Link>
            </p>
            <p className="col-6 col-sm-4 col-md-6 col-lg-4">
              <Link to="/main-hall/wizard"><img src="/static/images/ravenmore/128/tome.png" /><br />
                Find a wizard to teach you some spells</Link></p>
            <p className="col-6 col-sm-4 col-md-6 col-lg-4">
              <Link to="/main-hall/witch"><img src="/static/images/ravenmore/128/potion.png" /><br />
                Visit the witch to increase your attributes</Link>
            </p>
            <p className="col-6 col-sm-4 col-md-6 col-lg-4">
              <Link to="/main-hall/bank"><img src="/static/images/ravenmore/128/coin.png" /><br />
                Find the banker to deposit or withdraw some gold</Link>
            </p>
            <p className="col-6 col-sm-4 col-md-6 col-lg-4">
              <a onClick={this.exit}><img src="/static/images/ravenmore/128/x.png" /><br />
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
