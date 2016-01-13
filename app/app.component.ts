import {Component} from 'angular2/core';
import {OnInit} from 'angular2/core';

import {Room} from './room';
import {RoomExit} from './room';

import {OutputComponent} from './output.component';
import {CommandPromptComponent} from './command.component';

import {Output} from './output';

@Component({
  selector: 'my-app',
  template:`
  <h1>{{title}}</h1>
  <output [output]="output"></output>
  <command-prompt [output]="output"></command-prompt>
  `,
  directives: [OutputComponent, CommandPromptComponent],
//  providers: [HeroService]
})
export class AppComponent {
  
  public title = 'The Angular World of Eamon';

  public output: Output[];
  
  constructor() { }

  ngOnInit() {
    // initialize empty output array
    this.output = [];
  }
  
}
