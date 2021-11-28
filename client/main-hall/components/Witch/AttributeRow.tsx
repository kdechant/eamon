import * as React from 'react';
import {useState} from "react";
import { CSSTransition } from 'react-transition-group';
import { titleCase } from "../../utils";
import {useAppDispatch, useAppSelector} from "../../hooks";
import {playerActions} from "../../store/player";

type AttributeRowProps = {
  attribute: {
    name: string,
    description: string,
  },
}

const AttributeRow: React.FC<AttributeRowProps> = (props) => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  // whether the success message is visible or hidden
  const [messageVisible, setMessageVisible] = useState(false);
  // count of how much the stat was increased
  const [increased, setIncreased] = useState(1);
  // a reference to the timer object, in case the user clicks repeatedly
  const [timer, setTimer] = useState(null);

  const buy = () => {
    dispatch(playerActions.changeStat({ name: props.attribute.name, amount: 1}));
    dispatch(playerActions.changeStat({ name: 'gold', amount: -getPrice()}));

    // show the success message, and hide it after a couple seconds
    if (timer) {
      // in case the user clicked multiple times, we want the message to stay
      // visible for the full time after the *last* click
      clearTimeout(timer);
    }
    const newTimer = setTimeout(() => {
      setMessageVisible(false);
      setIncreased(1);
      setTimer(null);
    }, 2000);
    // this is the number of times they have clicked in a row (e.g., +1, +2, etc.)
    // (it resets once the message banner disappears)
    if (messageVisible) {
      setIncreased(prev => prev + 1);
    }
    setMessageVisible(true);
    setTimer(newTimer);
  };

  const getPrice = () => {
    const base = player[props.attribute.name];
    return Math.round(Math.pow(base, 3) / 100) * 100;
  };

  let button = <button className="btn btn-light disabled">Not enough gold</button>;
  if (player.gold >= getPrice()) {
    button = <button className="btn btn-primary" onClick={buy}>Upgrade</button>
  }

  return (
    <div className="spell-list-row row h-100" key={props.attribute.name}>
      <div className="col-12 col-sm-4 col-md-6 col-xl-8 my-auto">
        <h3>{ titleCase(props.attribute.name) }</h3>
        <span className="small">{ props.attribute.description }</span>
      </div>
      <div className="attribute-cell col-4 col-sm-3 col-md-2 col-xl-2 text-center my-auto">
        Current: { player[props.attribute.name] }
        <CSSTransition
          in={messageVisible}
          timeout={300}
          classNames={"message"}
          unmountOnExit={true}
        >
          {animationState => <div className="message-inner">+{increased}</div>}
        </CSSTransition>
      </div>
      <div className="col-4 col-sm-3 col-md-2 col-xl-1 text-center my-auto">
        <img src="/static/images/ravenmore/128/coin.png" alt="Gold coin" /> { getPrice() }
      </div>
      <div className="col-4 col-sm-2 col-md-2 col-xl-1 text-right my-auto">
        {button}
      </div>
    </div>
  )
}

export default AttributeRow;
