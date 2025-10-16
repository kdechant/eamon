import { useState } from "react";
import { Link, Route, Routes } from "react-router";
import { useAppSelector } from "../../hooks";
import { ARTIFACT_TYPES } from "../../models/artifact";
import ArtifactTile from "./ArtifactTile";

// the shop inventory is kept outside the component, so it will persist
// if the player leaves the shop and comes back.
import { armors as baseArmors, weapons as baseWeapons } from "./shopItems";

const Shop = () => {
  const player = useAppSelector((state) => state.player);

  const [weapons, setWeapons] = useState(baseWeapons);
  const [armors] = useState(baseArmors);

  const removeItem = (artifact) => {
    if (artifact.type === ARTIFACT_TYPES.WEAPON) {
      return; // infinite supply of non-magic weapons
    }
    const index = weapons.indexOf(artifact);
    if (index > -1) {
      const newWpns = [...weapons];
      newWpns.splice(index, 1);
      setWeapons(newWpns);
    }
  };

  if (!player) {
    return <p>Loading...</p>;
  }

  return (
    <div className="shop">
      <h2>
        <img src="/static/images/ravenmore/128/axe2.png" alt="Battle axe" />
        Marcos Cavielli's Weapons and Armour Shoppe
      </h2>

      <Routes>
        <Route
          path=""
          element={
            <div className="shop-home">
              <p>
                As you enter the weapon shop, Marcos Cavielli (the owner) comes from out of the back room and says,
                &quot;Well, as I live and breathe, if it isn't my old pal, {player.name}!&quot;
              </p>
              <p>So, what do you need?</p>
              <Link to="/main-hall/shop/buy" className="btn btn-primary">
                Buy weapons and armor
              </Link>
              <Link to="/main-hall/shop/sell" className="btn btn-primary">
                Sell weapons and armor
              </Link>
              <Link to="/main-hall/hall" className="btn btn-primary">
                Go back to Main Hall
              </Link>
            </div>
          }
        />

        <Route
          path="buy"
          element={
            <div className="shop-buy">
              <p>I just happen to have the following weapons and armor in stock:</p>
              <p>
                You have <span data-qa="goldAmount">{player.gold}</span> gold pieces.
              </p>
              <p className="heading">Weapons:</p>
              <div className="container-fluid weapons row">
                {weapons.map((artifact) => (
                  <ArtifactTile key={artifact.uuid} artifact={artifact} removeItem={removeItem} action="buy" />
                ))}
              </div>
              <p className="heading">Armor and Shields:</p>
              <div className="container-fluid armor">
                <div className="row">
                  {armors.map((artifact) => (
                    <ArtifactTile key={artifact.uuid} artifact={artifact} action="buy" />
                  ))}
                </div>
              </div>
              <Link to="/main-hall/shop" className="btn btn-primary">
                Done
              </Link>
            </div>
          }
        />

        <Route
          path="sell"
          element={
            <div className="shop-sell">
              <p>What do you want to sell?</p>
              <p>
                You have <span data-qa="goldAmount">{player.gold}</span> gold pieces.
              </p>
              <div className="container-fluid row">
                {player.inventory.map((artifact) => (
                  <ArtifactTile key={artifact.uuid} artifact={artifact} action="sell" />
                ))}
              </div>

              <Link to="/main-hall/shop" className="btn btn-primary">
                Done
              </Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default Shop;
