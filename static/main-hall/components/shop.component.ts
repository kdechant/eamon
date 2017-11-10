import {Component, Input, OnInit}  from '@angular/core';
import {Router} from '@angular/router';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import {PlayerService} from '../services/player.service';
import {Artifact} from "../../core/models/artifact";
import {ShopService} from "../services/shop.service";

@Component({
  templateUrl: "/static/main-hall/templates/shop.html",
  animations: [
    trigger('messageAnimation', [
      state('visible', style({
        opacity: 1,
        display: 'block',
      })),
      state('hidden',   style({
        opacity: 0,
        display: 'none',
      })),
      transition('hidden => visible', animate('150ms ease-in')),
      transition('visible => hidden', animate('150ms ease-out'))
    ]),
    trigger('sellAnimation', [
      transition(':leave', animate(250, style({opacity: 0})))
    ])
  ]
})
export class ShopComponent implements OnInit  {
  weapons: Artifact[];
  armors: Artifact[];
  action: string = '';

  constructor(private _router: Router,
              private _playerService: PlayerService,
              private _shopService: ShopService) {
  }

  ngOnInit() {
    let id = parseInt(window.localStorage.getItem('player_id'));
    this._playerService.getPlayer(id);
    this.weapons = this._shopService.getWeapons();
    this.armors = this._shopService.getArmor();
  }

  gotoDetail() {
    this._router.navigate(['/hall']);
  }

  buy(artifact) {
    this._playerService.player.inventory.push(artifact);
    this._playerService.player.gold -= artifact.value;
    artifact.message = ("Bought!");
    artifact.messageState = "visible";
    setTimeout(function() { artifact.messageState = "hidden" }, 2000);
  }

  sell(artifact) {
    artifact.salePending = true;
    artifact.message = ("Sold!");
    artifact.messageState = "visible";
    var player = this._playerService.player;

    setTimeout(function() {
      let index = player.inventory.indexOf(artifact);
      if (index > -1) {
        player.inventory.splice(index, 1);
      }
      player.gold += Math.floor(artifact.value / 2);
    }, 1250);
  }

}
