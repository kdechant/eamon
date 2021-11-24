import * as React from 'react';
import {useState} from "react";
import { ucFirst } from "../../utils";
import Player from "../../models/player";
import Artifact from "../../models/artifact";

type ArtifactTileProps = {
  player: Player,
  artifact: Artifact,
  action: string,
  setPlayerState: (Player) => void,
  removeItem?: (Artifact) => void,
}

const ArtifactTile: React.FC<ArtifactTileProps> = (props) => {
  const [message, setMessage] = useState('');

  const buy = () => {
    setMessage("Bought!");
    setTimeout(() => {
      setMessage("");
      const player = props.player;
      player.inventory.push(props.artifact);
      player.gold -= props.artifact.value;
      props.setPlayerState(player);
      props.removeItem(props.artifact);
    }, 1200);
  };

  const sell = () => {
    setMessage("Sold!");
    setTimeout(() => {
      const player = props.player;
      const index = player.inventory.indexOf(props.artifact);
      if (index > -1) {
        player.inventory.splice(index, 1);
      }
      player.gold += Math.floor(props.artifact.value / 2);
      props.setPlayerState(player);
      }, 1200);
  };

  const icon_url = '/static/images/ravenmore/128/' + props.artifact.getIcon() + '.png';

  let stats = <span />;
  if (props.artifact.isWeapon()) {
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
  if (props.action === "buy" && props.player.gold >= props.artifact.value) {
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
          <img src={icon_url} title={ props.artifact.getTypeName() } alt={ props.artifact.getTypeName() } />
        </div>
        <div className="artifact-name">
          <strong>{ ucFirst(props.artifact.name) }</strong><br />
        </div>
        <div className="artifact-data">
          {stats}
          <img src="/static/images/ravenmore/128/coin.png" title="gold coin" alt="gold coin" /> {value}
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
