import {Component, Input, AfterViewChecked} from 'angular2/core';

@Component({
  selector: 'history',
  template: `
    <div class="history">
      <div *ngFor="#entry of history?.history">
        <p class="history-command">{{entry.command}}</p>
        <p class="history-results" *ngFor="#line of entry.results"><span [ngClass]="line.type">{{line.text}}</span></p>
      </div>
    </div>
    `,
})
export class HistoryComponent implements AfterViewChecked {
  @Input() history;

  public ngAfterViewChecked() {
    // scroll the history box
    var hist = document.querySelector(".history");
    if (hist) {
      hist.scrollTop = hist.scrollHeight;
    }
  }
}
