import * as React from 'react';

import AdventureContext from "../context";
import {Link} from "react-router-dom";
import {useParams} from "react-router";
import {ArtifactIcons} from "../constants";

export function RoomLink(props): JSX.Element {
  const { slug } = useParams();
  const id = props.id;

  return (
    <AdventureContext.Consumer>
      {state => {
        if (id === 0) {
          return <span className="disabled">no connection</span>;
        }
        if (id === -999 || id === -998) {
          return <>Adventure exit (#{id})</>;
        }
        if (id === 0) {
          return <span className="disabled">no connection</span>;
        }
        if (id) {
          const room = state.rooms.get(id);
          return (
            <Link to={`/designer/${slug}/rooms/${id}`}>
              #{id}: {room ? room.name : 'unknown'}
            </Link>
          );
        }
        return <span className="disabled">-</span>;
      }}
    </AdventureContext.Consumer>
  );
}

export function ArtifactLink(props): JSX.Element {
  const { slug } = useParams();
  const id = props.id;
  return (
    <AdventureContext.Consumer>
      {state => {
        const artifact = state.artifacts.get(id);
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
      }}
    </AdventureContext.Consumer>
  );
}

export function EffectLink(props): JSX.Element {
  const { slug } = useParams();
  const id = props.id;
  return (
    <AdventureContext.Consumer>
      {state => {
        const effect = state.effects.get(id);
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
      }}
    </AdventureContext.Consumer>
  );
}

export function MonsterLink(props): JSX.Element {
  const { slug } = useParams();
  const id = props.id;
  return (
    <AdventureContext.Consumer>
      {state => {
        const monster = state.monsters.get(id);
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
      }}
    </AdventureContext.Consumer>
  );
}

export function MonsterWeaponLink(props): JSX.Element {
  const { slug } = useParams();
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

