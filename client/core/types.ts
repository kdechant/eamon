import type Game from "./models/game";

/**
 * Common type for components that take the Game object as a prop
 */
export type PropsWithGame = {
  game: Game;
  setGameState: (game: Game) => void;
};

/**
 * Props used by hints, command list, and how to play modal
 */
export type ModalProps = {
  game: Game;
  visible: boolean;
  toggle: () => void;
};

/**
 * Running effects like spells, conditions, etc.
 * Not to be confused with text "effects" from the DB.
 */
export type TimedEffect = {
  name: string;
  /**
   * Duration of the effect, in turns. When the effect is created, or a counter is removed,
   * the timer is set to this value.
   */
  duration: number;

  /**
   * Countdown until effect expires. Based on the duration.
   */
  timer: number;

  /**
   * Counters are used for stackable effects. When the timer counts down to zero, a counter is removed.
   */
  counters: number;

  /**
   * What the effect does. e.g., { hd: 1 } gives a bonus of 1 to HD while it's active.
   */
  properties: { [key: string]: number };
  // TODO: end of timed effect handler
};
