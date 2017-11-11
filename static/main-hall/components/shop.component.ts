import {Component, OnInit}  from '@angular/core';
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
    trigger('sellAnimation', [
      transition(':leave', animate(300, style({opacity: 0})))
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

}
