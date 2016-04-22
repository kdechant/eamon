import {Component,  OnInit}  from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';
import {AdventureService} from '../services/adventure.service';

@Component({
  template: `
  <p>You are the mighty {{ _playerService.current_player?.name }}</p>
  <p>Go on an adventure:</p>
  <p class="adventure"
    *ngFor="#adv of _adventureService.adventures"><a href="/adventure/{{adv.slug}}">{{adv.name}}</a></p>
  `,
})
export class PlayerDetailComponent implements OnInit  {

  constructor(
    private _router: Router,
    private _routeParams: RouteParams,
    private _adventureService: AdventureService,
    private _playerService: PlayerService) {}

  ngOnInit() {
    let id = this._routeParams.get('id');
    this._playerService.getPlayer(Number(id));

    this._adventureService.getList();

    window.localStorage.setItem('player_id', id);

  }

  gotoList() {
    this._router.navigate(['PlayerList']);
  }
}
