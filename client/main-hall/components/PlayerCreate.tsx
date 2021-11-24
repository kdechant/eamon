import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import diceRoll from "../utils/dice";
import {getHeaders} from '../utils/api';

const PlayerCreate: React.FC = (): JSX.Element => {
  const [playerId, setPlayerID] = useState(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [hardiness, setHardiness] = useState(0);
  const [agility, setAgility] = useState(0);
  const [charisma, setCharisma] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    rollStats();

    // set the UUID if it's not already in local storage
    if (!window.localStorage.getItem('eamon_uuid')) {
      window.localStorage.setItem('eamon_uuid', uuidv4());
    }
  }, []);

  /**
   * Rolls a set of stats for the player
   */
  const rollStats = () => {
    let hardiness = 0;
    let agility = 0;
    let charisma = 0;
    while (hardiness < 15 || agility < 12
      || hardiness + agility + charisma < 42) {
      hardiness = diceRoll(3, 7);
      agility = diceRoll(3, 7);
      charisma = diceRoll(3, 7);
    }
    setHardiness(hardiness);
    setAgility(agility);
    setCharisma(charisma);
  }

  const handleChange = (event) => {
    const setters = {
      name: setName,
      gender: setGender,
      hardiness: setHardiness,
      agility: setAgility,
      charisma: setCharisma
    };
    setters[event.target.name](event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // save new player to the API
    const player = {
      name,
      gender,
      hardiness,
      agility,
      charisma,
      uuid: window.localStorage.getItem('eamon_uuid')
    };
    if (!player.name) {
      setError('Please enter a name');
      return;
    }
    setError('');
    axios.post("/api/players", player, {headers: getHeaders()})
      .then((res) => {
        setPlayerID(res.data.id);
        window.localStorage.setItem('player_id', res.data.id);
      }).catch((err) => {
        console.error(err);
        setError('Failed to save player: ' + err.message);
      });
  };

  if (playerId) {
    return (
      <div className="col-sm-12" id="PlayerCreate">
        <div id="prosper">
          <p>The man behind the desk says, &quot;Welcome, {name}. It is now time for you to begin
            your adventures. Your first task will be to buy weapons and armor and test your skill
            on a suitable Beginner adventure.&quot;</p>
          <p>He makes an odd sign with his hand and says, &quot;Live long and prosper.&quot;</p>
          <p>You now wander into the Main Hall...</p>
          <Link to="/main-hall/hall" className="btn btn-primary">Next</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="col-sm-12" id="PlayerCreate">
      <p>The burly Irishman hits his forehead and says, &quot;Ah, ye must be new here! Well, wait just a minute and
        I'll bring someone out to take care of ye.&quot;</p>
      <p>The Irishman walks away and in walks a serious, pointy-eared man of possibly Elfish descent.</p>
      <p>He studies you for a moment and says, &quot;Please enter your name and gender.&quot;</p>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" className="form-control" id="name" name="name" value={name} onChange={handleChange} />
        </div>
        <div className="row margin-bottom-md">
          <div className="col-sm-2">
            <label>
              <input name="gender" type="radio" value="m" checked={gender === "m"} onChange={handleChange} />
              {' '}Male
            </label>
          </div>
          <div className="col-sm-2">
            <label>
              <input name="gender" type="radio" value="f" checked={gender === "f"} onChange={handleChange} />
              {' '}Female
            </label>
          </div>
        </div>
        <p>&quot;Your prime attributes are--&quot;</p>
        <div className="row margin-bottom-md">
          <div className="col-sm-4 col-lg-3 text-center">
            <p><strong>Hardiness</strong></p>
            <p className="stat">{hardiness}</p>
            <p><small>Hit points. Also determines how much you can carry.</small></p>
          </div>
          <div className="col-sm-4 col-lg-3 text-center">
            <p><strong>Agility</strong></p>
            <p className="stat">{agility}</p>
            <p><small>Increases your chance to hit, and makes you harder to hit.</small></p>
          </div>
          <div className="col-sm-4 col-lg-3 text-center">
            <p><strong>Charisma</strong></p>
            <p className="stat">{charisma}</p>
            <p><small>Makes some monsters and NPCs more friendly.</small></p>
          </div>
        </div>
        <div className="buttons">
          <button type="button" className="btn btn-secondary mr-2" id="reroll" onClick={rollStats}>Reroll</button>
          <button type="submit" className="btn btn-primary mr-2">Begin Your Adventuring Career</button>
          <Link to="/main-hall" className="btn btn-secondary" id="cancel">Cancel</Link>
        </div>
        {error && (
          <div className="warning">{error}</div>
        )}
      </form>

    </div>
  );
}

export default PlayerCreate;
