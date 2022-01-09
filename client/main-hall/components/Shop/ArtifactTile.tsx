import * as React from 'react';
import {useState} from "react";
import { ucFirst } from "../../utils";
import Artifact, {getIcon, getTypeName, isWeapon} from "../../models/artifact";
import {useAppDispatch, useAppSelector} from "../../hooks";
import {playerActions} from "../../store/player";

type ArtifactTileProps = {
  artifact: Artifact,
  action: string,
  removeItem?: (Artifact) => void,
}

const ArtifactTile: React.FC<ArtifactTileProps> = (props) => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  const [message, setMessage] = useState('');

  const buy = () => {
    setMessage("Bought!");
    setTimeout(() => {
      setMessage("");
      dispatch(playerActions.buyArtifact(props.artifact));
      // TODO: redux-ify shop inventory too
      if (props.removeItem) {
        props.removeItem(props.artifact);
      }
    }, 1200);
  };

  const sell = () => {
    setMessage("Sold!");
    setTimeout(() => dispatch(playerActions.sellArtifact(props.artifact)), 1200);
  };

  const icon_url = '/static/images/ravenmore/128/' + getIcon(props.artifact) + '.png';

  let stats = <span />;
  if (isWeapon(props.artifact)) {
    stats = (
      <div>
        To Hit: { props.artifact.weapon_odds }%<br />
        Damage: { props.artifact.dice } d { props.artifact.sides }<br />
      </div>
    );
  } else {
    stats = (
      <div>
        AC: { props.artifact.armor_class }<br />
        Penalty: { props.artifact.armor_penalty }%<br />
      </div>
    );
  }

  const value = props.action === "buy" ? props.artifact.value : Math.floor(props.artifact.value / 2);

  let button = <button className="btn disabled">Not enough gold</button>;
  if (props.action === "buy" && player.gold >= props.artifact.value) {
    button = <button className="btn btn-primary" onClick={buy}>Buy</button>
  } else if (props.action === 'sell') {
    button = <button className="btn btn-primary" onClick={sell}>Sell</button>
  }

  const messageStyle = {
    "opacity": message === "" ? 0 : 1
  };

  return (
    <div className="artifact-tile col-sm-6 col-md-4 col-lg-3">
      <div className="artifact-tile-inner">
        <div className="artifact-icon">
          <img src={icon_url} title={ getTypeName(props.artifact) } alt={ getTypeName(props.artifact) } />
        </div>
        <div className="artifact-name">
          <strong>{ ucFirst(props.artifact.name) }</strong><br />
        </div>
        <div className="artifact-data">
          {stats}
          <span className="artifact-price">
            <img src="/static/images/ravenmore/128/coin.png" title="gold coin" alt="gold coin" /> {value}
          </span>
        </div>
        <div className="artifact-buttons">
          {button}
        </div>
        <div className="message" style={messageStyle}>
          { message }
        </div>
      </div>
    </div>
  );
}

export default ArtifactTile;
