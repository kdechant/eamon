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
  duration: number;
  counters: number;
  properties: { [key: string]: number };
  // TODO: end of timed effect handler
};
