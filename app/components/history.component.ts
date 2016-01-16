import {Component} from 'angular2/core';

import {HistoryService} from '../services/history.service';

@Component({
  selector: 'history',
  template: `
    <div class="history">
      <div *ngFor="#entry of _historyService.history">
        <p class="history-command">{{entry.command}}</p>
        <p class="history-results">{{entry.results}}</p>
      </div>
    </div>
    `,
})
export class HistoryComponent {
  
  /**
   * Constructor. No actual code, but needed for DI
   */  
  constructor(private _historyService: HistoryService) { }
  
}
