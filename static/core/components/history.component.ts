import {Component, Input, AfterViewChecked} from "@angular/core";
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
  selector: "history",
  template: `
    <div class="history">
      <div class="history-entry" *ngFor="let entry of history?.history">
        <p class="history-command">{{entry.command}}</p>
        <p class="history-results"
          *ngFor="let line of entry.results"
          [ngClass]="line.type"
          [@shrinkInOut]="'in'"
          >{{line.text}}</p>
      </div>
    </div>
    `,
  animations: [
    trigger('shrinkInOut', [
      state('in', style({opacity: 1})),
      transition('void => *', [
        style({opacity: 0.25}),
        animate(100, style({opacity: 1}))
      ])
    ])
  ]
})
export class HistoryComponent implements AfterViewChecked {
  @Input() history;

  public ngAfterViewChecked() {
    // scroll the history box
    let hist = document.querySelector(".history");
    if (hist) {
      hist.scrollTop = hist.scrollHeight;
    }
  }
}
