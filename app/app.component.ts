import {Component} from 'angular2/core';
import {OnInit} from 'angular2/core';

import {Room} from './models/room';
import {RoomExit} from './models/room';

import {CommandPromptComponent} from './components/command.component';
import {StatusComponent} from './components/status.component';

@Component({
  selector: 'my-app',
  template:`
  <h1>{{title}}</h1>
  <status></status>
  <command-prompt></command-prompt>
  `,
  directives: [CommandPromptComponent, StatusComponent]
})
export class AppComponent {

  public title = 'The Angular World of Eamon';
  
  constructor() { }
  
}
