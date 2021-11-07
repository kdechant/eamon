import * as React from 'react';
import {useParams} from "react-router";

import AdventureContext from "../contexts/adventure";
import FormContext from "../contexts/form";
import {EffectLink} from "./common";
import {
  EffectSelectField,
  ObjectDescriptionField,
  ObjectSelectField,
} from "./fields";
import {TEXT_STYLES} from "../models/effect";

function RoomDetail(): JSX.Element {
  const { slug, id } = useParams<{ slug: string, id: string }>();
  const context = React.useContext(AdventureContext);

  const effect = context.effects.get(id);
  if (!effect) {
    return <>Effect #${id} not found!</>;
  }

  const prev = context.effects.getPrev(id);
  const next = context.effects.getNext(id);

  const setField = (ev) => {
    context.setEffectField(parseInt(id), ev.target.name, ev.target.value);
  };

  const saveField = (ev) => {
    context.saveEffectField(parseInt(id), ev.target.name, ev.target.value);
  };

  return (
    <FormContext.Provider value={{setField, saveField}}>
      <div className="row no-gutters">
        <div className="col-md-8">
          <strong>Effect # {id}</strong>
        </div>
        <div className="col-md-2">
        {prev && <>&larr; <EffectLink id={prev} /></>}
        </div>
        <div className="col-md-2">
        {next && <><EffectLink id={next} /> &rarr;</>}
        </div>
      </div>
      <ObjectDescriptionField name="text" label="Effect Text"
                              value={effect.text} isMarkdown={effect.is_markdown} />
      {/* TODO: could use the react-select styled options feature for this select menu */}
      <ObjectSelectField name="style" value={effect.style}
                         label="Text Style" choices={TEXT_STYLES} />

      <EffectSelectField name="next" value={effect.next} allowEmpty={true}
                         label="Chained Effect"
                         helpText="An effect that will be shown immediately after this one." />

      <EffectSelectField name="next_inline" value={effect.next_inline} allowEmpty={true}
                         label="Chained Effect (no line break)"
                         helpText="An effect that will be shown immediately after this one,
                         without a line break. (Only for legacy EDX conversions. Do not enter
                         new data in this field.)" />

    </FormContext.Provider>
  );
}

export default RoomDetail;
