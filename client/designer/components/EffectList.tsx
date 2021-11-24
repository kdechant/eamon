import * as React from 'react';
import { Link } from "react-router-dom";

import AdventureContext from "../contexts/adventure";
import {TextStyleLabel} from "./common";


const EffectList: React.FC = () => {
  const context = React.useContext(AdventureContext);

  if (!context.adventure) {
    return <p>Loading...</p>;
  }

  let emptyMessage = '';
  if (!context.effects.all.length) {
    emptyMessage = 'no effects yet';
  }

  return (
    <div id="EffectList">
      <h3>Effects</h3>

      <p>Choose an effect:</p>

      <div className="container-fluid">
        <div className="row">
          {emptyMessage}
          <table className="table">
            <thead>
              <tr>
                <td>#</td>
                <td>Text</td>
                <td>Style</td>
              </tr>
            </thead>
            <tbody>
              {context.effects?.all.map(eff => {
                return (
                  <tr className="effects-list-item" key={eff.id}>
                    <td>{eff.id}</td>
                    <td><Link to={`${eff.id}`}>{eff.text}</Link></td>
                    <td><TextStyleLabel style={eff.style} /></td>
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

export default EffectList;
