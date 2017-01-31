import {Component,  OnInit}  from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {NotificationsService} from "angular2-notifications";

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';
import {Artifact} from "../../core/models/artifact";
import {ShopService} from "../services/shop.service";

@Component({
  template: `
  <h2><img src="/static/images/ravenmore/128/axe2.png">Marcos Cavielli's Weapons and Armour Shoppe</h2>
  <div *ngIf="action == ''">
    <p>As you enter the weapon shop, Marcos Cavielli (the owner) comes from out of the back room and says, &quot;Well, as I live and breathe, if it isn't my old pal, {{_playerService.player?.name}}!&quot;</p>
    <p>So, what do you need?</p>
    <button class="btn" (click)="action = 'buy'">Buy weapons and armor</button>
    <button class="btn" (click)="action = 'sell'">Sell weapons and armor</button>
    <button class="btn" (click)="gotoDetail()">Go back to Main Hall</button>
  </div>
  
  <div *ngIf="action == 'buy'">
    <p>I just happen to have the following weapons and armor in stock:</p>
    <p>You have {{_playerService.player?.gold}} gold pieces.</p>
    <p class="heading">Weapons:</p>
    <table class="table artifacts-list">
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Odds</th>
            <th>Damage</th>
            <th>Price</th>
        </tr>
        <tbody *ngFor="let artifact of weapons">
            <tr class="artifact" *ngIf="artifact.type == 2 || artifact.type == 3">
                <td>{{ artifact.name }}</td>
                <td>{{ artifact.getWeaponTypeName() }}</td>
                <td>{{ artifact.weapon_odds }}%</td>
                <td>{{ artifact.dice }} d {{ artifact.sides }}</td>
                <td>{{ artifact.value }} gp</td>
                <td><button class="btn" (click)="buy(artifact)">Buy</button></td>
            </tr>
        </tbody>
    </table>
    <p class="heading">Armor and Shields:</p>
    <table class="table artifacts-list">
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Armor Class</th>
            <th>Armor Penalty</th>
            <th>Price</th>
        </tr>
        <tbody *ngFor="let artifact of armors">
            <tr class="artifact" *ngIf="artifact.type != 2 && artifact.type != 3">
                <td>{{ artifact.name }}</td>
                <td>{{ artifact.getArmorTypeName() }}</td>
                <td>{{ artifact.armor_class }}</td>
                <td>{{ artifact.armor_penalty }}%</td>
                <td>{{ artifact.value }} gp</td>
                <td><button class="btn" (click)="buy(artifact)">Buy</button></td>
            </tr>
        </tbody>
    </table>
    <button (click)="action = ''">Done</button>
  </div>
  
  <div *ngIf="action == 'sell'">
    <p>What do you want to sell?</p>
    <p>You have {{_playerService.player?.gold}} gold pieces.</p>
    <p class="heading">Weapons:</p>
    <table class="table artifacts-list">
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Odds</th>
            <th>Damage</th>
            <th>Value</th>
        </tr>
        <tbody *ngFor="let artifact of _playerService.player?.inventory">
            <tr class="artifact" *ngIf="artifact.type == 2 || artifact.type == 3">
                <td>{{ artifact.name }}</td>
                <td>{{ artifact.getWeaponTypeName() }}</td>
                <td>{{ artifact.weapon_odds }}%</td>
                <td>{{ artifact.dice }} d {{ artifact.sides }}</td>
                <td>{{ artifact.value | divide:2 }} gp</td>
                <td><button class="btn" (click)="sell(artifact)">Sell</button></td>
            </tr>
        </tbody>
    </table>
    <p class="heading">Armor and Shields:</p>
    <table class="table artifacts-list">
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Armor Class</th>
            <th>Armor Penalty</th>
            <th>Price</th>
        </tr>
        <tbody *ngFor="let artifact of _playerService.player?.inventory">
            <tr class="artifact" *ngIf="artifact.type == 11">
                <td>{{ artifact.name }}</td>
                <td>{{ artifact.getArmorTypeName() }}</td>
                <td>{{ artifact.armor_class }}</td>
                <td>{{ artifact.armor_penalty }}%</td>
                <td>{{ artifact.value | divide:2 }} gp</td>
                <td><button class="btn" (click)="sell(artifact)">Sell</button></td>
            </tr>
        </tbody>
    </table>
    <button class="btn" (click)="action = ''">Done</button>
  </div>
  <simple-notifications [options]="notification_options"></simple-notifications>
  `
})
export class ShopComponent implements OnInit  {
  weapons: Artifact[];
  armors: Artifact[];
  action: string = '';

  public notification_options = {
    position: ["bottom"],
    timeOut: 2000,
    lastOnBottom: true,
    showProgressBar: false
  };

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _playerService: PlayerService,
              private _shopService: ShopService,
              private _notificationService: NotificationsService) {
  }

  ngOnInit() {
    let id = Number(this._route.snapshot.params['id']);
    this._playerService.getPlayer(id);
    this.weapons = this._shopService.getWeapons();
    this.armors = this._shopService.getArmor();
  }

  gotoDetail() {
    this._router.navigate(['/player', this._playerService.player.id]);
  }

  buy(artifact) {
    this._playerService.player.inventory.push(artifact);
    this._playerService.player.gold -= artifact.value;
    this._notificationService.success("You buy a " + artifact.name + ".", "");
  }

  sell(artifact) {
    let index = this._playerService.player.inventory.indexOf(artifact);
    if (index > -1) {
      this._playerService.player.inventory.splice(index, 1);
    }
    this._playerService.player.gold += Math.floor(artifact.value / 2);
    this._notificationService.success("You sell your " + artifact.name + ".", "");
  }

}
