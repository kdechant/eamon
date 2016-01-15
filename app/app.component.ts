import {Component} from 'angular2/core';
import {OnInit} from 'angular2/core';

import {Room} from './room';
import {RoomExit} from './room';

import {CommandPromptComponent} from './command.component';

@Component({
  selector: 'my-app',
  template:`
  <h1>{{title}}</h1>
  <command-prompt></command-prompt>
  `,
  directives: [CommandPromptComponent],
//  providers: [HeroService]
})
export class AppComponent {
  
  public title = 'The Angular World of Eamon';
  
  constructor() { }
  
}
