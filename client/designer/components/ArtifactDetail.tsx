import * as React from 'react';
import {useParams} from "react-router";

import AdventureContext from "../context";
import Artifact from '../models/artifact';
import {ArtifactLink, EffectLink, RoomLink} from "./common";

function ArtifactDetail(): JSX.Element {
  const { slug, id } = useParams();
  return (
    <AdventureContext.Consumer>
      {state => {
        const artifact = state.artifacts.get(id);
        if (!artifact) {
          return <>Artifact #${id} not found!</>;
        }
        let contents = [];
        if (artifact.type === Artifact.TYPE_CONTAINER) {
          contents = state.artifacts.all.filter(a => a.container_id == artifact.id);
        }
        return (
          <>
            <p>
              Artifact # {id}
            </p>
            <p>
              Name:<br />
              {artifact.name}
            </p>
            <p>
              Description:<br />
              {artifact.description}
            </p>
            <p>
              Type<br />
              {/*<ArtifactType type={artifact.type} />*/}
              {artifact.type}
            </p>
            <p>
              Value<br />
              {artifact.value}
            </p>
            <p>
              Weight<br />
              {artifact.weight} gronds
              {' '}
              {artifact.weight === -999 && (
                <span>(Can't be picked up.)</span>
              )}
              {artifact.weight >= 900 && (
                <span>(Don't be absurd.)</span>
              )}
            </p>
            {(artifact.isWeapon() && (
              <>
                <p>
                  Weapon Type<br />
                  {artifact.weapon_type}
                </p>
                <p>
                  Weapon Odds<br />
                  {artifact.weapon_odds}
                </p>
                <p>
                  Weapon Dice<br />
                  {artifact.weapon_dice}
                </p>
                <p>
                  Weapon Sides<br />
                  {artifact.weapon_sides}
                </p>
              </>
            )}
            {(artifact.type === Artifact.TYPE_EDIBLE || artifact.type === Artifact.TYPE_DRINKABLE) && (
              <>
                <p>
                  Drinks/Bites<br />
                  {artifact.weapon_type}
                </p>
                <p>
                  Healing Dice (negative = poison)<br />
                  {artifact.weapon_dice}
                </p>
                <p>
                  Healing Sides<br />
                  {artifact.weapon_sides}
                </p>
              </>
            )}
            {(artifact.type === Artifact.TYPE_CONTAINER) && (
              <div>
                Contents<br />
                {contents.length === 0 && <span>nothing</span>}
                {contents.map(a => (
                  <div key={a.id}>
                    <ArtifactLink id={a.id} />
                  </div>
                ))}
              </div>
            )}
          </>
        );
      }}
    </AdventureContext.Consumer>
  );
}

export default ArtifactDetail;
