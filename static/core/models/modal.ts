import {Game} from "../../core/models/game";

export class Modal {

  public text: string;
  public value: string;
  public callback: Function;
  public visible: boolean = false;

  /**
   * Shows a modal prompt to the player. The game will be paused waiting for player input.
   */
  public show(text: string, callback: Function) {
    Game.getInstance().pause();
    this.text = text;
    this.callback = callback;
    this.visible = true;
  }

  /**
   * Handles the submission of the modal. Runs the callback function and resumes the game clock.
   */
  public submit() {
    this.visible = false;
    this.callback(this.value);
    Game.getInstance().resume();
    Game.getInstance().tick();
  }

}
