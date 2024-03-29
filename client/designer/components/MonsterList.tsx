import * as React from 'react';
import { Link } from "react-router-dom";

import AdventureContext from "../contexts/adventure";
import {ArtifactLink, MonsterLink, MonsterLocation, MonsterWeaponLink, RoomLink} from "./common";


const MonsterList: React.FC = () => {
  const context = React.useContext(AdventureContext);

  if (!context.adventure) {
    return <p>Loading...</p>;
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
                <td>Location</td>
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
                    <td><Link to={`${mon.id}`}>{mon.name}</Link></td>
                    <td><MonsterLocation id={mon.id} /></td>
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
