import * as React from 'react';
import {useParams} from "react-router";
import {Link} from "react-router-dom";
import AdventureContext from "../contexts/adventure";
import FormContext from "../contexts/form";
import {ObjectTextareaField, ObjectTextField} from "./fields";

function AdventureDetail(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const adventureContext = React.useContext(AdventureContext);

  const setField = (ev) => {
    adventureContext.setAdventureField(ev.target.name, ev.target.value);
  };

  const saveField = (ev) => {
    adventureContext.saveAdventureField(ev.target.name, ev.target.value);
  };

  if (!adventureContext.adventure) {
    return <></>;
  }

  return (
    <FormContext.Provider value={{setField, saveField}}>
      <div className="row">
        <div className="col-md-8">
          <ObjectTextField name="name" label="Name" value={adventureContext.adventure.name} />
          <ObjectTextField name="slug" label="URL Slug" value={adventureContext.adventure.slug} />
          <ObjectTextareaField
            name="description" label="Description"
            value={adventureContext.adventure.description}
            helpText="This is what the user sees in the adventure menu in the Main Hall." />
          <ObjectTextareaField
            name="intro_text" label="Intro text"
            value={adventureContext.adventure.intro_text}
            helpText="Text shown to the adventurer when they begin the adventure.
              Use this to set up the story. Split it into multiple pages by using a line containing
              three hyphens as a break. Supports Markdown." />
        </div>
        <div className="col-md-4">
          <div>
            <p><Link to={`/designer/${slug}/rooms`}>{adventureContext.rooms?.all?.length} Rooms</Link></p>
            <p><Link to={`/designer/${slug}/artifacts`}>{adventureContext.artifacts?.all.length} Artifacts</Link></p>
            <p><Link to={`/designer/${slug}/effects`}>{adventureContext.effects?.all?.length} Effects</Link></p>
            <p><Link to={`/designer/${slug}/monsters`}>{adventureContext.monsters?.all?.length} Monsters</Link></p>
            <p><Link to={`/designer/${slug}/hints`}>{adventureContext.hints?.all?.length} Hints</Link></p>
          </div>
        </div>
      </div>
    </FormContext.Provider>
  );
}

export default AdventureDetail;
