import {Component, Input, AfterViewChecked} from "@angular/core";
import {Game} from "../models/game";
import {GameLoaderService} from "../services/game-loader.service";
import {Artifact} from "../models/artifact";

@Component({
  selector: "sell-items",
  template: `
    <div *ngIf="game.player.weapons.length > 4">
      <p>As you enter the Main Hall, Lord William Missilefire approaches you and says, "You have too many weapons to keep them all. Four is the legal limit."</p>
      <p>Your weapons are:</p>
      
      <div *ngIf="game?.player?.inventory">
        <table class="table artifacts-list">
            <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Odds</th>
                <th>Damage</th>
                <th>Value</th>
            </tr>
            <tbody *ngFor="let artifact of game.player?.weapons">
                <tr class="artifact" *ngIf="artifact.type == 2 || artifact.type == 3">
                    <td>{{ artifact.name }}</td>
                    <td class="weapon-icon"><img src="/static/images/ravenmore/128/{{ artifact.getIcon() }}.png"
                                     title="{{ artifact.getTypeName() }}"></td>
                    <td>{{ artifact.weapon_odds }}%</td>
                    <td>{{ artifact.dice }} d {{ artifact.sides }}</td>
                    <td>{{ artifact.value }} gp</td>
                    <td><button class="btn" (click)="sell(artifact)">Sell</button></td>
                </tr>
            </tbody>
        </table>
      </div>
    
    </div>
    <div *ngIf="game.player.weapons.length <= 4">
      <p>When you reach the main hall, you deliver your goods to Sam Slicker, the local buyer for such things.
      He examines your items and pays you what they are worth...</p>
      <p>He pays you {{game.player.profit}} gold pieces total.</p>
      <p *ngFor="let msg of game.exit_message">{{msg}}</p>
      <button class="btn" (click)="savePlayer()">Save and go to main hall</button>
    </div>
    `,
})
export class SellItemsComponent {
  @Input() game;

  constructor(private _gameLoaderService: GameLoaderService) { }

  public sell(artifact: Artifact) {
    let game = Game.getInstance();
    let i = game.player.weapons.indexOf(artifact);
    game.player.weapons.splice(i, 1);
    game.player.profit += artifact.value;
    artifact.destroy();
  }

  public savePlayer(): void {
    let game = Game.getInstance();
    this._gameLoaderService.savePlayer(game.player).subscribe(
       data => {
         window.location.href = "/main-hall/hall";
       },
       error => console.error("Error saving player!")
    );
  }

}
