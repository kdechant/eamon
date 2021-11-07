import {Link} from "react-router-dom";
import * as React from "react";
import AdventureContext from "../contexts/adventure";
import {useParams} from "react-router";

function AdventureHeading(): JSX.Element {
  const adventureContext = React.useContext(AdventureContext);
  const {slug} = useParams<{ slug: string }>();

  if (!adventureContext.adventure) {
    return <p>Loading {slug}...</p>;
  }

  return (
    <div className="row">
      <div className="col-sm-2 col-md-1 d-none d-sm-block">
        <img src="/static/images/ravenmore/128/map.png" width="64" alt="Map"/>
      </div>
      <div className="col-sm-10 col-md-11">
        <div
          className="float-right text-secondary d-none d-md-block adv-id">#{adventureContext.adventure.id}</div>
        <h3><Link to={`/designer/${slug}`}>{adventureContext.adventure.name}</Link></h3>
        <p>{adventureContext.adventure.authors_display.length ? "By: " + adventureContext.adventure.authors_display : ""}</p>
      </div>
    </div>
  );

}

export default AdventureHeading;
