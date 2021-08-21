import * as React from "react";
import Adventure from "./models/Adventure";
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
}

const AdventureContext = React.createContext<AdventureContextInterface | null>(null);

export default AdventureContext;

interface UserContextInterface {
  username: string,
  token: string,
  changeUserState: (username: string, token: string, refresh_token: string) => void,
  getToken: () => Promise<string>,
}
export const UserContext = React.createContext<UserContextInterface | null>(null);

