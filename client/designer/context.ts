import * as React from "react";
import RoomRepository from "./repositories/room.repo";
import ArtifactRepository from "./repositories/artifact.repo";
import EffectRepository from "./repositories/effect.repo";
import MonsterRepository from "./repositories/monster.repo";
import HintRepository from "./repositories/hint.repo";

const AdventureContext = React.createContext({
  adventure: null,
  rooms: RoomRepository,
  artifacts: ArtifactRepository,
  effects: EffectRepository,
  monsters: MonsterRepository,
  hints: HintRepository,
});

export default AdventureContext;
