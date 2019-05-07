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
        <h2><img src="/static/images/ravenmore/128/potion.png" alt="Potion" />The Witch's Shop</h2>
        <p>A lovely young woman dressed in black says, &quot;Good day, { this.props.player.name }! Ah, I see you're surprised I know your name? I also know that your Hardiness is { this.props.player.hardiness } your Agility
    is { this.props.player.agility }, and your Charisma is { this.props.player.charisma }.&quot;</p>
  <p>&quot;My magic potions can increase one of your attributes. My prices are:&quot;</p>
        <div className="spells-list">
          {this.state.attributes.map(attribute =>
            <AttributeRow key={attribute.name} {...this.props} attribute={attribute} />
          )}
        </div>
        <p>You have {this.props.player.gold} gold pieces.</p>
    
        <Link to="/main-hall/hall" className="btn btn-primary">Done</Link>
      </div>
    );

  }

}

export default Witch;
