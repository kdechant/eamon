import * as React from "react";
import {Route} from "react-router";
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

        <Route exact path='/designer/:slug' render={() => (
          <AdventureDetail/>
        )}/>

        <Route exact path='/designer/:slug/rooms' render={() => (
          <RoomList/>
        )}/>
        <Route path='/designer/:slug/rooms/:id' render={() => (
          <RoomDetail/>
        )}/>

        <Route exact path='/designer/:slug/artifacts' render={() => (
          <ArtifactList/>
        )}/>
        <Route path='/designer/:slug/artifacts/:id' render={() => (
          <ArtifactDetail/>
        )}/>

        <Route exact path='/designer/:slug/effects' render={() => (
          <EffectList/>
        )}/>
        <Route path='/designer/:slug/effects/:id' render={() => (
          <EffectDetail/>
        )}/>

        <Route exact path='/designer/:slug/monsters' render={() => (
          <MonsterList/>
        )}/>
        <Route path='/designer/:slug/monsters/:id' render={() => (
          <MonsterDetail/>
        )}/>
      </div>
    </AdventureContextProvider>
  );
}

export default AdventureMainMenu;
