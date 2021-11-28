import * as React from 'react';
import axios from "axios";

import {getHeaders, log} from "../utils/api";
import {useState} from "react";
import {useAppDispatch} from "../hooks";
import {playerActions} from "../store/player";
import {SavedGame} from "../models/player";

type SavedGameProps = {
  savedGame: SavedGame
}

const SavedGameTile: React.FC<SavedGameProps> = (props) => {
  const dispatch = useAppDispatch();

  const [ message, setMessage ] = useState('');

  const loadSavedGame = () => {
    window.localStorage.setItem('saved_game_slot', props.savedGame.slot);
    window.location.href = '/adventure/' + props.savedGame.adventure.slug;
  };

  const deleteSavedGame = () => {
    if (confirm("Are you sure you want to delete this saved game?")) {
      setMessage('Deleted!');
      setTimeout(() => {
        const uuid = window.localStorage.getItem('eamon_uuid');
        console.log(props.savedGame);
        axios.delete("/api/saves/" + props.savedGame.id + '.json?uuid=' + uuid, {headers: getHeaders()})
          .then(() => {
            log("delete saved game #" + props.savedGame.id)
              .then(() => {
                dispatch(playerActions.deleteSavedGame(props.savedGame.id));
              })
              .catch(err => {
                console.error(err);
                setMessage('Error');
              });
          })
          .catch(err => {
            console.error(err);
            setMessage('Error');
          });
      }, 1250);
    }
  };

  const messageStyle = {
    "opacity": message === "" ? 0 : 1
  };

  return (
    <div className="artifact-tile col-sm-6 col-md-4 col-lg-3">
      <div className="artifact-tile-inner">
        <div className="artifact-icon">
          <img src="/static/images/ravenmore/128/map.png" title={props.savedGame.description} />
        </div>
        <div className="artifact-name">
          <strong>{props.savedGame.adventure.name}</strong>
        </div>
        <div className="artifact-data">
          <p>Save #{props.savedGame.slot}: {props.savedGame.description}</p>
        </div>
        <div className="artifact-buttons">
          <button className="btn btn-primary" onClick={loadSavedGame}>Resume</button>
          <button className="btn btn-warning" onClick={deleteSavedGame}>Delete</button>
        </div>
        <div className="message" style={messageStyle}>
          {message}
        </div>
      </div>
    </div>
  );
}

export default SavedGameTile;
