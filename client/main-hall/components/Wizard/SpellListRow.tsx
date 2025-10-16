import styled from "@emotion/styled";
import { useState } from "react";
import { useTransitionState } from "react-transition-state";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { playerActions } from "../../store/player";
import { percentOrNone, titleCase } from "../../utils";
import diceRoll from "../../utils/dice";

type Spell = {
  name: string;
  description: string;
  price: number;
};

type SpellListProps = {
  spell: Spell;
};

const animationTime = 300;

const MessageBox = styled.div`
  transition: all ${animationTime}ms ease-in;
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translate(0, -50%);

  &.animating {
    opacity: 0;
  }
`;

const Message = styled.div`
  height: 36px;
  min-width: 64px;
  border-radius: 18px;
`;

const SpellListRow = (props: SpellListProps) => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  const [message, setMessage] = useState("");

  const [{ status, isMounted }, toggle] = useTransitionState({
    timeout: animationTime,
    mountOnEnter: true,
    unmountOnExit: true,
    preEnter: true,
  });

  const buy = (spell: Spell) => {
    const original_ability = player[`spl_${spell.name}`];
    const possible_increase = 100 - original_ability;
    const actual_increase = Math.floor(possible_increase / 4 + diceRoll(1, possible_increase / 2));
    dispatch(playerActions.changeSpellAbility({ spellName: spell.name, amount: actual_increase }));
    dispatch(playerActions.changeStat({ name: "gold", amount: -spell.price }));

    setTimeout(() => {
      toggle(false);
    }, 2000);
    setMessage(original_ability === 0 ? "Learned" : `+${actual_increase}%`);
    toggle(true);
  };

  let button = (
    <button type="button" className="btn bnt-light disabled align-middle">
      Not enough gold
    </button>
  );
  if (player.gold >= props.spell.price) {
    if (player[`spl_${props.spell.name}`] > 90) {
      button = (
        <button type="button" className="btn bnt-light disabled align-middle">
          Maxed Out!
        </button>
      );
    } else {
      button = (
        <button
          type="button"
          className="btn btn-primary align-middle"
          style={{ minWidth: 100 }}
          onClick={() => buy(props.spell)}
        >
          {player[`spl_${props.spell.name}`] > 0 ? "Upgrade" : "Learn"}
        </button>
      );
    }
  }

  return (
    <div className="spell-list-row row h-100 align-items-center" key={props.spell.name}>
      <div className="col-12 col-md-5 mb-2">
        <h3>{titleCase(props.spell.name)}</h3>
        <span className="small">{props.spell.description}</span>
      </div>
      <div className="col-4 col-md-3 position-relative">
        Current Ability: {percentOrNone(player[`spl_${props.spell.name}`])}
        {isMounted && (
          <MessageBox className={`message ${status === "preEnter" || status === "exiting" ? "animating" : ""}`}>
            <Message className="message-inner">{message}</Message>
          </MessageBox>
        )}
      </div>
      <div className="col-4 col-md-2 text-center">
        <img src="/static/images/ravenmore/128/coin.png" alt="Gold coin" className="icon-md" /> {props.spell.price}
      </div>
      <div className="col-4 col-md-2 text-end">{button}</div>
    </div>
  );
};

export default SpellListRow;
