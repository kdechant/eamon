import * as React from 'react';
import {render, RenderResult} from '@testing-library/react'
import {Router, Route, Routes} from "react-router-dom";
import { createMemoryHistory } from "history";

import AdventureContext from "./contexts/adventure";
import RoomRepository from "./repositories/room.repo";
import ArtifactRepository from "./repositories/artifact.repo";
import EffectRepository from "./repositories/effect.repo";
import MonsterRepository from "./repositories/monster.repo";
import HintRepository from "./repositories/hint.repo";

const data = {
  adventure: null,
  rooms: new RoomRepository([{
    'id': 1,
    'name': 'Entrance',
    'exits': []
  }, {
    'id': 2,
    'name': 'Tunnel',
    'exits': []
  }]),
  artifacts: new ArtifactRepository([{
    'id': 1,
    'name': 'Chest'
  }, {
    'id': 2,
    'name': 'Magic Sword'
  }]),
  effects: new EffectRepository([{
    'id': 1,
    'text': 'blah blah blah'
  },]),
  monsters: new MonsterRepository([{
    'id': 1,
    'name': 'Guard'
  }, {
    'id': 2,
    'name': 'Orc'
  }]),
  hints: new HintRepository([]),
  setAdventureField: () => null,
  saveAdventureField: () => null,
  setRoomField: () => null,
  saveRoomField: () => null,
  setRoomExitField: () => null,
  saveRoomExitField: () => null,
  setArtifactField: () => null,
  saveArtifactField: () => null,
  setEffectField: () => null,
  saveEffectField: () => null,
  setMonsterField: () => null,
  saveMonsterField: () => null,
};

const AllTheProviders = ({children}) => {
  const history = createMemoryHistory({ initialEntries: ["/test-adv"] });
  return (
    <Router location={history.location} navigator={history}>
      <Routes>
        <Route path=":slug" element={
          <AdventureContext.Provider value={data}>
            {children}
          </AdventureContext.Provider>
        }/>
      </Routes>
    </Router>
  )
}

const customRender = (ui: JSX.Element, options: Record<string, string | number>): RenderResult =>
  render(ui, {wrapper: AllTheProviders, ...options})

// re-export everything
export * from '@testing-library/react'

// override render method
export {customRender as render}
