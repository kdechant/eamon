import axios from 'axios';
import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import {updateCachedInfo} from '../models/player';
import PlayerListItem from "./PlayerListItem";
import { Link } from "react-router-dom";
import {useEffect, useState} from "react";
import {getAxios} from "../utils/api";

const PlayerList: React.FC = () => {
  const [players, setPlayers] = useState([]);
  const [socialModalActive, setSocialModalActive] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let eamon_uuid = window.localStorage.getItem('eamon_uuid');
    // const socialLoginId = window.localStorage.getItem('social_id');
    // const socialPlatform = window.localStorage.getItem('social_platform');

    // set the UUID if it's not already in local storage
    if (!eamon_uuid) {
      eamon_uuid = uuidv4();
      window.localStorage.setItem('eamon_uuid', eamon_uuid);
    }
    loadPlayers();
  }, []);

  const loadPlayers = () => {
    const uuid = window.localStorage.getItem('eamon_uuid');
    axios.get('/api/players.json?uuid=' + uuid)
      .then(res => {
        const players = res.data.map(pl => {
          updateCachedInfo(pl);
          return pl;
        });
        setPlayers(players);
      });
  };

  /**
   * Find any characters in the current browser's local storage and link them to the social login ID
   */
  const linkLocalChars = () => {
    const body = {
      'social_id': window.localStorage.getItem('social_id'),
      'uuid': window.localStorage.getItem('eamon_uuid')
    };
    const axios = getAxios();
    axios.post("/profiles", body)
      .then(res => {
        window.localStorage.setItem('eamon_uuid', res.data['uuid']);
        loadPlayers();
      })
      .catch(error => console.log(error));
  };

  /**
   * Signs in with Facebook
   * @param response
   */
  const fbSignIn = (response) => {
    window.localStorage.setItem('social_id', response.id);
    window.localStorage.setItem('social_platform', 'facebook');
    linkLocalChars();
  };

  /**
   * Signs out of social media login
   * @param {string} socialPlatform
   */
  const socialSignOut = socialPlatform => {
    console.log(socialPlatform + " sign out : ", socialPlatform);
    window.localStorage.removeItem('social_id');
    window.localStorage.removeItem('social_platform');
    // set new uuid to clear the player list
    const new_uuid = uuidv4();
    window.localStorage.setItem('eamon_uuid', new_uuid);
    loadPlayers();
  };

  /**
   * Deletes all character data (required by Facebook T&C)
   */
  const deleteSocialAccount = (socialPlatform) => {
    console.log("Delete login info for : ", socialPlatform);
    if (window.confirm("Are you sure you want to delete your account? You will lose all your " +
      "characters and items. This cannot be undone.")) {
      if (socialPlatform !== window.localStorage.getItem('social_platform')) {
        throw new Error("You are not logged in with " + socialPlatform);
      }
      const socialId = window.localStorage.getItem('social_id');
      const uuid = window.localStorage.getItem('eamon_uuid');
      const axios = getAxios();
      axios.delete(`/profiles/666?social_id=${socialId}&uuid=${uuid}`)
        .then(() => {
          setMessage('Your profile has been deleted.');
          window.localStorage.removeItem('social_id');
          window.localStorage.removeItem('social_platform');
          // set new uuid to clear the player list
          const new_uuid = uuidv4();
          window.localStorage.setItem('eamon_uuid', new_uuid);
          loadPlayers();
        })
        .catch(error => {
          setMessage('There was an error deleting your profile: ' + error.response.data.detail);
        });
    }
  };

  const toggleSocialModal = () => {
    setSocialModalActive(current => !current);
  };

  let empty_message = (<span />);
  if (players.length === 0) {
    empty_message = (<p>There are no adventurers in the guest book.</p>)
  }

  const socialLoginActive = !!window.localStorage.getItem('social_id')

  return (
    <div id="PlayerList">
      <p>You are in the outer chamber of the hall of the Guild of Free Adventurers. Many men and women are guzzling beer and there is loud singing and laughter.</p>
      <p>On the north side of the chamber is a cubbyhole with a desk. Over the desk is a sign which says: <strong>&quot;REGISTER HERE OR ELSE!&quot;</strong></p>
      <p>Behind the desk is a burly Irishman who looks at you with a scowl and asks, &quot;What's your name?&quot;</p>
      <p>The guest book on the desk lists the following adventurers:</p>
      <div className="row">
        {players.map(player => <PlayerListItem key={player.id} player={player} loadPlayers={loadPlayers} /> )}
      </div>
      {empty_message}
      <p className="addplayer"><Link to="/main-hall/register"><strong>Create a New Adventurer</strong></Link></p>

      {socialLoginActive
        ? (
          <div>
            <p>You are logged in with Facebook, so your adventurers are linked to your Facebook
              account. You may access these adventurers on any computer if you log in with Facebook
              on that computer.</p>
            <button className="facebook-login" onClick={() => socialSignOut('facebook')}>Log out</button>
            <button className="facebook-login" onClick={() => deleteSocialAccount('facebook')}>Delete Account</button>
          </div>
        )
        : (
          <div>
            <p>Your adventurers are stored within your browser. You will need to use this same computer and browser to play as the same adventurers.</p>
            <p>You can also log in with Facebook to share your adventurers across multiple computers.</p>
            <FacebookLogin
              appId="184221458976224"
              callback={fbSignIn}
              render={renderProps => (
                <button className="facebook-login" onClick={renderProps.onClick}>Log in with Facebook</button>
              )}
            />
            <button type="button" className="btn btn-link" onClick={toggleSocialModal}>What happens when I log in?</button>
          </div>
        )
      }

      {message && (
        <p>{message}</p>
      )}

      <Modal isOpen={socialModalActive} toggle={toggleSocialModal}>
        <ModalHeader toggle={toggleSocialModal}>
          How Eamon Stores Adventurers
        </ModalHeader>
        <ModalBody>
          <div className="row">
            <div className="col-12">
              <p>The Irishman mentions something else to you. &quot;I see you're from the future,
                and you're visiting in a web browser. Normally, I keep my guest book inside your
                browser in something called 'local storage.' Your adventurers will live inside your
                browser and you can play as them any time you want, as long as you use the same
                computer and the same browser.&quot;</p>
              <p>&quot;If you want me to save your adventurers so you can play as them across
                multiple computers and browsers, you can 'log in with Facebook' and I'll keep them
                in the big guest book up in the clouds.&quot;</p>
              <p>&quot;And don't worry. I know that you Free Adventurers might have colorful pasts
                and you might not want other people to know you're here. Here in Eamon, we never
                sell or give away any information about our adventurers, not even to our local
                armourer or wizard. Your information is safe here.&quot;</p>
              <p><a href="/privacy" target="_blank">See the full privacy policy here.</a></p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-primary" onClick={toggleSocialModal}>Close</button>
        </ModalFooter>
      </Modal>

    </div>
  );
}

export default PlayerList;
