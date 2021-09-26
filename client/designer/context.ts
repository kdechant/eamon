import * as React from "react";
import Adventure from "./models/adventure";
import RoomRepository from "./repositories/room.repo";
import ArtifactRepository from "./repositories/artifact.repo";
import EffectRepository from "./repositories/effect.repo";
import MonsterRepository from "./repositories/monster.repo";
import HintRepository from "./repositories/hint.repo";

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
  setMonsterField: (id: number, field: string, value: string) => void,
  saveMonsterField: (id: number, field: string, value: string) => void,
}

export const AdventureContext = React.createContext<AdventureContextInterface | null>(null);

interface UserContextInterface {
  username: string,
  token: string,
  changeUserState: (username: string, token: string, refresh_token: string) => void,
  getToken: () => Promise<string>,
}
export const UserContext = React.createContext<UserContextInterface | null>(null);

interface FormContextInterface {
  setField: (ev: any) => void,
  saveField: (ev: any) => void,
}
export const FormContext = React.createContext<FormContextInterface | null>(null);


