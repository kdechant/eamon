import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Player, {updateCachedInfo} from "../models/player";
import Artifact from "../models/artifact";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import {getHeaders} from "../utils/api";

const initialState = {} as Player;

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayer(state, action: PayloadAction<Player>) {
      const player = action.payload;
      player.inventory.forEach(item => item.uuid = uuidv4());
      updateCachedInfo(player);
      // Replacing state object with a new object breaks the app, so we use
      // Object.assign to update all its properties.
      Object.assign(state, player);
    },
    changeStat(player, action: PayloadAction<{name: string, amount: number}>) {
      // can be used for attributes, gold, etc.
      player[action.payload.name] += action.payload.amount;
    },
    changeSpellAbility(player, action: PayloadAction<{spellName: string, amount: number}>) {
      player['spl_' + action.payload.spellName] += action.payload.amount;
    },
    deposit(player, action: PayloadAction<number>) {
      player.gold -= action.payload;
      player.gold_in_bank += action.payload;
    },
    withdraw(player, action: PayloadAction<number>) {
      player.gold += action.payload;
      player.gold_in_bank -= action.payload;
    },
    buyArtifact(player, action: PayloadAction<Artifact>) {
      player.inventory.push(action.payload);
      player.gold -= action.payload.value;
    },
    sellArtifact(player, action: PayloadAction<Artifact>) {
      const index = player.inventory.indexOf(action.payload);
      if (index > -1) {
        player.inventory.splice(index, 1);
      }
      player.gold += action.payload.value;
    },
    deleteSavedGame(player, action: PayloadAction<number>) {
      player.saved_games = player.saved_games.filter(sv => sv.id !== action.payload);
    },
  },
});

export const loadPlayer = () => {
  return async (dispatch) => {
    const uuid = window.localStorage.getItem('eamon_uuid');
    const player_id = window.localStorage.getItem('player_id');
    const response = await axios.get(`/api/players/${player_id}.json?uuid=${uuid}`)

    if (response.status !== 200) {
      throw new Error("Failed to load player data");
    }

    dispatch(playerActions.setPlayer(response.data));
  }
}

export const savePlayer = (player: Player, callback) => {
  return async () => {
    // Note: Logging is not done here. Main Hall logging (player creation, enter hall, exit hall)
    // is handled in Django.
    const uuid = window.localStorage.getItem('eamon_uuid');
    const response = await axios.put(`/api/players/${player.id}.json?uuid=${uuid}`,
      player, {headers: getHeaders()});

    console.log('savePlayer response', response);

    if (response.status !== 200) {
      // TODO: set error in redux
      throw new Error("Failed to save player data");
    }

    callback();
  }
}


export const playerActions = playerSlice.actions;

export default playerSlice.reducer;
