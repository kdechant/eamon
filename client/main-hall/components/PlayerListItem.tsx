import styled from "@emotion/styled";
import { useNavigate } from "react-router";
import type Player from "../models/player";
import { ucFirst } from "../utils";
import { getAxios } from "../utils/api";

const PlayerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20,
`;

const PlayerNameButton = styled.a`
  color: black;
  padding: 0;
  font-size: 24px;
  font-weight: bold;
  height: 28px;

  &:hover {
    text-decoration: underline !important;
  }
`;

const DeleteButton = styled.a`
  width: 32px;
  height: 32px;
  padding: 0;

  img {
    width: 32px;
    height: 32px;
    opacity: 0.5;
    filter: grayscale(50%);

    // Note: as of 2018-12-06 the hover wasn't working in Firefox
    &:hover {
      opacity: 1;
      filter: grayscale(0%);
    }
  }
`;

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
    if (confirm(`Are you sure you want to delete ${props.player.name}?`)) {
      window.localStorage.setItem("player_id", null);
      const uuid = window.localStorage.getItem("eamon_uuid");
      const axios = getAxios();
      axios
        .delete(`/players/${props.player.id}.json?uuid=${uuid}`)
        .then((res) => {
          props.loadPlayers();
        })
        .catch((err) => {
          console.error("Error deleting player!");
        });
    }
  };

  return (
    <PlayerCard className="col-sm-6 col-md-4">
      <div className="icon">
        <img src={icon_url} width="96" height="96" aria-hidden="true" alt="" />
      </div>
      <div className="name" style={{ flexGrow: 1 }}>
        <PlayerNameButton role="button" className="player_name" onClick={loadPlayer}>
          {props.player.name}
        </PlayerNameButton>
        <br />
        HD: {props.player.hardiness} AG: {props.player.agility} CH: {props.player.charisma} <br />
        {ucFirst(weapon_name)}
      </div>
      <div className="delete">
        <DeleteButton role="button" aria-label="Delete" onClick={() => deletePlayer()}>
          <img src="/static/images/ravenmore/128/x.png" title="delete" alt="delete" />
        </DeleteButton>
      </div>
    </PlayerCard>
  );
};

export default PlayerListItem;
