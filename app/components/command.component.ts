import {Component, Input} from 'angular2/core';

@Component({
  selector: 'command-prompt',
  template: `
    <div class="command-prompt">
      <span class="prompt">Your Command: </span>
      <input #cmd (keyup)="onKeyPress($event, cmd.value)"
       type="text"
       [(ngModel)]="command"
       placeholder="{{lastCommand}}"
       />
    </div>
    `,
})
export class CommandPromptComponent {
  @Input() game;

  static KEYCODE_UP: number = 38;
  static KEYCODE_DOWN: number = 40;
  static KEYCODE_ENTER: number = 13;

  public command: string;

  /**
   * Handle keypresses, looking for special keys like enter and arrows.
   * Other keys like letters, numbers, space, etc. will be ignored.
   */
  onKeyPress(event:KeyboardEvent, value:string) {

    switch (event.keyCode) {  // is valid, though NetBeans doesn't think so.

      case CommandPromptComponent.KEYCODE_ENTER:  // enter key runs the command
        // if the user didn't type a new command, run the last command
        if (value.length == 0) {
          value = this.game.history.getLastCommand();
        }

        // start a new history entry
        this.game.history.push(value)

        // run the command
        var result = this.game.command_parser.run(value);

        // clear the input box
        this.command = '';

        break;

      case CommandPromptComponent.KEYCODE_UP:
        // up arrow moves back through the history
        var prev_command = this.game.history.getOlderCommand();
        if (prev_command !== null) {
          this.command = prev_command
        }
        break;

      case CommandPromptComponent.KEYCODE_DOWN:
        var next_command = this.game.history.getNewerCommand();
        if (next_command !== null) {
          this.command = next_command
        }
        break;

      // other keys have no special function.
    }
  }

}
