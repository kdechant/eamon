import * as React from 'react';
import {useParams} from "react-router";
import {Link} from "react-router-dom";
import {AdventureContext, FormContext, UserContext} from "../context";
import {ObjectTextareaField, ObjectTextField} from "./fields";

function AdventureDetail(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);

  const setField = (ev) => {
    context.setAdventureField(ev.target.name, ev.target.value);
  };

  const saveField = (ev) => {
    context.saveAdventureField(ev.target.name, ev.target.value);
  };

  return (
    <FormContext.Provider value={{setField, saveField}}>
      <div className="row">
        <div className="col-md-8">
          <ObjectTextField name="name" label="Name" value={context.adventure.name} />
          <ObjectTextField name="slug" label="URL Slug" value={context.adventure.slug} />
          <ObjectTextareaField
            name="description" label="Description"
            value={context.adventure.description}
            helpText="This is what the user sees in the adventure menu in the Main Hall." />
          <ObjectTextareaField
            name="intro_text" label="Intro text"
            value={context.adventure.intro_text}
            helpText="Text shown to the adventurer when they begin the adventure.
              Use this to set up the story. Split it into multiple pages by using a line containing
              three hyphens as a break. Supports Markdown." />
        </div>
        <div className="col-md-4">
          <div>
            <p><Link to={`rooms`}>{context.rooms?.all?.length} Rooms</Link></p>
            <p><Link to={`artifacts`}>{context.artifacts?.all.length} Artifacts</Link></p>
            <p><Link to={`effects`}>{context.effects?.all?.length} Effects</Link></p>
            <p><Link to={`monsters`}>{context.monsters?.all?.length} Monsters</Link></p>
            <p><Link to={`hints`}>{context.hints?.all?.length} Hints</Link></p>
          </div>
        </div>
      </div>
    </FormContext.Provider>
  );
}

export default AdventureDetail;
