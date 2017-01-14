import {Component,  OnInit}  from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {PlayerService} from '../services/player.service';
import {Game} from "../../core/models/game";

@Component({
  template: `
  <h2><img src="/static/images/ravenmore/128/coin.png">Bank of Eamon Towne</h2>
  <p>You have no trouble spotting Shylock McFenny, the local banker, due to his large belly. You attract his attention, and he comes over to you.</p>
  <p *ngIf="!message && !error">Well, {{_playerService.player?.name}}, my dear {{ _playerService.player?.gender == 'm' ? 'boy' : 'lass' }}, what a pleasure to see you! Do you want to make a deposit or a withdrawal?</p>
  <p>{{message}}</p>
  <p>You have {{_playerService.player?.gold}} gold pieces in hand, and {{_playerService.player?.gold_in_bank}} gold pieces in the bank.</p>
  <p *ngIf="!message && !error">
    <button class="btn" (click)="do('deposit')">Deposit</button>
    <button class="btn" (click)="do('withdraw')">Withdrawal</button>
  </p>
  <p *ngIf="activity && !message">
    Good for you! How much would you like to {{ activity }}? <input type="text" class="form-control" id="amount" [(ngModel)]="amount" name="amount">
    <button class="btn" (click)="go()">Go</button>
  </p>
  <p class="danger">{{error}}</p>
  <p>
    <button class="btn" (click)="gotoDetail()">Go back to Main Hall</button>
  </p>
  `
})
export class BankComponent implements OnInit  {
  public message: string;
  public error: string;
  public activity: string;
  public amount: string;

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

  do(activity: string) {
    this.activity = activity;
  }

  go() {
    this.error = "";
    this.message = "";

    try {

      let amt = parseInt(this.amount);
      if (isNaN(amt)) {
        throw new Error('The banker scowls at you and says, "Come, come, you\'re not making sense! Try again."');
      }

      console.log(amt)
      console.log(this.amount)
      console.log(this._playerService.player.gold)
      console.log(this._playerService.player.gold_in_bank)

      if (this.activity === 'deposit' && amt > this._playerService.player.gold) {
        throw new Error("The banker was very pleased when you told him the sum, but when he discovered that you didn't have that much on you, he walked away shouting about fools who try to play tricks on a kindly banker.");
      }
      if (this.activity === 'withdraw' && amt > this._playerService.player.gold_in_bank) {
        throw new Error("Shylock throws you a terrible glance and says, \"That's more than you got in your account! You know I don't make loans to your kind!\"");
      }
      if (this.activity === 'deposit') {
        this.message = "Shylock takes your money, puts it in his bag, listens to it jingle, then thanks you and walks away.";
        this._playerService.player.gold -= amt;
        this._playerService.player.gold_in_bank += amt;
      } else {
        this.message = "Shylock hands you your gold, shakes your hand, and walks away.";
        this._playerService.player.gold_in_bank -= amt;
        this._playerService.player.gold += amt;
      }
    } catch (e) {
      this.error = e.message;
    }
  }

}
