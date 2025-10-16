import { usePlayer } from "../hooks";
import { getIcon, getTypeName, isArmor, isWeapon } from "../models/artifact";
import { ucFirst } from "../utils";

const Status = () => {
  const { player, genderLabel } = usePlayer();

  if (!player) {
    return <p>Loading...</p>;
  }

  // sort artifacts by type - weapons first, then armor
  const weapons = player.inventory.filter((item) => isWeapon(item));
  const armors = player.inventory.filter((item) => isArmor(item));
  const artifacts = weapons.concat(armors);

  const total_weight = player.inventory.reduce((acc, cur) => acc + cur.weight, 0);

  return (
    <div>
      <div className="status-widget player">
        <div className="container">
          <div className="row">
            <h3 className="heading">
              You are the {genderLabel} {player.name}
            </h3>
          </div>

          <div className="stats row">
            <div className="col-3 hardiness">HD: {player.hardiness}</div>
            <div className="col-3 agility">AG: {player.agility}</div>
            <div className="col-3 charisma">CH: {player.charisma}</div>
          </div>

          <div className="weapon-abilities row">
            <div className="axe col-md">
              Axe:
              <br />
              {player.wpn_axe}%
            </div>
            <div className="bow col-md">
              Bow:
              <br />
              {player.wpn_bow}%
            </div>
            <div className="club col-md">
              Club:
              <br />
              {player.wpn_club}%
            </div>
            <div className="spear col-md">
              Spear:
              <br />
              {player.wpn_spear}%
            </div>
            <div className="sword col-md">
              Sword:
              <br />
              {player.wpn_sword}%
            </div>
          </div>

          <div className="spell-abilities row">
            <div className="col-6 col-md">
              Blast:
              <br />
              {player.spl_blast}%
            </div>
            <div className="col-6 col-md">
              Heal:
              <br />
              {player.spl_heal}%
            </div>
            <div className="col-6 col-md">
              Power:
              <br />
              {player.spl_power}%
            </div>
            <div className="col-6 col-md">
              Speed:
              <br />
              {player.spl_speed}%
            </div>
          </div>

          <div className="ae row">
            <div className="col-sm-12">Armor expertise: {player.armor_expertise}%</div>
          </div>

          <div className="gold row">
            <div className="col-sm">Gold in hand: {player.gold}</div>
            <div className="col-sm">Gold in bank: {player.gold_in_bank}</div>
          </div>
        </div>
      </div>

      <div className="status-widget inventory">
        <h3 className="heading">Inventory</h3>

        <div className="container">
          {artifacts.length === 0 && <div className="row">No items</div>}

          {artifacts.map((artifact) => {
            const icon_url = "/static/images/ravenmore/128/" + getIcon(artifact) + ".png";

            if (isWeapon(artifact)) {
              const odds = (artifact.weapon_odds > 0 ? "+" : "") + artifact.weapon_odds;
              return (
                <div key={artifact.uuid} className="row">
                  <div className="icon col-3 col-sm-2 px-0 px-sm-2">
                    <img src={icon_url} width="48" height="48" alt={getTypeName(artifact)} />
                  </div>
                  <div className="col-9 col-sm-9 px-0 px-sm-2">
                    <span className="artifact-name">{ucFirst(artifact.name)}</span>
                    <br />
                    <span className="artifact-info me-4">
                      {artifact.dice}d{artifact.sides}
                    </span>
                    {artifact.weapon_odds !== 0 && <span className="artifact-info me-4">{odds}% to hit</span>}
                    <span className="artifact-info me-4">Weight: {artifact.weight}</span>
                  </div>
                </div>
              );
            }

            // otherwise, it's armor
            const adjustedPenalty = Math.max(0, artifact.armor_penalty - player.armor_expertise);
            return (
              <div key={artifact.uuid} className="row">
                <div className="icon col-3 col-sm-2 px-0 px-sm-2">
                  <img src={icon_url} width="48" height="48" alt={getTypeName(artifact)} />
                </div>
                <div className="col-9 col-sm-10 px-0 px-sm-2">
                  <span className="artifact-name">{ucFirst(artifact.name)}</span>
                  <br />
                  <span className="artifact-info me-4">AC: {artifact.armor_class}</span>
                  {player.armor_expertise === 0 && (
                    <span className="artifact-info me-4">Penalty: {artifact.armor_penalty}%</span>
                  )}
                  {player.armor_expertise > 0 && (
                    <span className="artifact-info me-4">
                      Penalty: <span style={{ textDecoration: "line-through" }}>{artifact.armor_penalty}%</span>{" "}
                      {adjustedPenalty}%
                    </span>
                  )}
                  <span className="artifact-info me-4">Weight: {artifact.weight}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div>Total Weight: {total_weight}</div>
      </div>
    </div>
  );
};

export default Status;
