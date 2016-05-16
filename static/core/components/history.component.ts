import {Component, Input, AfterViewChecked} from "@angular/core";

@Component({
  selector: "history",
  template: `
    <div class="history">
      <div *ngFor="let entry of history?.history">
        <p class="history-command">{{entry.command}}</p>
        <p class="history-results" *ngFor="let line of entry.results" [ngClass]="line.type">{{line.text}}</p>
      </div>
    </div>
    `,
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
