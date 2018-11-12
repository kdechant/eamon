import * as React from 'react';
import {Link} from 'react-router-dom';
import AttributeRow from "./AttributeRow";

class Witch extends React.Component<any, any> {
  public state = {
    attributes: [
      {
        name: 'hardiness',
        description: 'Hit points. Also determines how much you can carry.'
      },
      {
        name: 'agility',
        description: 'Increases your chance to hit, and makes you harder to hit.'
      },
      {
        name: 'charisma',
        description: 'Makes some monsters and NPCs more friendly.'
      }
    ]
  };

  public render() {

    if (!this.props.player) {
      return <p>Loading...</p>
    }

    return (
      <div className="witch-shop">
        <h2><img src="/static/images/ravenmore/128/potion.png" />The Witch's Shop</h2>
        <p>A lovely young woman dressed in black says, &quot;Good day, { this.props.player.name }! Ah, I see you're surprised I know your name? I also know that your Hardiness is { this.props.player.hardiness } your Agility
    is { this.props.player.agility }, and your Charisma is { this.props.player.charisma }.&quot;</p>
  <p>&quot;My magic potions can increase one of your attributes. My prices are:&quot;</p>
        <table className="table spells-list">
          <tr className="d-flex">
            <th className="col-sm-4 col-md-6 col-xl-8">Attribute</th>
            <th className="col-sm-3 col-md-2 col-xl-2 text-center">Current Ability</th>
            <th className="col-sm-3 col-md-2 col-xl-1 text-center">Price</th>
            <th className="col-sm-2 col-md-2 col-xl-1" />
          </tr>
          {this.state.attributes.map(attribute =>
            <AttributeRow key={attribute.name} {...this.props} attribute={attribute} />
          )}
        </table>
        <p>You have {this.props.player.gold} gold pieces.</p>
    
        <Link to="/main-hall/hall" className="btn btn-primary">Done</Link>
      </div>
    );

  }

}

export default Witch;
