import * as React from "react";
import {Route, Routes} from "react-router-dom";
import {AdventureContextProvider} from "../contexts/adventure";
import AdventureDetail from "./AdventureDetail";
import AdventureHeading from "./AdventureHeading";
import ArtifactList from "./ArtifactList";
import ArtifactDetail from "./ArtifactDetail";
import EffectList from "./EffectList";
import EffectDetail from "./EffectDetail";
import MonsterList from "./MonsterList";
import MonsterDetail from "./MonsterDetail";
import RoomList from "./RoomList";
import RoomDetail from "./RoomDetail";


function AdventureMainMenu(): JSX.Element {
  return (
    <AdventureContextProvider>
      <div className="container-fluid" id="AdventureDetail">

        <AdventureHeading/>

        <Routes>
          <Route path=':slug' element={<AdventureDetail/>}/>

          <Route path=':slug/rooms' element={<RoomList/>}/>
          <Route path=':slug/rooms/:id' element={<RoomDetail/>}/>

          <Route path=':slug/artifacts' element={<ArtifactList/>}/>
          <Route path=':slug/artifacts/:id' element={<ArtifactDetail/>}/>

          <Route path=':slug/effects' element={<EffectList/>}/>
          <Route path=':slug/effects/:id' element={<EffectDetail/>}/>

          <Route path=':slug/monsters' element={<MonsterList/>}/>
          <Route path=':slug/monsters/:id' element={<MonsterDetail/>}/>
        </Routes>
      </div>
    </AdventureContextProvider>
  );
}

export default AdventureMainMenu;
