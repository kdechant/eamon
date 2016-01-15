import {Component} from 'angular2/core';

import {HistoryEntry} from './history-entry';

@Component({
  selector: 'command-prompt',
  inputs: ['history'],
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
  public command: string;
  public history: HistoryEntry[];
  
  private history_index = 0;
  
  /**
   * Handle keypresses, looking for special keys like enter and arrows.
   * Other keys like letters, numbers, space, etc. will be ignored.
   */
  onKeyPress(event:KeyboardEvent, value:string) {
    
    switch (event.keyIdentifier) {  // is valid, though NetBeans doesn't think so.
      
      case 'Enter':  // enter key runs the command
        // if the user didn't type a new command, run the last command
        if (value.length == 0 && this.history.length > 0) {
          value = this.history[this.history.length-1]['command'];
        }
        this.command = '';
        this.history.push(new HistoryEntry(value, "Ran command: "+value))
        console.log(this.history)
        break;
        
      case 'Up':
        // up arrow moves back through the history
        if (this.history_index <= this.history.length) {
          this.history_index++;
        }
        var real_index = this.history.length - this.history_index;
        if (real_index >= 0 && real_index < this.history.length) {
          this.command = this.history[real_index]['command'];
        }
        break;
        
      case 'Down':
        // down arrow moves forward through the history
        if (this.history_index > 0) {
          this.history_index--;
        }
        var real_index = this.history.length - this.history_index;
        if (real_index >= 0 && real_index < this.history.length) {
          this.command = this.history[real_index]['command'];
        }
        break;
        
      // other keys have no special function.
    }
  }
  
}
