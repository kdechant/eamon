import axios from 'axios';
import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import Player from '../models/player';
import PlayerListItem from "./PlayerListItem";
import { Link } from "react-router-dom";
import {getAxios} from "../utils/api";

class PlayerList extends React.Component {
  public state: any = {
    players: [],
    socialLoginId: null,
    socialModalActive: false,
    socialPlatform: null,
    eamon_uuid: ""
  };

  public componentDidMount() {
    let eamon_uuid = window.localStorage.getItem('eamon_uuid');
    let socialLoginId = window.localStorage.getItem('social_id');
    let socialPlatform = window.localStorage.getItem('social_platform');

    // set the UUID if it's not already in local storage
    if (!eamon_uuid) {
      eamon_uuid = uuidv4();
      window.localStorage.setItem('eamon_uuid', eamon_uuid);
    }
    this.setState({ eamon_uuid, socialLoginId, socialPlatform }, this.loadPlayers);
  }

  public loadPlayers = () => {
    const uuid = window.localStorage.getItem('eamon_uuid');
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
  };

  /**
   * Finds any characters in the current browser's local storage and links them to the social login ID
   * @param {string} login_id
   *   The login ID from the user's social media account
   */
  public linkLocalChars = () => {
    let body = {
      'social_id': this.state.socialLoginId,
      'uuid': window.localStorage.getItem('eamon_uuid')
    };
    const axios = getAxios();
    axios.post("/profiles", body)
      .then(res => {
        let uuid = String(res.data['uuid']);
        window.localStorage.setItem('eamon_uuid', res.data['uuid']);
        this.setState({ eamon_uuid: res.data['uuid'] }, this.loadPlayers);
      })
      .catch(error => console.log(error));
  };

  /**
   * Signs in with Facebook
   * @param response
   */
  public fbSignIn = (response) => {
    console.log("facebook sign in data : ", response);
    window.localStorage.setItem('social_id', response.id);
    window.localStorage.setItem('social_platform', 'facebook');
    this.setState({socialLoginId: response.id}, this.linkLocalChars);
  };

  /**
   * Signs out of social media login
   * @param {string} socialPlatform
   */
  public socialSignOut = socialPlatform => {
    console.log(socialPlatform + " sign out : ", socialPlatform);
    window.localStorage.removeItem('social_id');
    window.localStorage.removeItem('social_platform');
    // set new uuid to clear the player list
    const new_uuid = uuidv4();
    window.localStorage.setItem('eamon_uuid', new_uuid);
    this.setState({
      socialLoginId: null,
      eamon_uuid: new_uuid
    }, this.loadPlayers);
  };

  public toggleSocialModal = () => {
    this.setState({ socialModalActive: !this.state.socialModalActive });
  };

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
          {this.state.players.map(player => <PlayerListItem key={player.id} player={player} loadPlayers={this.loadPlayers} /> )}
        </div>
        {empty_message}
        <p className="addplayer"><Link to="/main-hall/register"><strong>Create a New Adventurer</strong></Link></p>

        {this.state.socialLoginId
          ? (
            <div>
              <p>You are logged in with Facebook, so your adventurers are linked to your Facebook account. You may access these adventurers on any computer if you log in with Facebook on that computer.</p>
              <button className="facebook-login" onClick={() => this.socialSignOut('facebook')}>Log out</button>
            </div>
          )
          : (
            <div>
              <p>Your adventurers are stored within your browser. You will need to use this same computer and browser to play as the same adventurers.</p>
              <p>You can also log in with Facebook to share your adventurers across multiple computers.</p>
              <FacebookLogin
                appId="184221458976224"
                callback={this.fbSignIn}
                render={renderProps => (
                  <button className="facebook-login" onClick={renderProps.onClick}>Log in with Facebook</button>
                )}
              />
              <button type="button" className="btn btn-link" onClick={this.toggleSocialModal}>What happens when I log in?</button>
            </div>
          )
        }

        <Modal isOpen={this.state.socialModalActive} toggle={this.toggleSocialModal}>
          <ModalHeader toggle={this.toggleSocialModal}>
            How Eamon Stores Adventurers
          </ModalHeader>
          <ModalBody>
            <div className="row">
              <div className="col-12">
                <p>The Irishman mentions something else to you. &quot;I see you're from the future, and you're visiting in a web browser. Normally, I keep my guest book inside your browser in something called 'local storage.' Your adventurers will live inside your browser and you can play as them any time you want, as long as you use the same computer and the same browser.&quot;</p>
        <p>&quot;If you want me to save your adventurers so you can play as them across multiple computers and browsers, you can 'log in with Facebook' and I'll keep them in the big guest book up in the clouds.&quot;</p>
        <p>&quot;And don't worry. I know that you Free Adventurers might have colorful pasts and you might not want other people to know you're here. Here in Eamon, we never sell or give away any information about our adventurers, not even to our local armourer or wizard. Your information is safe here.&quot;</p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-primary" onClick={this.toggleSocialModal}>Close</button>
          </ModalFooter>
        </Modal>

      </div>
    );
  }
}

export default PlayerList;
