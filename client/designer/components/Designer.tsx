import * as React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import AdventureList from "./AdventureList";
import AdventureMainMenu from "./AdventureDetail";
import Login from "./Login";
import {UserContext} from "../context";
import {useState} from "react";
import jwt_decode from "jwt-decode";

type accessToken = {
  exp: number,
  user_id: number,
  jti: string,
  token_type: string
}

const Designer = (): JSX.Element => {

  const [username, setUsername] = useState(
    window.localStorage.getItem('eamon_designer_username'))
  const [token, setToken] = useState(
    window.localStorage.getItem('eamon_designer_token'))
  const [refreshToken, setRefreshToken] = useState(
    window.localStorage.getItem('eamon_designer_refresh_token'))

  const state = {
    username,
    token,
    refreshToken
  }

  /**
   * Gets the current auth token, if there is one. If it's expired, this
   * calls the 'refresh' endpoint to get a new token.
   */
  const getToken = async (): Promise<string> => {
    const decoded: accessToken = jwt_decode(token);
    console.log('decoded token', decoded);
    // if expired, call refresh endpoint to get a new one
    const exp_date = new Date(decoded.exp * 1000);
    if (exp_date > new Date()) {
      // token is still current
      return token;
    }
    if (!refreshToken) {
      return '';
    }
    const refresh_body = JSON.stringify({'refresh': refreshToken});
    const response = await fetch(`/api/token/refresh/`, {
      method: 'POST',
      body: refresh_body,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
    const refresh_data = await response;
    setToken(refresh_data.access);
    return refresh_data.access;
  }

  const changeUserState = (username: string, token: string, refresh_token: string): void => {
    window.localStorage.setItem('eamon_designer_username', username);
    setUsername(username);
    window.localStorage.setItem('eamon_designer_token', token);
    setToken(token);
    window.localStorage.setItem('eamon_designer_refresh_token', refresh_token);
    setRefreshToken(refresh_token);
  }

  return (
    <UserContext.Provider value={{...state, getToken, changeUserState}}>
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