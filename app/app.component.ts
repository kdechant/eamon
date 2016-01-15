import {Component} from 'angular2/core';
import {OnInit} from 'angular2/core';

import {Room} from './room';
import {RoomExit} from './room';

import {HistoryComponent} from './history.component';
import {CommandPromptComponent} from './command.component';

import {HistoryEntry} from './history-entry';

@Component({
  selector: 'my-app',
  template:`
  <h1>{{title}}</h1>
  <history [history]="history"></history>
  <command-prompt [history]="history"></command-prompt>
  `,
  directives: [HistoryComponent, CommandPromptComponent],
//  providers: [HeroService]
})
export class AppComponent {
  
  public title = 'The Angular World of Eamon';

  public history: HistoryEntry[];
  
  constructor() { }

  ngOnInit() {
    // initialize empty output array
    this.history = [];
  }
  
}
