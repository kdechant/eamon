import * as React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import PlayerCreate from "./PlayerCreate";
import PlayerDetail from "./PlayerDetail";
import PlayerList from "./PlayerList";

class MainHall extends React.Component {
  public render() {
    return (
      <div className="container-fluid" id="app">
        <div className="parchment">
          <div className="parchment-inner">
            <Router>
              <Switch>
                <Route path="/main-hall/" exact={true} component={PlayerList}/>
                <Route path="/main-hall/hall" component={PlayerDetail}/>
                <Route path="/main-hall/register" component={PlayerCreate}/>
              </Switch>
            </Router>
          </div>
        </div>
      </div>
    );
  }
}

export default MainHall;
