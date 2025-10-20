import styled from "@emotion/styled";
import { useState } from "react";
import { useTransitionState } from "react-transition-state";
import { useAppDispatch, useAppSelector } from "../../hooks";
import type Artifact from "../../models/artifact";
import { ARTIFACT_TYPES, getIcon, getTypeName, isWeapon } from "../../models/artifact";
import { playerActions } from "../../store/player";
import { ucFirst } from "../../utils";

interface ArtifactTileProps {
  artifact: Artifact;
  action: string;
  removeItem?: (Artifact) => void;
}

const animationTime = 600;

const TransitionStateBox = styled.div`
  transition: all ${animationTime}ms ease-in;
`;

export default function ArtifactTile({ artifact, action, removeItem }: ArtifactTileProps) {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  const [message, setMessage] = useState("");

  const [{ status }, toggle] = useTransitionState({
    timeout: animationTime,
    initialEntered: true,
    unmountOnExit: true,
    preEnter: true,
  });

  const buy = () => {
    setMessage("Bought!");
    setTimeout(() => {
      setMessage("");
      dispatch(playerActions.buyArtifact(artifact));
      // TODO: redux-ify shop inventory too
      if (artifact.type === ARTIFACT_TYPES.MAGIC_WEAPON) {
        toggle(false);
        setTimeout(() => removeItem(artifact), animationTime);
      }
    }, 1200);
  };

  const sell = () => {
    setMessage("Sold!");
    setTimeout(() => {
      toggle(false);
      setTimeout(() => dispatch(playerActions.sellArtifact(artifact)), animationTime);
      // dispatch(playerActions.sellArtifact(artifact));
    }, 1200);
  };

  const icon_url = `/static/images/ravenmore/128/${getIcon(artifact)}.png`;

  const stats = [];
  if (isWeapon(artifact)) {
    stats.push(`Damage: ${artifact.dice} d ${artifact.sides}`);
    if (artifact.hands === 2) {
      stats.push("Two-handed");
    }
    if (artifact.type === ARTIFACT_TYPES.MAGIC_WEAPON) {
      stats.push("Magic weapon");
    }
    if (artifact.weapon_odds > 0) {
      stats.push(`+${artifact.weapon_odds}% to hit`);
    }
    if (artifact.weapon_odds < 0) {
      stats.push(`${artifact.weapon_odds}% to hit`);
    }
  } else {
    stats.push(`AC: ${artifact.armor_class}`);
    stats.push(`Penalty: ${artifact.armor_penalty}%`);
  }

  const value = action === "buy" ? artifact.value : Math.floor(artifact.value / 2);

  let button = (
    <button type="button" className="btn btn-primary disabled" disabled aria-disabled="true">
      Not enough gold
    </button>
  );
  if (action === "buy" && player.gold >= artifact.value) {
    button = (
      <button type="button" className="btn btn-primary" onClick={buy}>
        Buy
      </button>
    );
  } else if (action === "sell") {
    button = (
      <button type="button" className="btn btn-primary" onClick={sell}>
        Sell
      </button>
    );
  }

  const messageStyle = {
    opacity: message === "" ? 0 : 1,
  };

  const className =
    artifact.type === ARTIFACT_TYPES.MAGIC_WEAPON
      ? "artifact-tile-inner artifact-tile-inner-magic"
      : "artifact-tile-inner";

  return (
    <TransitionStateBox
      className={`artifact-tile col-sm-6 col-md-4 col-lg-3 ${status === "exiting" ? "animating" : ""}`}
    >
      <div className={className}>
        <div className="artifact-icon">
          <img src={icon_url} title={getTypeName(artifact)} alt={getTypeName(artifact)} />
        </div>
        <div className="artifact-name">
          <strong>{ucFirst(artifact.name)}</strong>
          <br />
        </div>
        <div className="artifact-data">
          {stats.map((stat) => (
            <div key={stat}>{stat}</div>
          ))}
        </div>
        <div className="d-flex flex-row justify-content-between">
          <div className="artifact-price pt-2">
            <img src="/static/images/ravenmore/128/coin.png" title="gold coin" alt="gold coin" /> {value}
          </div>
          <div className="artifact-buttons">{button}</div>
        </div>
        <div className="message" style={messageStyle}>
          {message}
        </div>
      </div>
    </TransitionStateBox>
  );
}
