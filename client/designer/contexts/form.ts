import * as React from "react";

interface FormContextInterface {
  setField: (ev: Event) => void,
  saveField: (ev: Event) => void,
}
const FormContext = React.createContext<FormContextInterface | null>(null);

export default FormContext;
