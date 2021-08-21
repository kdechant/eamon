import * as React from 'react';

import AdventureContext from "../context";
import {Link} from "react-router-dom";
import {useParams} from "react-router";
import {ArtifactIcons} from "../constants";

type LinkProps = {
  id: number
}

export function RoomLink(props: LinkProps): JSX.Element {
  const context = React.useContext(AdventureContext);
  const { slug } = useParams<{ slug: string }>();
  const id = props.id;
  if (id === 0) {
    return <span className="disabled">no connection</span>;
  }
  if (id === -999 || id === -998) {
    return <>Adventure exit (#{id})</>;
  }
  if (id) {
    const room = context.rooms.get(id);
    if (room) {
      return (
        <Link to={`/designer/${slug}/rooms/${id}`}>
          #{id}: {room ? room.name : 'unknown'}
        </Link>
      );
    }
    if (id < 0) {
      return <>Special Connection: #{id}</>;
    }
    return <>Unknown room: #{id}</>;
  }
  return <span className="disabled">-</span>;
}

export function ArtifactLink(props: LinkProps): JSX.Element {
  const context = React.useContext(AdventureContext);
  const { slug } = useParams<{ slug: string }>();
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

export function EffectLink(props: LinkProps): JSX.Element {
  const context = React.useContext(AdventureContext);
  const { slug } = useParams<{ slug: string }>();
  const id = props.id;
  const effect = context.effects.get(id);
  return (
    <>
      {id ? (
        <Link to={`/designer/${slug}/effects/${id}`}>
          #{id}: {effect[id] ? effect.text.slice(0, 25) : 'unknown'}
        </Link>) : (
        <span className="disabled">-</span>
        )
      }
    </>
  );
}

export function MonsterLink(props: LinkProps): JSX.Element {
  const context = React.useContext(AdventureContext);
  const { slug } = useParams<{ slug: string }>();
  const id = props.id;
  const monster = context.monsters.get(id);
  return (
    <>
      {id ? (
        <Link to={`/designer/${slug}/monsters/${id}`}>
          #{id}: {monster ? monster.name : 'unknown'}
        </Link>) : (
        <span className="disabled">-</span>
      )
      }
    </>
  );
}

export function MonsterWeaponLink(props): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const id = props.id;
  if (id === 0) {
    return <>natural weapons</>
  }
  if (id > 0) {
    return <ArtifactLink id={id}/>
  }
  return <span className="disabled">unarmed</span>
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

export function TextStyleLabel(props): JSX.Element {
  const style = props.style || 'default';
  return (
    <span className={style}>{style}</span>
  )
}

