import {Component, Input} from 'angular2/core';

@Component({
  selector: 'history',
  template: `
    <div class="history">
      <div *ngFor="#entry of history?.history">
        <p class="history-command">{{entry.command}}</p>
        <p class="history-results" *ngFor="#line of entry.results">{{line}}</p>
      </div>
    </div>
    `,
})
export class HistoryComponent {
  @Input() history;
}
