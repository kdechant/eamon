import {Component,  OnInit}  from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {PlayerService} from '../services/player.service';
import {Game} from "../../core/models/game";

@Component({
  template: `
  <h2><img src="/static/images/ravenmore/128/upg_wand.png">Hokas Tokas' School of Magick</h2>
  <p>After a few minutes diligent searching, you find Hokas Tokas, the old Mage. He looks at you and says, &quot;So you want old Hokey to teach you some magic, eh? Well, it'll cost you. My fees are:</p>
  <p>Blast...1000 GP<br />
  Heal.....500 GP<br />
  Speed...4000 GP<br />
  Power....100 GP</p>
  <p>Well, which will it be?&quot;</p>
  <p>You have {{_playerService.player?.gold}} gold pieces.</p>
  <p>{{message}}</p>
  <p class="danger">{{error}}</p>
  <p *ngIf="!message && !error">
    <button class="btn"><a (click)="buy('blast')">Blast</a></button>
    <button class="btn"><a (click)="buy('heal')">Heal</a></button>
    <button class="btn"><a (click)="buy('speed')">Speed</a></button>
    <button class="btn"><a (click)="buy('power')">Power</a></button>
  </p>
  <p>
    <button class="btn"><a (click)="gotoDetail()">Go back to Main Hall</a></button>
  </p>
  `
})
export class WizardComponent implements OnInit  {
  public message: string;
  public error: string;

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _playerService: PlayerService) {
  }

  ngOnInit() {
    let id = Number(this._route.snapshot.params['id']);
    this._playerService.getPlayer(id);
  }

  gotoDetail() {
    this._router.navigate(['/player', this._playerService.player.id]);
  }

  buy(spell: string) {
    this.error = "";
    this.message = "";
    try {
      if (this._playerService.player.spell_abilities_original[spell]) {
        throw new Error('Hokas says, "I ought to take your gold anyway, but haven\'t you forgotten something? I already taught you that spell!" Shaking his head sadly, he returns to the bar.');
      }

      let price: number;
      switch (spell) {
        case 'blast':
          price = 1000;
          break;
        case 'heal':
          price = 500;
          break;
        case 'speed':
          price = 4000;
          break;
        case 'power':
          price = 100;
          break;
      }
      if (price > this._playerService.player.gold) {
        throw new Error("When Hokas sees that you don't have enough to pay him, he stalks back to the bar, muttering about youngsters who should be turned into frogs.");
      }
      this.message = "Hokas teaches you your spell, takes his fee, and returns to his stool on the bar. As you walk away, you hear him order a Double Dragon Blomb.";
      this._playerService.player.gold -= price;
      this._playerService.player.spell_abilities_original[spell] = Game.getInstance().diceRoll(1, 50) + 25;
    } catch (e) {
      this.error = e.message;
    }
  }

}
