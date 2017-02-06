import {Component,  OnInit}  from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {NotificationsService} from "angular2-notifications";

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';
import {Artifact} from "../../core/models/artifact";
import {ShopService} from "../services/shop.service";

@Component({
  templateUrl: "/static/main-hall/templates/shop.html",
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
