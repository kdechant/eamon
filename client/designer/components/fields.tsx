import * as React from 'react';

import AdventureContext from "../contexts/adventure";
import UserContext from "../contexts/user";
import FormContext from "../contexts/form";
import {ArtifactLink, EffectLink, MonsterLink, RoomLink} from "./common";

interface FieldProps {
  name: string,
  label: string,
  value: string | number,
  placeholder?: string,
  helpText?: string,
  afterText?: string | JSX.Element,
}

export function ObjectTextField(props: FieldProps): JSX.Element {
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{props.label}</label>
        <span>{props.value}</span>
        <HelpText text={props.helpText} />
      </div>
    )
  }
  return (
    <div className="form-group">
      <label htmlFor={props.name}>{props.label}</label>
      <input type="text" className="form-control"
             name={props.name} value={props.value || ""}
             placeholder={props.placeholder}
             onChange={form_context.setField} onBlur={form_context.saveField} />
      <HelpText text={props.helpText} />
    </div>
  );
}

interface TextAreaFieldProps extends FieldProps {
  rows?: number,
}

export function ObjectTextareaField(props: TextAreaFieldProps): JSX.Element {
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{props.label}</label>
        <span>{props.value}</span>
        <HelpText text={props.helpText} />
      </div>
    )
  }
  const rows = props.rows || 5;
  return (
    <div className="form-group">
      <label htmlFor={props.name}>{props.label}</label>
      <textarea className="form-control" rows={rows}
                name={props.name} value={props.value || ""}
                onChange={form_context.setField} onBlur={form_context.saveField} >
      </textarea>
      <HelpText text={props.helpText} />
    </div>
  );
}

interface DescriptionFieldProps {
  name?: string,
  label?: string,
  value: string,
  isMarkdown: boolean,
  helpText?: string,
  rows?: number,
}

/**
 * Like ObjectTextareaField, but has a "markdown" toggle.
 * @param props
 * @constructor
 */
export function ObjectDescriptionField(props: DescriptionFieldProps): JSX.Element {
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  const name = props.name || 'description';
  const label = props.label || 'Description';
  const rows = props.rows || 5;

  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{label}</label>
        <span>{props.value}</span>
        <HelpText text={props.helpText} />
      </div>
    )
  }

  const setAndSaveField = (ev: any) => {
    form_context.setField(ev);
    form_context.saveField(ev);
  };

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <textarea className="form-control" rows={rows}
                name={name} id={name} value={props.value}
                onChange={form_context.setField} onBlur={form_context.saveField}
                disabled={!user_context.username}>
      </textarea>
        <div className="form-group">
          <span className="mr-2">Description format:</span>
          <div className="form-check form-check-inline">
            <input type="radio" className="form-check-input"
                   name="is_markdown" id="is_markdown_n" value={0}
                   checked={!props.isMarkdown}
                   onChange={setAndSaveField} />
            <label htmlFor="is_markdown_n" className="form-check-label">Plain Text</label>
          </div>
          <div className="form-check form-check-inline">
            <input type="radio" className="form-check-input"
                   name="is_markdown" id="is_markdown_y" value={1}
                   checked={props.isMarkdown}
                   onChange={setAndSaveField} />
            <label htmlFor="is_markdown_y" className="form-check-label">Markdown</label>
          </div>
        </div>
      <HelpText text={props.helpText} />
    </div>
  );
}

export function ObjectNumberField(props: FieldProps): JSX.Element {
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{props.label}</label>
        <span>{props.value}</span>
        <HelpText text={props.helpText} />
      </div>
    )
  }
  const val = props.value === null ? '' : props.value;
  return (
    <div className="form-group">
      <label htmlFor={props.name}>{props.label}</label>
      <div className="input-group">
        <input type="number" className="form-control"
               name={props.name} value={val}
               onChange={form_context.setField} onBlur={form_context.saveField} />
        {props.afterText && (
          <span className="input-group-text">{props.afterText}</span>
        )}
      </div>
      <HelpText text={props.helpText} />
    </div>
  );
}

interface DiceSidesFieldProps {
  diceName: string,
  sidesName: string,
  label: string,
  diceValue: number,
  sidesValue: number,
  helpText?: string,
}

/**
 * Grouped fields for dice and sides, inline on the same row
 */
export function ObjectDiceSidesField(props: DiceSidesFieldProps): JSX.Element {
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{props.label}</label>
        <span>{props.diceValue + " D " + props.sidesValue}</span>
        <HelpText text={props.helpText} />
      </div>
    )
  }
  return (
    <div className="form-group">
      <label htmlFor={props.diceName}>{props.label}</label>
      <div className="input-group">
        <input type="number" name={props.diceName} value={props.diceValue}
               className="form-control" placeholder="1" aria-label="Dice"
               onChange={form_context.setField} onBlur={form_context.saveField} />
        <span className="input-group-text">D</span>
        <input type="number" name={props.sidesName} value={props.sidesValue}
               className="form-control" placeholder="1" aria-label="Sides"
               onChange={form_context.setField} onBlur={form_context.saveField} />
      </div>
      <HelpText text={props.helpText} />
    </div>
  );
}

interface ToggleFieldProps {
  name?: string,
  label: string,
  value: boolean,
  helpText?: string,
}

export function ObjectToggleField(props: ToggleFieldProps): JSX.Element {
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{props.label}</label>
        <span>{props.value ? 'Yes' : 'No'}</span>
        <HelpText text={props.helpText} />
      </div>
    )
  }
  const setAndSaveField = (ev: any) => {
    form_context.setField(ev);
    form_context.saveField(ev);
  };
  return (
    <div className="form-group">
      <span className="mr-2">{props.label}</span>
      <div className="form-check form-check-inline">
        <input type="radio" className="form-check-input" name={props.name} id={props.name + "_n"} value={0}
               checked={!props.value} onChange={setAndSaveField} />
        <label htmlFor={props.name + "_n"} className="form-check-label">No</label>
      </div>
      <div className="form-check form-check-inline">
        <input type="radio" className="form-check-input" name={props.name} id={props.name + "_y"} value={1}
               checked={props.value} onChange={setAndSaveField} />
        <label htmlFor={props.name + "_y"} className="form-check-label">Yes</label>
      </div>
      <HelpText text={props.helpText} />
    </div>
  );
}

interface SelectFieldProps extends FieldProps {
  choices: Record<number | string, string>,
  allowEmpty?: boolean,
}

export function ObjectSelectField(props: SelectFieldProps): JSX.Element {
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{props.label}</label>
        <span>{props.choices[props.value]}</span>
        <HelpText text={props.helpText} />
      </div>
    )
  }
  const setAndSaveField = (ev: any) => {
    form_context.setField(ev);
    form_context.saveField(ev);
  };
  return (
    <div className="form-group">
      <label htmlFor={props.name}>{props.label}</label>
      <select className="custom-select" name={props.name} id={props.name} value={props.value || ""}
              onChange={setAndSaveField}>
        {props.allowEmpty && <option value="">-</option>}
        {Object.entries(props.choices).map(v => <option value={v[0]} key={v[0]}>{v[1]}</option>)}
      </select>
      <HelpText text={props.helpText} />
    </div>
  );
}

interface GameObjectFieldProps extends FieldProps {
  value: number,
  extraOptions?: Record<number, string>,
  allowEmpty?: boolean,
}

export function RoomSelectField(props: GameObjectFieldProps): JSX.Element {
  const adventure_context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{props.label}</label>
        <span><RoomLink id={props.value} /></span>
        <HelpText text={props.helpText} />
      </div>
    )
  }
  const setAndSaveField = (ev: React.ChangeEvent<HTMLElement>) => {
    form_context.setField(ev);
    form_context.saveField(ev);
  };

  const room_entries = adventure_context.rooms.all.map(r => [r.id, r.name]);
  room_entries.push([-999, 'Adventure exit']);
  room_entries.push([-998, 'Adventure exit (no "Ride off into the sunset" message)'])

  return (
    <div className="form-group">
      <label htmlFor="weapon_type">{props.label}</label>
      <div className="input-group">
        <select className="custom-select" name={props.name} value={props.value || ""}
                onChange={setAndSaveField}>
          {props.allowEmpty && <option value="">-</option>}
          {props.extraOptions && Object.entries(props.extraOptions).map(opt => (
              <option value={opt[0]} key={opt[0]}>{opt[0]}: {opt[1]}</option>
          ))}
          {room_entries.map(v => <option value={v[0]} key={v[0]}>{v[0]}: {v[1]}</option>)}
        </select>
        {props.value && props.value > 0 && (
          <span className="input-group-text"><RoomLink id={props.value} maxLength={25} /></span>
        )}
      </div>
      <HelpText text={props.helpText} />
    </div>
  );
}

export function ArtifactSelectField(props: GameObjectFieldProps): JSX.Element {
  const adventure_context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{props.label}</label>
        <span><ArtifactLink id={props.value} /></span>
        <HelpText text={props.helpText} />
      </div>
    )
  }
  const setAndSaveField = (ev: React.ChangeEvent<HTMLElement>) => {
    form_context.setField(ev);
    form_context.saveField(ev);
  };

  const artifact_entries = adventure_context.artifacts.all.map(a => [a.id, a.name]);

  return (
    <div className="form-group">
      <label htmlFor="weapon_type">{props.label}</label>
      <div className="input-group">
        <select className="custom-select" name={props.name} value={props.value || ""}
                onChange={setAndSaveField}>
          {props.allowEmpty && <option value="">-</option>}
          {props.extraOptions && Object.entries(props.extraOptions).map(opt => (
              <option value={opt[0]} key={opt[0]}>{opt[0]}: {opt[1]}</option>
          ))}
          {artifact_entries.map(v => <option value={v[0]} key={v[0]}>{v[0]}: {v[1]}</option>)}
        </select>
        {props.value && (
          <span className="input-group-text"><ArtifactLink id={props.value} /></span>
        )}
      </div>
      <HelpText text={props.helpText} />
    </div>
  );
}

export function EffectSelectField(props: GameObjectFieldProps): JSX.Element {
  const adventure_context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{props.label}</label>
        <span><EffectLink id={props.value} /></span>
        <HelpText text={props.helpText} />
      </div>
    )
  }
  const setAndSaveField = (ev: React.ChangeEvent<HTMLElement>) => {
    form_context.setField(ev);
    form_context.saveField(ev);
  };

  const effect_entries = adventure_context.effects.all.map(e => [e.id, e.excerpt()]);

  return (
    <div className="form-group">
      <label htmlFor="weapon_type">{props.label}</label>
      <div className="input-group">
        <select className="custom-select" name={props.name} value={props.value || ""}
                onChange={setAndSaveField}>
          {props.allowEmpty && <option value="">-</option>}
          {effect_entries.map(v => <option value={v[0]} key={v[0]}>{v[0]}: {v[1]}</option>)}
        </select>
        {props.value && (
          <span className="input-group-text"><EffectLink id={props.value} /></span>
        )}
      </div>
      <HelpText text={props.helpText} />
    </div>
  );
}

export function MonsterSelectField(props: GameObjectFieldProps): JSX.Element {
  const adventure_context = React.useContext(AdventureContext);
  const user_context = React.useContext(UserContext);
  const form_context = React.useContext(FormContext);
  if (!user_context.username) {
    return (
      <div className="form-group">
        <label>{props.label}</label>
        <span><MonsterLink id={props.value} /></span>
        <HelpText text={props.helpText} />
      </div>
    )
  }
  const setAndSaveField = (ev: React.ChangeEvent<HTMLElement>) => {
    form_context.setField(ev);
    form_context.saveField(ev);
  };

  const monster_entries = adventure_context.monsters.all.map(m => [m.id, m.name]);

  return (
    <div className="form-group">
      <label htmlFor="weapon_type">{props.label}</label>
      <div className="input-group">
        <select className="custom-select" name={props.name} value={props.value || ""}
                onChange={setAndSaveField}>
          {props.allowEmpty && <option value="">-</option>}
          {monster_entries.map(v => <option value={v[0]} key={v[0]}>{v[0]}: {v[1]}</option>)}
        </select>
        {props.value && (
          <span className="input-group-text"><MonsterLink id={props.value} /></span>
        )}
      </div>
      <HelpText text={props.helpText} />
    </div>
  );
}

export function HelpText(props: Record<string, string>): JSX.Element {
  if (!props.text) {
    return <></>;
  }
  return <small className="form-text text-muted">{props.text}</small>;
}
