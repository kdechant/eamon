import * as React from 'react';
import { Link, RouteComponentProps } from "react-router-dom";

import {useParams} from "react-router";
import AdventureContext from "../context";
import {ArtifactLink, MonsterLink, MonsterWeaponLink, RoomLink} from "./common";

function MonsterList(): JSX.Element {
  const context = React.useContext(AdventureContext);
  const { slug } = useParams<{ slug: string }>();

  if (!context.adventure) {
    return <p>Loading {slug}...</p>;
  }

  let emptyMessage = '';
  if (!context.monsters.all.length) {
    emptyMessage = 'No monsters yet';
  }

  return (
    <div id="MonsterList">
      <h3>Monsters</h3>

      <p>Choose an monster:</p>

      <div className="container-fluid">
        <div className="row">
          {emptyMessage}
          <table className="table">
            <thead>
              <tr>
                <td>#</td>
                <td>Name</td>
                <td>In Room</td>
                <td>Count</td>
                <td>HD</td>
                <td>AG</td>
                <td>Starting Weapon</td>
              </tr>
            </thead>
            <tbody>
              {context.monsters?.all.map((mon) => {
                return (
                  <tr className="monster-list-item" key={mon.id}>
                    <td>{mon.id}</td>
                    <td><Link to={`monsters/${mon.id}`}>{mon.name}</Link></td>
                    <td><RoomLink id={mon.room_id} /></td>
                    <td>{mon.count}</td>
                    <td>{mon.hardiness}</td>
                    <td>{mon.agility}</td>
                    <td><MonsterWeaponLink id={mon.weapon_id} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MonsterList;
