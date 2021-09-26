import * as React from 'react';
import { Link } from "react-router-dom";

import {useParams} from "react-router";
import {AdventureContext} from "../context";
import {TextStyleLabel} from "./common";

function EffectList(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const context = React.useContext(AdventureContext);

  if (!context.adventure) {
    return <p>Loading {slug}...</p>;
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
                    <td><Link to={`effects/${eff.id}`}>{eff.text}</Link></td>
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
