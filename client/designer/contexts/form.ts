import * as React from "react";

interface FormContextInterface {
  setField: (ev: React.ChangeEvent<HTMLElement>) => void,
  saveField: (ev: React.ChangeEvent<HTMLElement>) => void,
}
const FormContext = React.createContext<FormContextInterface | null>(null);

export default FormContext;
