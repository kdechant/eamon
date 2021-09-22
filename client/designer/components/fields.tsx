import * as React from 'react';

import {UserContext} from "../context";

interface FieldProps {
  name: string,
  label: string,
  value: string | number,
  helpText: string,
  afterText?: string,
  setField: (event) => void,
}

export function HelpText(props: Record<string, string>): JSX.Element {
  if (!props.text) {
    return <></>;
  }
  return <small className="form-text text-muted">{props.text}</small>;
}

export function ObjectTextField(props: FieldProps): JSX.Element {
  const user_context = React.useContext(UserContext);
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
      <input type="text" name={props.name} className="form-control"
             onChange={props.setField} value={props.value} />
      <HelpText text={props.helpText} />
    </div>
  );
}

export function ObjectNumberField(props: FieldProps): JSX.Element {
  const user_context = React.useContext(UserContext);
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
      <div className="input-group">
        <input type="number" name={props.name} className="form-control"
               onChange={props.setField} value={props.value} />
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
  helpText: string,
  setField: (event) => void,
}

/**
 * Grouped fields for dice and sides, inline on the same row
 */
export function ObjectDiceSidesField(props: DiceSidesFieldProps): JSX.Element {
  const user_context = React.useContext(UserContext);
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
        <input type="number" name={props.diceName} value={props.diceValue} onChange={props.setField}
               className="form-control" placeholder="1" aria-label="Dice" />
        <span className="input-group-text">D</span>
        <input type="number" name={props.sidesName} value={props.sidesValue} onChange={props.setField}
               className="form-control" placeholder="1" aria-label="Sides" />
      </div>
      <HelpText text={props.helpText} />
    </div>
  );
}
