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

export default function ArtifactTile(props: ArtifactTileProps) {
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
      dispatch(playerActions.buyArtifact(props.artifact));
      // TODO: redux-ify shop inventory too
      if (props.artifact.type !== ARTIFACT_TYPES.WEAPON) {
        toggle(false);
        setTimeout(() => props.removeItem(props.artifact), animationTime);
      }
    }, 1200);
  };

  const sell = () => {
    setMessage("Sold!");
    setTimeout(() => {
      toggle(false);
      setTimeout(() => dispatch(playerActions.sellArtifact(props.artifact)), animationTime);
      // dispatch(playerActions.sellArtifact(props.artifact));
    }, 1200);
  };

  const icon_url = `/static/images/ravenmore/128/${getIcon(props.artifact)}.png`;

  let stats = <span />;
  if (isWeapon(props.artifact)) {
    stats = (
      <div>
        Damage: {props.artifact.dice} d {props.artifact.sides}
        <br />
        {props.artifact.weapon_odds > 0 && (
          <>
            +{props.artifact.weapon_odds}% to hit
            <br />
          </>
        )}
        {props.artifact.weapon_odds < 0 && (
          <>
            {props.artifact.weapon_odds}% to hit
            <br />
          </>
        )}
      </div>
    );
  } else {
    stats = (
      <div>
        AC: {props.artifact.armor_class}
        <br />
        Penalty: {props.artifact.armor_penalty}%<br />
      </div>
    );
  }

  const value = props.action === "buy" ? props.artifact.value : Math.floor(props.artifact.value / 2);

  let button = (
    <button type="button" className="btn disabled">
      Not enough gold
    </button>
  );
  if (props.action === "buy" && player.gold >= props.artifact.value) {
    button = (
      <button type="button" className="btn btn-primary" onClick={buy}>
        Buy
      </button>
    );
  } else if (props.action === "sell") {
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
    props.artifact.type === ARTIFACT_TYPES.MAGIC_WEAPON
      ? "artifact-tile-inner artifact-tile-inner-magic"
      : "artifact-tile-inner";

  return (
    <TransitionStateBox
      className={`artifact-tile col-sm-6 col-md-4 col-lg-3 ${status === "exiting" ? "animate-zoom-fade" : ""}`}
    >
      <div className={className}>
        <div className="artifact-icon">
          <img src={icon_url} title={getTypeName(props.artifact)} alt={getTypeName(props.artifact)} />
        </div>
        <div className="artifact-name">
          <strong>{ucFirst(props.artifact.name)}</strong>
          <br />
        </div>
        <div className="artifact-data">{stats}</div>
        <div className="artifact-price">
          <img src="/static/images/ravenmore/128/coin.png" title="gold coin" alt="gold coin" /> {value}
        </div>
        <div className="artifact-buttons">{button}</div>
        <div className="message" style={messageStyle}>
          {message}
        </div>
      </div>
    </TransitionStateBox>
  );
}
