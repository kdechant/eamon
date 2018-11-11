import * as React from 'react';
import {Link, Route} from "react-router-dom";
import ArtifactTile from "./ArtifactTile";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

// the shop inventory is kept outside the component, so it will persist
// if the player leaves the shop and comes back.
import { weapons, armors } from "../utils/shopItems";

class Shop extends React.Component<any, any> {

  public constructor(props) {
    super(props);
    this.state = {weapons, armors};
  }

  public render() {

    if (!this.props.player) {
      return (
        <p>Loading...</p>
      )
    }

    return (
      <div className="shop">
        <h2><img src="/static/images/ravenmore/128/axe2.png" />Marcos Cavielli's Weapons and Armour Shoppe</h2>

        <Route path="/main-hall/shop" exact={true} render={(props) => (
          <div className="shop-home">
            <p>As you enter the weapon shop, Marcos Cavielli (the owner) comes from out of the back room and says, &quot;Well, as I live and breathe, if it isn't my old pal, {this.props.player.name}!&quot;</p>
            <p>So, what do you need?</p>
            <Link to="/main-hall/shop/buy" className="btn btn-primary mr-2">Buy weapons and armor</Link>
            <Link to="/main-hall/shop/sell" className="btn btn-primary mr-2">Sell weapons and armor</Link>
            <Link to="/main-hall/hall" className="btn btn-primary">Go back to Main Hall</Link>
          </div>
        )} />

        <Route path="/main-hall/shop/buy" render={(props) => (
          <div className="shop-buy">
            <p>I just happen to have the following weapons and armor in stock:</p>
            <p>You have {this.props.player.gold} gold pieces.</p>
            <p className="heading">Weapons:</p>
            <div className="container-fluid">
              <div className="row">{this.state.weapons.map(artifact =>
                <ArtifactTile key={artifact.uuid} player={this.props.player} setPlayerState={this.props.setPlayerState} artifact={artifact} action="buy" />
              )}
              </div>
            </div>
            <p className="heading">Armor and Shields:</p>
            <div className="container-fluid">
              <div className="row">{this.state.armors.map(artifact =>
                <ArtifactTile key={artifact.uuid} player={this.props.player} setPlayerState={this.props.setPlayerState} artifact={artifact} action="buy" />
              )}
              </div>
            </div>
            <Link to="/main-hall/shop" className="btn btn-primary">Done</Link>
          </div>
        )} />

        <Route path="/main-hall/shop/sell" render={(props) => (
          <div className="shop-sell">
            <p>What do you want to sell?</p>
            <p>You have {this.props.player.gold} gold pieces.</p>
            <div className="container-fluid">
              <TransitionGroup className="row">
                {this.props.player.inventory.map(artifact =>
                  <CSSTransition key={artifact.uuid} timeout={500} classNames="fade">
                    <ArtifactTile player={this.props.player} setPlayerState={this.props.setPlayerState} artifact={artifact} action="sell" />
                  </CSSTransition>
                )}
              </TransitionGroup>
            </div>

            <Link to="/main-hall/shop" className="btn btn-primary">Done</Link>
          </div>
        )} />

      </div>
    );
  }

}

export default Shop;
