import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Player from "../models/player";
import Artifact from "../models/artifact";
import { v4 as uuidv4 } from 'uuid';

const initialState = {} as Player;

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayer(state, action: PayloadAction<Player>) {
      console.log('setting player store', action.payload);
      Object.assign(state, action.payload);

      // spell_abilities_original is the variable name expected by the API, because that's what the dungeon returns
      state.spell_abilities_original = {
        "blast": action.payload.spl_blast,
        "heal": action.payload.spl_heal,
        "power": action.payload.spl_power,
        "speed": action.payload.spl_speed
      };
      state.inventory.forEach(item => item.uuid = uuidv4());
    },
    changeStat(player, action: PayloadAction<{name: string, amount: number}>) {
      // can be used for attributes, gold, etc.
      player[action.payload.name] += action.payload.amount;
    },
    changeSpellAbility(player, action: PayloadAction<{spellName: string, amount: number}>) {
      player['spl_' + action.payload.spellName] += action.payload.amount;
      player.spell_abilities_original[action.payload.spellName] += action.payload.amount;
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

export const playerActions = playerSlice.actions;

export default playerSlice.reducer;
