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
}

const AdventureContext = React.createContext<AdventureContextInterface | null>(null);

export default AdventureContext;
