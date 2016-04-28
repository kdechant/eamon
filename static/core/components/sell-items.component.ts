import {Component, Input, AfterViewChecked} from "angular2/core";

@Component({
  selector: "sell-items",
  template: `
    <p>When you reach the main hall, you deliver your goods to Sam Slicker, the local buyer for such things.
    He examines your items and pays you what they are worth...</p>
    <p>He pays you {{game.player.profit}} gold pieces total.</p>
    <button (click)="savePlayer()">Save and go to main hall</button>
    `,
})
export class SellItemsComponent {
  @Input() game;

  public savePlayer(): void {
    alert("Not implemented yet!")
  }

}
