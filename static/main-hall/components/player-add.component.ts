import {Component,  OnInit}  from '@angular/core';
import {Router} from '@angular/router';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';

@Component({
  template: `
  <div class="col-sm-12">
    <p>The burly irishman hits his forehead and says, &quot;Ah, ye must be new here! Well, wait just a minute and I'll bring someone out to take care of ye.&quot;</p>
    <p>The Irishman walks away and in walks a man of possibly Elfish descent.</p>
    <p>He studies you for a moment and says, &quot;Please enter your name and gender.&quot;</p>
    <form (ngSubmit)="save()">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" class="form-control" id="name" [(ngModel)]="player.name">
      </div>
      <div>
          <label>
              <input #male name="gender" type="radio" value="m" (click)="player.gender = male.value" />
              Male
          </label>
      </div>
      <div>
          <label>
              <input #female name="gender" type="radio" value="f" (click)="player.gender = female.value" />
              Female
          </label>
      </div>
      <p>&quot;Your prime attributes are--&quot;</p>
      <p>Hardiness: {{player.hardiness}}<br />
      <p>Agility: {{player.agility}}<br />
      <p>Charisma: {{player.charisma}}</p>
      <div class="buttons" *ngIf="!player.id">
        <input type="button" id="reroll" (click)="reroll()" value="Reroll" />
        <input type="submit" value="Begin Your Adventuring Career" />
        <input type="button" id="cancel" (click)="gotoList()" value="Cancel" />
      </div>
    </form>
    <div id="prosper" *ngIf="player.id">
      <p>The man behind the desk takes back the instructions and says, &quot;It is now time
      for you to start your life.&quot; He makes an odd sign with his hand and says, &quot;Live"
      long and prosper.&quot;</p>
      <p>You now wander into the Main Hall...</p>
      <button (click)="gotoPlayer(player)">Next</button>
    </div>
  </div>
  `
})
export class PlayerAddComponent implements OnInit  {

  player: Player;

  constructor(
    private _router: Router,
    private _playerService: PlayerService) {
  }

  ngOnInit() {
    this.player = new Player();
    this.player.gender = 'm';
    this.player.hardiness = 0;
    this.rollStats();
  }

  gotoList() {
    this._router.navigate(['/']);
  }

  gotoPlayer(player: Player) {
    window.localStorage.setItem('player_id', String(player.id));
    this._router.navigate( ['/player', player.id], { queryParams: { } } );
  }

  reroll() {
    this.player.hardiness = 0;
    this.rollStats();
  }

  /**
   * Rolls a set of stats for the player
   */
  rollStats(): void {
    while (this.player.hardiness < 15 || this.player.agility < 12
      || this.player.hardiness + this.player.agility + this.player.charisma < 42) {
      this.player.hardiness = this.diceRoll(3, 7);
      this.player.agility = this.diceRoll(3, 7);
      this.player.charisma = this.diceRoll(3, 7);
    }
  }

  /**
   * Rolls a set of dice
   */
  diceRoll(dice, sides): number {
    let result = 0;
    for (let i = 0; i < dice; i++) {
      result += Math.floor(Math.random() * sides + 1);
    }
    return result;
  }

  save(player: Player): void {
    console.log(this.player);
    this._playerService.create(this.player).subscribe(
       data => {
         this.player.id = data['id'];
         // no redirect here. saving the data shows a message and a button on this page.
       },
       error => console.error("Error saving player!")
    );
  }

}
