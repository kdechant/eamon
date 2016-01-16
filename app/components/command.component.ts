import {Component} from 'angular2/core';

import {HistoryService} from '../services/history.service';
import {CommandParserService} from '../services/command-parser.service';

@Component({
  selector: 'command-prompt',
  template: `\n\
    <div class="history">
      <div *ngFor="#entry of _historyService.history">
        <p class="history-command">{{entry.command}}</p>
        <p class="history-results">{{entry.results}}</p>
      </div>
    </div>
    <div class="command-prompt">
      <span class="prompt">Your Command: </span>
      <input #cmd (keyup)="onKeyPress($event, cmd.value)"
       type="text"
       [(ngModel)]="command"
       placeholder="{{lastCommand}}"
       />
    </div>
    `,
  providers: [HistoryService, CommandParserService]
})
export class CommandPromptComponent {
  
  static KEYCODE_UP: number = 38;
  static KEYCODE_DOWN: number = 40;
  static KEYCODE_ENTER: number = 13;
  
  public command: string;
    
  /**
   * Constructor. No actual code, but needed for DI
   */  
  constructor(
    private _historyService: HistoryService,
    private _commandParserService: CommandParserService) { }
      
  /**
   * Handle keypresses, looking for special keys like enter and arrows.
   * Other keys like letters, numbers, space, etc. will be ignored.
   */
  onKeyPress(event:KeyboardEvent, value:string) {
    
    switch (event.keyCode) {  // is valid, though NetBeans doesn't think so.
      
      case CommandPromptComponent.KEYCODE_ENTER:  // enter key runs the command
        // if the user didn't type a new command, run the last command
        if (value.length == 0) {
          value = this._historyService.getLastCommand();
        }
        
        // run the command
        var result = this._commandParserService.run(value);
        
        // clear the input box
        this.command = '';
        
        this._historyService.push(value, result)
        break;
        
      case CommandPromptComponent.KEYCODE_UP:
        // up arrow moves back through the history
        var prev_command = this._historyService.getOlderCommand();
        if (prev_command !== null) {
          this.command = prev_command
        }
        break;
        
      case CommandPromptComponent.KEYCODE_DOWN:
        var next_command = this._historyService.getNewerCommand();
        if (next_command !== null) {
          this.command = next_command
        }
        break;
        
      // other keys have no special function.
    }
  }
  
}
