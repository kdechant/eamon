import * as React from 'react';
import {BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdventureList from "./AdventureList";
import Login from "./Login";
import UserContext from "../contexts/user";
import {useState} from "react";
import jwt_decode from "jwt-decode";
import AdventureMainMenu from "./AdventureMainMenu";

type accessToken = {
  exp: number,
  user_id: number,
  jti: string,
  token_type: string
}

const Designer: React.FC = () => {

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
    });
    const refresh_data = await response.json();
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
      <div className="container-fluid" id="app">
        <div className="parchment">
          <div className="parchment-inner">
            {state.username && (
              <div>Welcome, {state.username}!</div>
            )}
            <Router>
              <Routes>
                <Route path="/designer" element={<AdventureList />}/>
                <Route path="/designer/login" element={<Login />}/>
                <Route path="/designer/*" element={<AdventureMainMenu />}/>
              </Routes>
            </Router>
          </div>
        </div>
      </div>
    </UserContext.Provider>
  );
}

export default Designer;
