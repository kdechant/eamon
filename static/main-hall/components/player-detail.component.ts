import {Component,  OnInit}  from '@angular/core';
import {RouteParams, Router} from '@angular/router-deprecated';
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';
import {AdventureService} from '../services/adventure.service';
import {PlayerListComponent}     from './player-list.component';
import {AdventureListComponent}   from './adventure-list.component';
import {ShopComponent}   from './shop.component';
import {StatusComponent} from "../components/status.component";
import {PlayerMenuComponent} from "./player-menu.component";

@Component({
  template: `
  <div class="col-sm-4">
    <p>You are in the main hall of the Guild of Free Adventurers. You can do the following:</p>
    <nav>
      <p><a [routerLink]="['AdventureList']">Go on an adventure</a></p>
      <p><a [routerLink]="['Shop']">Visit the weapons shop</a></p>
      <p><a (click)="gotoList()">Temporarily leave the universe</a></p>
    </nav>
    <router-outlet></router-outlet>
  </div>
  <div class="col-sm-8">
    <status [player]="_playerService.current_player"></status>
  </div>
  `,
  directives: [StatusComponent, ROUTER_DIRECTIVES]
})
@RouteConfig([
  {path: '/adventure', name: 'AdventureList', component: AdventureListComponent, useAsDefault: true},
  {path: '/shop', name: 'Shop', component: ShopComponent}
])
export class PlayerDetailComponent implements OnInit  {

  constructor(
    private _router: Router,
    private _routeParams: RouteParams,
    private _playerService: PlayerService) {}

  ngOnInit() {
    let id = this._routeParams.get('id');
    this._playerService.getPlayer(Number(id));
  }

  gotoList() {
    this._router.navigate(['PlayerList']);
  }
}
