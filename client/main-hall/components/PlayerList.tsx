import axios from 'axios';
import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import {PlayerProfile, updateCachedInfo} from '../models/player';
import PlayerListItem from "./PlayerListItem";
import {Link, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";

const PlayerList: React.FC = () => {
  const [searchParams, ] = useSearchParams();
  const [profile, setProfile] = useState({} as PlayerProfile);
  const [oldProfile, setOldProfile] = useState({} as PlayerProfile);
  const [players, setPlayers] = useState([]);
  const [oldPlayers, setOldPlayers] = useState([]);
  const [dataStorageOpen, setDataStorageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [oldAccessCode, setOldAccessCode] = useState('');
  const [accessCodeField, setAccessCodeField] = useState('');

  // On page load, look for access codes in the query string and local storage.
  useEffect(() => {
    // old local storage key: eamon_uuid
    const lsUuid = window.localStorage.getItem('eamon_uuid');
    // new local storage key: eamon_access_code
    const lsAccessCode = window.localStorage.getItem('eamon_access_code');
    // code from URL
    const urlCode = searchParams.get('code');

    let code = '';

    // if we got a code from the URL, save it in local storage.
    if (urlCode) {
      code = urlCode;
      window.localStorage.setItem('eamon_access_code', urlCode);

      // we also load the old profile to check if there were characters in it.
      if (lsAccessCode) {
        setOldAccessCode(lsAccessCode);
      } else if (lsUuid) {
        setOldAccessCode(lsUuid);
      }
    } else if (lsAccessCode) {
      code = lsAccessCode;
    } else if (lsUuid) {
      code = lsUuid;
    }
    if (!code) {
      code = 'new';
    }
    setAccessCode(code);
  }, []);

  const loadProfile = async () => {
    const res = await axios.get(`/api/profiles/${accessCode}`);
    setProfile(res.data);
    if (!window.localStorage.getItem('eamon_access_code')) {
      window.localStorage.setItem('eamon_access_code', res.data.slug);
    }
  };

  const createProfile = async () => {
    const res = await axios.post(`/api/profiles`);
    setProfile(res.data);
    window.localStorage.setItem('eamon_access_code', res.data.slug);
  };

  const loadOldProfile = async () => {
    const res = await axios.get(`/api/profiles/${accessCode}`);
    setOldProfile(res.data);
  };

  // Load the profile
  useEffect(() => {
    if (accessCode === 'new') {
      createProfile()
        .catch(console.error); // TODO: show error message to user
    } else if (accessCode) {
      loadProfile()
        .catch(console.error); // TODO: show error message to user
    }
  }, [accessCode]);

  // If there is an old profile, load that, too.
  useEffect(() => {
    if (oldAccessCode) {
      loadOldProfile()
        .catch(console.error);
    }
  }, [oldAccessCode]);

  const loadPlayers = (old = false) => {
    const uuid = old ? oldProfile.uuid : profile.uuid;
    axios.get('/api/players.json?uuid=' + uuid)
      .then(res => {
        const players = res.data.map(pl => {
          updateCachedInfo(pl);
          return pl;
        });
        setPlayers(players);
      });
  };

  useEffect(loadPlayers, [profile]);

  useEffect(() => {
    loadPlayers(true);
  }, [oldProfile]);

  const toggleDataStorageModal = () => {
    setDataStorageOpen(current => !current);
  };

  let empty_message = (<span />);
  if (players.length === 0) {
    empty_message = (<p>There are no adventurers in the guest book.</p>)
  }

  const handleChange = (event) => {
    const setters = {
      accessCodeField: setAccessCodeField,
    };
    setters[event.target.name](event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setAccessCode(accessCodeField);
  };

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

      {!!players.length && profile && (
        <div className="card" style={{background: 'transparent'}}>
          <div className="card-body">
            <p>Your Main Hall Access Code is: <strong>{profile.slug}</strong></p>
            <p>Your adventurers will automatically be linked to your current browser and computer.
              If you plan to use a different browser or computer, you will need to remember this
              Access Code. You can use it on the other computer to load your adventurers.</p>
            <p>You can bookmark this link to load your adventurers on a different computer or browser:
            <a href="https://www.eamon-remastered.com/main-hall?code={profile.slug}">https://www.eamon-remastered.com/main-hall?code={profile.slug}</a>
            </p>
            {/*<button type="button" className="btn btn-link" onClick={toggleDataStorageModal}>What do I use this code for?</button>*/}
          </div>
        </div>
      )}

      {!players.length && (
        <div className="card" style={{background: 'transparent'}}>
          <div className="card-body">
            <p>Returning from another computer or browser? Enter your Main Hall Access Code to load
              your adventurers:</p>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="col">
                  <label htmlFor="name">Access Code</label>
                </div>
                <div className="col">
                  <input type="text"
                         className="form-control"
                         name="accessCodeField"
                         value={accessCodeField}
                         onChange={handleChange} />
                </div>
                <div className="col">
                  <button type="submit" className="btn btn-primary mr-2">Load Players</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && (
        <p>{message}</p>
      )}

      <Modal isOpen={dataStorageOpen} toggle={toggleDataStorageModal}>
        <ModalHeader toggle={toggleDataStorageModal}>
          How Eamon Stores Your Characters
        </ModalHeader>
        <ModalBody>
          <div className="row">
            <div className="col-12">
              <p>The Irishman mentions something else to you. &quot;I see you're from the future,
                and you're visiting in a web browser. You should know that all the characters
                live up in this big sky computer. Your browser stores a special code that allows
                you to load your characters and play as them any time you want, as long as you use
                the same computer and the same browser.&quot;</p>
              <p>&quot;If you want to load your adventurers on a different computer or browser, you
                can enter your personal access code <strong>{profile.slug}</strong> to load them.&quot;</p>
              <p>&quot;You can keep your access code private, or share it with a friend. But, if you
                share it, your friend will be playing with the same characters. If they sell or break
                your favorite magic sword, don't blame me.&quot;</p>
              <p>&quot;And don't worry. I know that you Free Adventurers might have colorful pasts
                and you might not want other people to know you're here. Here in Eamon, we never
                sell or give away any information about our adventurers, not even to our local
                armourer or wizard. Your information is safe here.&quot;</p>
              <p><a href="/privacy" target="_blank">See the full privacy policy here.</a></p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-primary" onClick={toggleDataStorageModal}>Close</button>
        </ModalFooter>
      </Modal>

    </div>
  );
}

export default PlayerList;
