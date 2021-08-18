import * as React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import AdventureList from "./AdventureList";
import AdventureMainMenu from "./AdventureDetail";
import Login from "./Login";
import {UserContext} from "../context";
import {useState} from "react";

const Designer = (): JSX.Element => {

  const [username, setUsername] = useState(
    window.localStorage.getItem('eamon_designer_username'))
  const [token, setToken] = useState(
    window.localStorage.getItem('eamon_designer_token'))

  const state = {
    username,
    token
  }

  const changeUserState = (username: string, token: string): void => {
    console.log('change user state', username, token);
    // FIXME: values get deleted when we do a full page load. Need to store token
    //  in local storage to make it persist across page loads. (Also need to store
    //  username and expiration time, or else gracefully handle expired tokens.)
    window.localStorage.setItem('eamon_designer_username', username);
    setUsername(username);
    window.localStorage.setItem('eamon_designer_token', token);
    setToken(token);
  }

  return (
    <UserContext.Provider value={{...state, changeUserState}}>
      {state.username && (
        <div>Welcome, {state.username}!</div>
      )}
      <div className="container-fluid" id="app">
        <div className="parchment">
          <div className="parchment-inner">
            <Router>
              <Switch>
                <Route path="/designer/" exact={true} component={AdventureList}/>
                <Route path="/designer/login" exact={true} component={Login}/>
                {/* non-exact route below is used so we can have child routes inside the component */}
                <Route path="/designer/:slug" component={AdventureMainMenu}/>
              </Switch>
            </Router>
          </div>
        </div>
      </div>
    </UserContext.Provider>
  );
}

export default Designer;
