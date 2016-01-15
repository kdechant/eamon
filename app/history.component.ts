import {Component} from 'angular2/core';

import {HistoryEntry} from './history-entry';

@Component({
  selector: 'history',
  inputs: ['history'],
  template: `
    <div class="history">
      <div *ngFor="#entry of history">
        <p class="history-command">{{entry.command}}</p>
        <p class="history-output">{{entry.results}}</p>
      </div>
    </div>
    `,
})
export class HistoryComponent {
  public history: HistoryEntry[];
}