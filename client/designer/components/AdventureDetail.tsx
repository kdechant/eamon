import * as React from 'react';
import {useParams} from "react-router";
import {Link} from "react-router-dom";
import AdventureContext from "../context";

function AdventureDetail(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const context = React.useContext(AdventureContext);

  const setField = (ev) => {
    context.setAdventureField(ev.target.name, ev.target.value);
  };

  return <>
    <div>
      <textarea className="form-control" name="description" rows={10}
                onChange={setField} value={context.adventure.description}>
      </textarea>
    </div>
    <div>
      <p><Link to={`${slug}/rooms`}>{context.rooms?.all?.length} Rooms</Link></p>
      <p><Link to={`${slug}/artifacts`}>{context.artifacts?.all.length} Artifacts</Link></p>
      <p><Link to={`${slug}/effects`}>{context.effects?.all?.length} Effects</Link></p>
      <p><Link to={`${slug}/monsters`}>{context.monsters?.all?.length} Monsters</Link></p>
      <p><Link to={`${slug}/hints`}>{context.hints?.all?.length} Hints</Link></p>
    </div>
  </>;
}

export default AdventureDetail;
