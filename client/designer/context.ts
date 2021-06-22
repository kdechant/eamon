import * as React from "react";

const AdventureContext = React.createContext({
  adventure: null,
  rooms: [],
  artifacts: [],
  effects: [],
  monsters: [],
  hints: [],
});

export default AdventureContext;
