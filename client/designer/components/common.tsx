import * as React from 'react';

import AdventureContext from "../contexts/adventure";
import {Link} from "react-router-dom";
import {useParams} from "react-router";
import {ArtifactIcons} from "../constants";
import Artifact from "../models/artifact";

type LinkProps = {
  id: number,
  maxLength?: number,
}


export const RoomLink: React.FC<LinkProps> = (props) => {
  const context = React.useContext(AdventureContext);
  const { slug } = useParams();
  const id = props.id;
  if (id === 0) {
    return <span className="disabled">no connection</span>;
  }
  if (id === -999 || id === -998) {
    return <span>Adventure exit (#{id})</span>;
  }
  if (id) {
    const room = context.rooms.get(id);
    if (room) {
      let label = room.name;
      if (props.maxLength) {
        label = label.substring(0, props.maxLength);
      }
      return (
        <Link to={`/designer/${slug}/rooms/${id}`}>
          #{id}: {label}
        </Link>
      );
    }
    if (id < 0) {
      return <span>Special Connection: #{id}</span>;
    }
    return <span>Unknown room: #{id}</span>;
  }
  return <span className="disabled">-</span>;
}


export const ArtifactLink: React.FC<LinkProps> = (props) => {
  const context = React.useContext(AdventureContext);
  const { slug } = useParams();
  const id = props.id;
  const artifact = context.artifacts.get(id);
  return (
    <>
      {id ? (
        <Link to={`/designer/${slug}/artifacts/${id}`}>
          #{id}: {artifact ? artifact.name : 'unknown'}
        </Link>) : (
        <span className="disabled">-</span>
        )
      }
    </>
  );
}


export const EffectLink: React.FC<LinkProps> = (props) => {
  const context = React.useContext(AdventureContext);
  const { slug } = useParams();
  const id = props.id;
  const effect = context.effects.get(id);
  return (
    <>
      {id ? (
        <Link to={`/designer/${slug}/effects/${id}`}>
          #{id}: {effect ? effect.excerpt() : 'unknown'}
        </Link>) : (
        <span className="disabled">-</span>
        )
      }
    </>
  );
}


export const MonsterLink: React.FC<LinkProps> = (props) => {
  const context = React.useContext(AdventureContext);
  const { slug } = useParams();
  const id = props.id;
  const monster = context.monsters.get(id);
  return (
    <>
      {id ? (
        <Link to={`/designer/${slug}/monsters/${id}`}>
          #{id}: {monster ? monster.getLongName() : 'unknown'}
        </Link>) : (
        <span className="disabled">-</span>
      )
      }
    </>
  );
}


export const MonsterWeaponLink: React.FC<LinkProps> = (props) => {
  const id = props.id;
  if (id === 0) {
    return <>natural weapons</>
  }
  if (id > 0) {
    return <ArtifactLink id={id}/>
  }
  return <span className="disabled">unarmed</span>
}


export const ArtifactLocation: React.FC<LinkProps> = (props) => {
  const context = React.useContext(AdventureContext);
  const artifact = context.artifacts.get(props.id);
  if (artifact.room_id) {
    return (
      <>
        In room: <RoomLink id={artifact.room_id} />
      </>
    )
  }
  if (artifact.monster_id && artifact.type != 10 && artifact.type != 12) {
    return (
      <>
        Carried by monster: <MonsterLink id={artifact.monster_id} />
      </>
    )
  }
  if (artifact.container_id) {
    return (
      <>
        In container: <ArtifactLink id={artifact.container_id} />
      </>
    )
  }
  return (
    <>Nowhere</>
  );
}


export const MonsterLocation: React.FC<LinkProps> = (props) => {
  const context = React.useContext(AdventureContext);
  const monster = context.monsters.get(props.id);
  if (monster.room_id) {
    return (
      <>
        In room: <RoomLink id={monster.room_id} />
      </>
    )
  }
  if (monster.container_id) {
    return (
      <>
        In container: <ArtifactLink id={monster.container_id} />
        {' '}
        (<ArtifactLocation id={monster.container_id} />)
      </>
    )
  }
  const bound = context.artifacts.all.find(
    a => a.type === Artifact.TYPE_BOUND_MONSTER && a.monster_id === monster.id);
  if (bound) {
    return (
      <>
        Bound within artifact: <ArtifactLink id={bound.id} />
        {' '}
        (<ArtifactLocation id={bound.id} />)
      </>
    )
  }
  const disguised = context.artifacts.all.find(
    a => a.type === Artifact.TYPE_DISGUISED_MONSTER && a.monster_id === monster.id);
  if (disguised) {
    return (
      <>
        Disguised within artifact: <ArtifactLink id={disguised.id} />
        {' '}
        (<ArtifactLocation id={disguised.id} />)
      </>
    )
  }
  return (
    <>Nowhere</>
  );
}

//
// export function ArtifactType(props): JSX.Element {
//   const type = props.type;
//   const icon = ArtifactIcons[props.type];
//   const icon_url = '/static/images/ravenmore/128/' + icon + '.png';
//   return (
//     <>
//       <img src={icon_url} />
//       <span><</span>
//       }}
//     </>
//   );
// }


type TextStyleProps = {
  style: string,
}

export const TextStyleLabel: React.FC<TextStyleProps> = (props) => {
  const style = props.style || 'default';
  return (
    <span className={style}>{style}</span>
  )
}

