import * as React from "react";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import update from 'immutability-helper';

import Adventure from "../models/adventure";
import RoomRepository from "../repositories/room.repo";
import ArtifactRepository from "../repositories/artifact.repo";
import EffectRepository from "../repositories/effect.repo";
import MonsterRepository from "../repositories/monster.repo";
import HintRepository from "../repositories/hint.repo";
import UserContext from "./user";

interface AdventureContextInterface {
  adventure: Adventure,
  rooms: RoomRepository,
  artifacts: ArtifactRepository,
  effects: EffectRepository,
  monsters: MonsterRepository,
  hints: HintRepository,
  setAdventureField: (field: string, value: string) => void,
  saveAdventureField: (field: string, value: string) => void,
  setRoomField: (id: number, field: string, value: string) => void,
  saveRoomField: (id: number, field: string, value: string) => void,
  setArtifactField: (id: number, field: string, value: string) => void,
  saveArtifactField: (id: number, field: string, value: string) => void,
  setEffectField: (id: number, field: string, value: string) => void,
  saveEffectField: (id: number, field: string, value: string) => void,
  setMonsterField: (id: number, field: string, value: string) => void,
  saveMonsterField: (id: number, field: string, value: string) => void,
}

interface AdventureContextProps {
  children?: React.ReactNode;
}

export const AdventureContext = React.createContext<AdventureContextInterface | null>(null);

export function AdventureContextProvider(props: AdventureContextProps): JSX.Element {
  const [state, setState] = useState(null);
  const [timeouts, setTimeouts] = useState({});
  const userContext = React.useContext(UserContext);
  const {slug} = useParams<{ slug: string }>();

  // get the adventure details from the API
  async function loadAdventureData(slug) {
    console.log('in loadAdventureData');
    const [adv_data, rooms_data, artifacts_data, effects_data, monsters_data, hints_data] = await Promise.all([
      fetch(`/api/designer/adventures/${slug}`).then(response => response.json()),
      fetch(`/api/designer/adventures/${slug}/rooms`).then(response => response.json()),
      fetch(`/api/designer/adventures/${slug}/artifacts`).then(response => response.json()),
      fetch(`/api/designer/adventures/${slug}/effects`).then(response => response.json()),
      fetch(`/api/designer/adventures/${slug}/monsters`).then(response => response.json()),
      fetch(`/api/designer/adventures/${slug}/hints`).then(response => response.json()),
    ]);
    const adventure = new Adventure();
    adventure.init(adv_data);
    adventure.authors_display = "";
    if (adventure.authors) {
      adventure.authors_display = adventure.authors.join(' and ');
    }
    setState(() => ({
      adventure: adventure,
      rooms: new RoomRepository(rooms_data),
      artifacts: new ArtifactRepository(artifacts_data),
      effects: new EffectRepository(effects_data),
      monsters: new MonsterRepository(monsters_data),
      hints: new HintRepository(hints_data),
    }));
  }

  async function saveAdventureField(field: string, value: string): Promise<void> {
    const body: Record<string, string | number> = {};
    body[field] = value;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    const token = await userContext.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    fetch(`/api/designer/adventures/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: headers
    }).then(response => response.json()).then(data => {
      if (data[field] !== value) {
        const adventure = state.adventure;
        const new_adv = update(adventure, {
          [field]: {$set: value}
        });
        setState(() => update(state, {
          adventure: {$set: new_adv}
        }));
      }
    });
  }

  function setAdventureField(field: string, value: string) {
    const adventure = state.adventure;
    const new_adv = update(adventure, {
      [field]: {$set: value}
    });
    setState(update(state, {
      adventure: {$set: new_adv}
    }));
    const timeout_name = `adv-${field}`;
    if (timeouts[timeout_name]) {
      clearTimeout(timeouts[timeout_name]);
    }
    const timeout_id = setTimeout(() => saveAdventureField(field, value), 2000);
    setTimeouts(() => update(timeouts, {
      [timeout_name]: {$set: timeout_id}
    }));
  }

  async function saveRoomField(id: number, field: string, value: string): Promise<void> {
    const body: Record<string, string | number> = {};
    body[field] = value;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    const token = await userContext.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    fetch(`/api/designer/adventures/${slug}/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: headers
    }).then(response => response.json()).then(data => {
      setRoomField(id, field, data[field]);
    });
  }

  /**
   * Set room data in the state
   * @param id
   * @param field
   * @param value
   */
  function setRoomField(id: number, field: string, value: string) {
    const room = state.rooms.get(id);
    if (room[field] === value) return;
    const new_r = update(room, {[field]: {$set: value}});
    const idx = state.rooms.getIndex(id);
    const new_repo = update(state.rooms, {'all': {[idx]: {$set: new_r}}});
    setState(() => update(state, {rooms: {$set: new_repo}}));
  }

  async function saveArtifactField(id: number, field: string, value: string): Promise<void> {
    const body: Record<string, string | number> = {};
    body[field] = value;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    const token = await userContext.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    fetch(`/api/designer/adventures/${slug}/artifacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: headers
    }).then(response => response.json()).then(data => {
      setArtifactField(id, field, data[field]);
    });
  }

  /**
   * Set artifact data in the state
   * @param id
   * @param field
   * @param value
   */
  function setArtifactField(id: number, field: string, value: string) {
    const art = state.artifacts.get(id);
    const new_a = update(art, {[field]: {$set: value}});
    const idx = state.artifacts.getIndex(id);
    const new_repo = update(state.artifacts, {'all': {[idx]: {$set: new_a}}});
    setState(() => update(state, {artifacts: {$set: new_repo}}));
  }

  async function saveEffectField(id: number, field: string, value: string): Promise<void> {
    const body: Record<string, string | number> = {};
    body[field] = value;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    const token = await userContext.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    fetch(`/api/designer/adventures/${slug}/effects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: headers
    }).then(response => response.json()).then(data => {
      setEffectField(id, field, data[field]);
    });
  }

  function setEffectField(id: number, field: string, value: string) {
    const eff = state.effects.get(id);
    const new_a = update(eff, {[field]: {$set: value}});
    const idx = state.effects.getIndex(id);
    const new_repo = update(state.effects, {'all': {[idx]: {$set: new_a}}});
    setState(() => update(state, {effects: {$set: new_repo}}));
  }

  async function saveMonsterField(id: number, field: string, value: string): Promise<void> {
    const body: Record<string, string | number> = {};
    body[field] = value;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    const token = await userContext.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    fetch(`/api/designer/adventures/${slug}/monsters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: headers
    }).then(response => response.json()).then(data => {
      setMonsterField(id, field, data[field]);
    });
  }

  function setMonsterField(id: number, field: string, value: string) {
    const art = state.monsters.get(id);
    const new_a = update(art, {[field]: {$set: value}});
    const idx = state.monsters.getIndex(id);
    const new_repo = update(state.monsters, {'all': {[idx]: {$set: new_a}}});
    setState(() => update(state, {monsters: {$set: new_repo}}));
  }

  const context_value = {
    ...state,
    setAdventureField,
    saveAdventureField,
    setRoomField,
    saveRoomField,
    setArtifactField,
    saveArtifactField,
    setEffectField,
    saveEffectField,
    setMonsterField,
    saveMonsterField,
  };

  useEffect(() => {
    console.log('LOADING DATA')
    loadAdventureData(slug);
  }, [slug]);

  return (
    <AdventureContext.Provider value={context_value}>
      {props.children}
    </AdventureContext.Provider>
  )
}

export default AdventureContext;
