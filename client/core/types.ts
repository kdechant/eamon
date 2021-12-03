import Game from "./models/game";

/**
 * Common type for components that take the Game object as a prop
 */
export type PropsWithGame = {
  game: Game;
  setGameState: (game: Game) => void;
}


/**
 * Props used by hints, command list, and how to play modal
 */
export type ModalProps = {
  game: Game;
  visible: boolean;
  toggle: () => void;
}
