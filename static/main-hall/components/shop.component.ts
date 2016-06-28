import {Component,  OnInit}  from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';
import {Artifact} from "../../core/models/artifact";
import {ShopService} from "../services/shop.service";

@Component({
  template: `
  <h4>Marcos Cavielli's Weapons and Armour Shoppe</h4>
  <p>As you enter the weapon shop, Marcos Cavielli (the owner) comes from out of the back room and says, &quot;Well, as I live and breathe, if it isn't my old pal, {{_playerService.player?.name}}!&quot;</p>
  <p>So, whatta you need? I just happen to have the following weapons and armor in stock:</p>
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
              <td><button (click)="buy(artifact)">Buy</button></td>
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
              <td><button (click)="buy(artifact)">Buy</button></td>
          </tr>
      </tbody>
  </table>
  <button class="btn"><a (click)="gotoDetail()">Go back to Main Hall</a></button>
  `
})
export class ShopComponent implements OnInit  {
  weapons: Artifact[];
  armors: Artifact[];

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _playerService: PlayerService,
              private _shopService: ShopService) {
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
  }

}
