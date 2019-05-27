import * as React from 'react';
import {Link} from 'react-router-dom';
import SpellListRow from "./SpellListRow";

class Wizard extends React.Component<any, any> {
  public state = {
    spells: [
      {
        'name': "blast",
        'description': "Damages one enemy. Can also be used to break open some doors and chests.",
        'price': 1000,
      },
      {
        'name': "heal",
        'description': "Heals you or a friend.",
        'price': 500
      },
      {
        'name': "power",
        'description': "Has an unpredictable effect which is different in every adventure. Common effects include teleportation, healing, causing earthquakes, or even resurrecting monsters.",
        'price': 100
      },
      {
        'name': "speed",
        'description': "Doubles your agility for a time, making you a better fighter.",
        'price': 4000
      },
    ],
  };

  public render() {

    if (!this.props.player) {
      return <p>Loading...</p>
    }

    return (
      <div className="wizard-shop">
        <h2><img src="/static/images/ravenmore/128/tome.png" alt="Spell book" />Hokas Tokas' School of Magick</h2>
        <p>After a few minutes of diligent searching, you find Hokas Tokas, the old Mage. He looks at you and says, &quot;So you want old Hokey to teach you some magic, eh? Well, it'll cost you. Here are the spells I teach. Which will it be?&quot;</p>
        <div className="spells-list">
          {this.state.spells.map(spell =>
            <SpellListRow key={spell.name} {...this.props} spell={spell} />
          )}
        </div>
        <p>You have {this.props.player.gold} gold pieces.</p>

        <Link to="/main-hall/hall" className="btn btn-primary">Done</Link>
      </div>
    );

  }

}

export default Wizard;
