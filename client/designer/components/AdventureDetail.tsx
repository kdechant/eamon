import * as React from 'react';
import {useParams} from "react-router";
import {Link} from "react-router-dom";
import AdventureContext from "../context";
import {UserContext} from "../context";

function AdventureDetail(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);

  const setField = (ev) => {
    context.setAdventureField(ev.target.name, ev.target.value);
  };

  return <>
    <div className="row">
      <div className="col-md-8">
        {user_context.username && (
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" name="name" className="form-control"
                   onChange={setField} value={context.adventure.name} />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="slug">URL Slug</label>
          <input type="text" name="slug" className="form-control"
                 onChange={setField} value={context.adventure.slug} disabled={!user_context.username} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea className="form-control" name="description" rows={4}
                    onChange={setField} value={context.adventure.description}
                    disabled={!user_context.username}>
          </textarea>
          <small className="form-text">This is what the user sees in the adventure menu in the Main Hall.</small>
        </div>
        <div className="form-group">
          <label htmlFor="description">Intro Text</label>
          <textarea className="form-control" name="intro_text" rows={10}
                    onChange={setField} value={context.adventure.intro_text}
                    disabled={!user_context.username}>
          </textarea>
          <small className="form-text">Text shown to the adventurer when they begin the adventure.
            Use this to set up the story. Split it into multiple pages by using a line containing
            three hyphens as a break. Supports Markdown.</small>
        </div>
      </div>
      <div className="col-md-4">
        <div>
          <p><Link to={`${slug}/rooms`}>{context.rooms?.all?.length} Rooms</Link></p>
          <p><Link to={`${slug}/artifacts`}>{context.artifacts?.all.length} Artifacts</Link></p>
          <p><Link to={`${slug}/effects`}>{context.effects?.all?.length} Effects</Link></p>
          <p><Link to={`${slug}/monsters`}>{context.monsters?.all?.length} Monsters</Link></p>
          <p><Link to={`${slug}/hints`}>{context.hints?.all?.length} Hints</Link></p>
        </div>
      </div>
    </div>
  </>;
}

export default AdventureDetail;
