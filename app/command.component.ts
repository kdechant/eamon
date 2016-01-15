import {Component} from 'angular2/core';

import {HistoryService} from './history.service';

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
  providers: [HistoryService]
})
export class CommandPromptComponent {
  public command: string;
    
  /**
   * Constructor. No actual code, but needed for DI
   */  
  constructor(private _historyService: HistoryService) { }
  
  /**
   * Handle keypresses, looking for special keys like enter and arrows.
   * Other keys like letters, numbers, space, etc. will be ignored.
   */
  onKeyPress(event:KeyboardEvent, value:string) {
    
    switch (event.keyIdentifier) {  // is valid, though NetBeans doesn't think so.
      
      case 'Enter':  // enter key runs the command
        // if the user didn't type a new command, run the last command
        if (value.length == 0) {
          value = this._historyService.getLastCommand();
        }
        this.command = '';
        
        // TODO: parse and execute the command.
        
        this._historyService.push(value, "Ran command: "+value)
        break;
        
      case 'Up':
        // up arrow moves back through the history
        var prev_command = this._historyService.getOlderCommand();
        if (prev_command != '') {
          this.command = prev_command
        }
        break;
        
      case 'Down':
        var next_command = this._historyService.getNewerCommand();
        if (next_command != '') {
          this.command = next_command
        }
        break;
        
      // other keys have no special function.
    }
  }
  
}
