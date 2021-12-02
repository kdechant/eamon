import * as React from 'react';
import {Route, Routes} from "react-router";

import PlayerMenu from "./PlayerMenu";
import AdventureList from "./AdventureList";
import Bank from "./Bank";
import Shop from "./Shop/Shop";
import Witch from "./Witch/Witch";
import Wizard from "./Wizard/Wizard";
import SavedGameTile from "./SavedGameTile";
import {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../hooks";
import { loadPlayer } from '../store/player';

const PlayerDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  useEffect(() => {
    dispatch(loadPlayer());
  }, [dispatch]);

  if (!player.id) {
    return <p>Loading...</p>;
  }

  if (player.saved_games?.length > 0) {
    return (
    <div className="container-fluid" id="SavedGameList">
      <div className="row">
        <div className="col-sm">
          <h2>Continue Your Adventures</h2>
          <p>Welcome back, {player.name}! It looks like you were on an adventure the last time we saw you.
            Choose a saved game to restore:</p>
          <div className="container-fluid">
            <div className="row">
              {player.saved_games.map((sv, index) =>
                <SavedGameTile key={index} savedGame={sv} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="container-fluid" id="PlayerDetail">
      <Routes>
        <Route path="hall" element={<PlayerMenu />}/>
        <Route path="adventure" element={<AdventureList />}/>
        <Route path="bank/*" element={<Bank />}/>
        <Route path="shop/*" element={<Shop />}/>
        <Route path="wizard" element={<Wizard />}/>
        <Route path="witch" element={<Witch />}/>
      </Routes>
    </div>
  );
}

export default PlayerDetail;
