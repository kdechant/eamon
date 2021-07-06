import * as React from 'react';

import AdventureContext from "../context";
import {Link} from "react-router-dom";
import {useParams} from "react-router";

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
          return (
            <Link to={`/designer/${slug}/rooms/${id}`}>
              #{id}: {state.rooms[id] ? state.rooms[id].name : 'unknown'}
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
      {state => (
        <>
          {id ? (
            <Link to={`/designer/${slug}/artifacts/${id}`}>
              #{id}: {state.artifacts[id] ? state.artifacts[id].name : 'unknown'}
            </Link>) : (
            <span className="disabled">-</span>
            )
          }
        </>
      )}
    </AdventureContext.Consumer>
  );
}

export function EffectLink(props): JSX.Element {
  const { slug } = useParams();
  const id = props.id;
  return (
    <AdventureContext.Consumer>
      {state => (
        <>
          {id ? (
            <Link to={`/designer/${slug}/effects/${id}`}>
              #{id}: {state.effects[id] ? state.effects[id].text.slice(0, 25) : 'unknown'}
            </Link>) : (
            <span className="disabled">-</span>
            )
          }
        </>
      )}
    </AdventureContext.Consumer>
  );
}

export function MonsterLink(props): JSX.Element {
  const { slug } = useParams();
  const id = props.id;
  return (
    <AdventureContext.Consumer>
      {state => (
        <>
          {id ? (
            <Link to={`/designer/${slug}/monsters/${id}`}>
              #{id}: {state.monsters[id] ? state.monsters[id].name : 'unknown'}
            </Link>) : (
            <span className="disabled">-</span>
            )
          }
        </>
      )}
    </AdventureContext.Consumer>
  );
}

export function MonsterWeaponLink(props): JSX.Element {
  const { slug } = useParams();
  const id = props.id;
  return (
    <AdventureContext.Consumer>
      {state => {
        if (id === 0) {
          return <>Natural Weapons</>
        }
        if (id) {
          return <ArtifactLink id={id}></ArtifactLink>
        }
        return <span className="disabled">unarmed</span>
      }}
    </AdventureContext.Consumer>
  );
}

export function TextStyleLabel(props): JSX.Element {
  const style = props.style || 'default';
  return (
    <span className={style}>{style}</span>
  )
}

