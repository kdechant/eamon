import { useEffect } from "react";
import { Route, Routes } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks";
import { loadPlayer } from "../store/player";
import AdventureList from "./AdventureList";
import Bank from "./Bank";
import PlayerMenu from "./PlayerMenu";
import SavedGameTile from "./SavedGameTile";
import Shop from "./Shop/Shop";
import Witch from "./Witch/Witch";
import Wizard from "./Wizard/Wizard";

const PlayerDetail = () => {
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
      <div className="container-fluid SavedGameList">
        <div className="row">
          <div className="col-sm">
            <h2>Continue Your Adventures</h2>
            <p>
              Welcome back, {player.name}! It looks like you were on an adventure the last time we saw you. Choose a
              saved game to restore:
            </p>
            <div className="container-fluid">
              <div className="row">
                {player.saved_games.map((sv) => (
                  <SavedGameTile key={sv.id} savedGame={sv} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid PlayerDetail">
      <Routes>
        <Route path="hall" element={<PlayerMenu />} />
        <Route path="adventure" element={<AdventureList />} />
        <Route path="bank/*" element={<Bank />} />
        <Route path="shop/*" element={<Shop />} />
        <Route path="wizard" element={<Wizard />} />
        <Route path="witch" element={<Witch />} />
      </Routes>
    </div>
  );
};

export default PlayerDetail;
