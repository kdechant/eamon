import {Component, Input} from "@angular/core";

@Component({
  selector: "command-list",
  template: `
    <button class="btn command-list-button" (click)="openCommands()">Commands</button>
    <div class="command-list row" [class.hidden]="hidden">
      <div class="command-list-item col-sm-3" *ngFor="let cmd of keys">
        {{ cmd }}
      </div>
    </div>
    `,
})
export class CommandListComponent {
  @Input() game;
  hidden = true;
  keys: string[] = [];

  public openCommands() {
    if (this.keys.length === 0 && typeof this.game !== 'undefined') {
      this.keys = Object.keys(this.game.command_parser.available_verbs)
        .filter(c => c !== 'goto' && c !== 'debugger' && c !== 'accio');
    }
    this.hidden = !this.hidden;
  }
}
