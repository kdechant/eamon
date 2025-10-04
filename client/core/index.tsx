// polyfills for IE 11
import "core-js/stable";

import * as React from "react";
import * as ReactDOM from "react-dom";
import MainProgram from "./components/MainProgram";

// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<MainProgram />, document.getElementById("root") as HTMLElement);
// registerServiceWorker();
