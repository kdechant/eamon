import * as React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import AdventureList from "./AdventureList";
import AdventureMainMenu from "./AdventureDetail";


const Designer = () => {
  return (
    <div className="container-fluid" id="app">
      <div className="parchment">
        <div className="parchment-inner">
          <Router>
            <Switch>
              <Route path="/designer/" exact={true} component={AdventureList}/>
              {/* non-exact route below is used so we can have child routes inside the component */}
              <Route path="/designer/:slug" component={AdventureMainMenu}/>
            </Switch>
          </Router>
        </div>
      </div>
    </div>
  );
}

export default Designer;
