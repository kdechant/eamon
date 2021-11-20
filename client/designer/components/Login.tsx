import * as React from 'react';
import {useState} from "react";

import UserContext from "../contexts/user";
import {Navigate} from "react-router-dom";

function Login(): JSX.Element {
  const context = React.useContext(UserContext);

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [redirect, setRedirect] = useState("")

  const changeName = (ev) => {
    setUsername(ev.target.value);
  }

  const changePw = (ev) => {
    setPassword(ev.target.value);
  }

  async function submit() {
    const body = JSON.stringify({
      'username': username,
      'password': password
    });
    const token_response = await fetch(`/api/token/`, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(async response => {
        if (!response.ok) {
          const json = await response.json();
          throw new Error(json.detail);
        }
        return response.json();
      })
      .catch(error => {
        setError(error.message);
      });
    const data = await(token_response);
    if (data) {
      context.changeUserState(username, data.access, data.refresh);
      setRedirect('/designer/');
    }
  }

  return (
    <div id="Login">
      <h3>Login</h3>

      <div className="form-group">
        <label htmlFor="name">Username</label>
        <input type="text" name="username" className="form-control" value={username} onChange={changeName} />

        <label htmlFor="name">Password</label>
        <input type="password" name="password" className="form-control" value={password} onChange={changePw} />

        <button className="btn btn-primary" onClick={submit}>Log in</button>

        {error && <p>{error}</p>}
        {redirect && <Navigate to={redirect} />}
      </div>

    </div>
  );
}

export default Login;
