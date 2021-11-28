import * as React from 'react';
import { CSSTransition } from 'react-transition-group';
import { titleCase, percentOrNone } from "../../utils";
import diceRoll from "../../utils/dice";
import {useAppDispatch, useAppSelector} from "../../hooks";
import {useState} from "react";
import {playerActions} from "../../store/player";

type Spell = {
  name: string,
  description: string,
  price: number,
}

type SpellListProps = {
  spell: Spell,
}

const SpellListRow: React.FC<SpellListProps> = (props) => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  const [message, setMessage] = useState('');
  const [messageVisible, setMessageVisible] = useState(false);

  const buy = (spell: Spell) => {
    const original_ability = player.spell_abilities_original[spell.name];
    const possible_increase = 100 - original_ability;
    const actual_increase = Math.floor(
      possible_increase / 4 + diceRoll(1, possible_increase / 2));
    dispatch(playerActions.changeSpellAbility({ spellName: spell.name, amount: actual_increase }));
    dispatch(playerActions.changeStat({ name: 'gold', amount: - spell.price }));

    setTimeout(() => {
      setMessageVisible(false);
    }, 2000);
    setMessage(original_ability === 0 ? "Learned" : "Increased!");
    setMessageVisible(true);
  };

  let button = <button className="btn bnt-light disabled align-middle">Not enough gold</button>;
  if (player.gold >= props.spell.price) {
    if (player.spell_abilities_original[props.spell.name] > 90) {
      button = <button className="btn bnt-light disabled align-middle">Maxed Out!</button>;
    } else {
      button = <button className="btn btn-primary align-middle" onClick={() => buy(props.spell)}>
        {player.spell_abilities_original[props.spell.name] > 0 ? "Upgrade" : "Learn"}
      </button>
    }
  }

  return (
    <div className="spell-list-row row h-100" key={props.spell.name}>
      <div className="col-12 col-sm-4 col-md-6 mb-2">
        <h3>{ titleCase(props.spell.name) }</h3>
        <span className="small">{ props.spell.description }</span>
      </div>
      <div className="col-4 col-sm-3 col-md-2 text-center my-auto">
        Current Ability: { percentOrNone(player.spell_abilities_original[props.spell.name]) }
        <CSSTransition
          in={messageVisible}
          timeout={500}
          classNames={"message"}
          unmountOnExit={true}
        >
          {animationState => <div className="message-inner">{message}</div>}
        </CSSTransition>
        </div>
      <div className="col-4 col-sm-3 col-md-2 text-center my-auto">
        <img src="/static/images/ravenmore/128/coin.png" alt="Gold coin" className="icon-md" /> { props.spell.price }
      </div>
      <div className="col-4 col-sm-2 col-md-2 text-center my-auto">
        {button}
      </div>
    </div>
  )

}

export default SpellListRow;
