import { Link } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks";
import { savePlayer } from "../store/player";
import Status from "./Status";

const PlayerMenu: React.FC = () => {
  const player = useAppSelector((state) => state.player);
  const error = useAppSelector((state) => state.player.error);
  const dispatch = useAppDispatch();

  const exit = () => {
    dispatch(
      savePlayer(player, () => {
        window.localStorage.removeItem("player_id");
        window.location.href = "/main-hall";
      }),
    );
  };

  return (
    <div className="row">
      <div className="col-sm">
        <h2>Main Hall</h2>
        <p>You are in the main hall of the Guild of Free Adventurers. You can do the following:</p>
        <nav className="row icon-nav">
          <p className="col-6 col-lg-4">
            <Link to="/main-hall/adventure">
              <img src="/static/images/ravenmore/128/map.png" aria-hidden="true" alt="" />
              <br />
              Go on an adventure
            </Link>
          </p>
          <p className="col-6 col-lg-4">
            <Link to="/main-hall/shop">
              <img src="/static/images/ravenmore/128/axe2.png" aria-hidden="true" alt="" />
              <br />
              Visit the weapons shop
            </Link>
          </p>
          <p className="col-6 col-lg-4">
            <Link to="/main-hall/wizard">
              <img src="/static/images/ravenmore/128/tome.png" aria-hidden="true" alt="" />
              <br />
              Find a wizard to teach you some spells
            </Link>
          </p>
          <p className="col-6 col-lg-4">
            <Link to="/main-hall/witch">
              <img src="/static/images/ravenmore/128/potion.png" aria-hidden="true" alt="" />
              <br />
              Visit the witch to increase your attributes
            </Link>
          </p>
          <p className="col-6 col-lg-4">
            <Link to="/main-hall/bank">
              <img src="/static/images/ravenmore/128/coin.png" aria-hidden="true" alt="" />
              <br />
              Find the banker to deposit or withdraw some gold
            </Link>
          </p>
          <p className="col-6 col-lg-4">
            <button type="button" className="btn btn-link link" onClick={exit}>
              <img src="/static/images/ravenmore/128/x.png" aria-hidden="true" alt="" />
              <br />
              Temporarily leave the universe
            </button>
          </p>
        </nav>
        {error && <div className="warning">{error}</div>}
      </div>
      <div className="col-sm">
        <Status />
      </div>
    </div>
  );
};

export default PlayerMenu;
