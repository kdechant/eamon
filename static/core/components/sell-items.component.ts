import {Component, Input, AfterViewChecked} from "@angular/core";
import {Game} from "../models/game";
import {GameLoaderService} from "../services/game-loader.service";

@Component({
  selector: "sell-items",
  template: `
    <p>When you reach the main hall, you deliver your goods to Sam Slicker, the local buyer for such things.
    He examines your items and pays you what they are worth...</p>
    <p>He pays you {{game.player.profit}} gold pieces total.</p>
    <p *ngFor="let msg of game.exit_message">{{msg}}</p>
    <button (click)="savePlayer()">Save and go to main hall</button>
    `,
})
export class SellItemsComponent {
  @Input() game;

  constructor(private _gameLoaderService: GameLoaderService) { }

  public savePlayer(): void {
    let game = Game.getInstance();
    this._gameLoaderService.savePlayer(game.player).subscribe(
       data => {
         console.log("Saved player!");
         window.location.href = "/player/" + window.localStorage.getItem('player_id');
       },
       error => console.error("Error saving player!")
    );
  }

}
