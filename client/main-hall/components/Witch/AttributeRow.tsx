import styled from "@emotion/styled";
import { useState } from "react";
import { useTransitionState } from "react-transition-state";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { playerActions } from "../../store/player";
import { titleCase } from "../../utils";

type AttributeRowProps = {
  attribute: {
    name: string;
    description: string;
  };
};

const animationTime = 300;

const MessageBox = styled.div`
  transition: all ${animationTime}ms ease-in;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(0, -50%);

  &.animating {
    opacity: 0;
  }
`;

const Message = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
`;

const AttributeRow = (props: AttributeRowProps) => {
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player);

  // count of how much the stat was increased
  const [increased, setIncreased] = useState(1);
  // a reference to the timer object, in case the user clicks repeatedly
  const [timer, setTimer] = useState(null);

  const [{ status, isMounted }, toggle] = useTransitionState({
    timeout: animationTime,
    mountOnEnter: true,
    unmountOnExit: true,
    preEnter: true,
  });

  const buy = () => {
    dispatch(playerActions.changeStat({ name: props.attribute.name, amount: 1 }));
    dispatch(playerActions.changeStat({ name: "gold", amount: -getPrice() }));

    // show the success message, and hide it after a couple seconds
    if (timer) {
      // in case the user clicked multiple times, we want the message to stay
      // visible for the full time after the *last* click
      clearTimeout(timer);
    }
    const newTimer = setTimeout(() => {
      toggle(false);
      // setIncreased(1);
      setTimer(null);
    }, 2000);
    // this is the number of times they have clicked in a row (e.g., +1, +2, etc.)
    // (it resets once the message banner disappears)
    if (isMounted) {
      setIncreased((prev) => prev + 1);
    } else {
      setIncreased(1);
    }
    toggle(true);
    setTimer(newTimer);
  };

  const getPrice = () => {
    const base = player[props.attribute.name];
    return Math.round(base ** 3 / 100) * 100;
  };

  let button = (
    <button type="button" className="btn btn-light disabled">
      Not enough gold
    </button>
  );
  if (player.gold >= getPrice()) {
    button = (
      <button type="button" className="btn btn-primary" onClick={buy}>
        Upgrade
      </button>
    );
  }

  return (
    <div className="spell-list-row row h-100 align-items-center" key={props.attribute.name}>
      <div className="col-12 col-md-6">
        <h3>{titleCase(props.attribute.name)}</h3>
        <span className="small">{props.attribute.description}</span>
      </div>
      <div className="attribute-cell col-4 col-md-2 text-center position-relative">
        Current: {player[props.attribute.name]}
        {isMounted && (
          <MessageBox className={`message ${status === "preEnter" || status === "exiting" ? "animating" : ""}`}>
            <Message className="message-inner">+{increased}</Message>
          </MessageBox>
        )}
      </div>
      <div className="col-4 col-md-2 text-center">
        <img src="/static/images/ravenmore/128/coin.png" alt="Gold coin" /> {getPrice()}
      </div>
      <div className="col-4 col-md-2 text-end">{button}</div>
    </div>
  );
};

export default AttributeRow;
