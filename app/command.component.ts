import {Component} from 'angular2/core';

import {Output} from './output';

@Component({
  selector: 'command-prompt',
  inputs: ['output'],
  template: `
    <div class="command-prompt">
      <span class="prompt">Your Command: </span>
      <input #cmd (keyup.enter)="onEnter(cmd.value)"
       type="text"
       [(ngModel)]="command"
       placeholder="{{lastCommand}}"
       />
    </div>
    `,
})
export class CommandPromptComponent {
  public command: string;
  public lastCommand: string;
  public output: Output[];
    
  onEnter(value:string) {
    // if the user didn't type a new command, run the last command
    if (value.length == 0) {
      value = this.lastCommand;
    }
    this.lastCommand = value;
    this.command = '';
    this.output.push(new Output(value, "Ran command: "+value))
  }
  
}