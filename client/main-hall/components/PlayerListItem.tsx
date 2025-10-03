import { useNavigate } from "react-router-dom";
import type Player from "../models/player";
import { ucFirst } from "../utils";
import { getAxios } from "../utils/api";

interface PlayerListProps {
  player: Player;
  loadPlayers: () => void;
}

const PlayerListItem: React.FC<PlayerListProps> = (props) => {
  const navigate = useNavigate();

  const weapon_name = props.player.best_weapon ? props.player.best_weapon.name : "";
  const icon_url = "/static/images/ravenmore/128/" + props.player.icon + ".png";

  const loadPlayer = () => {
    window.localStorage.setItem("player_id", String(props.player.id));
    navigate("hall");
  };

  const deletePlayer = () => {
    if (confirm("Are you sure you want to delete " + props.player.name + "?")) {
      window.localStorage.setItem("player_id", null);
      const uuid = window.localStorage.getItem("eamon_uuid");
      const axios = getAxios();
      axios
        .delete("/players/" + props.player.id + ".json?uuid=" + uuid)
        .then((res) => {
          props.loadPlayers();
        })
        .catch((err) => {
          console.error("Error deleting player!");
        });
    }
  };

  return (
    <div className="player col-sm-6 col-md-4">
      <div className="icon">
        <img src={icon_url} width="96" height="96" aria-hidden="true" alt="" />
      </div>
      <div className="name">
        <button type="button" className="btn btn-link player_name" onClick={loadPlayer}>
          <strong>{props.player.name}</strong>
        </button>
        <br />
        HD: {props.player.hardiness} AG: {props.player.agility} CH: {props.player.charisma} <br />
        {ucFirst(weapon_name)}
      </div>
      <div className="delete">
        <button type="button" className="btn btn-link" aria-label="Delete" onClick={() => deletePlayer()}>
          <img src="/static/images/ravenmore/128/x.png" title="delete" alt="delete" />
        </button>
      </div>
    </div>
  );
};

export default PlayerListItem;
