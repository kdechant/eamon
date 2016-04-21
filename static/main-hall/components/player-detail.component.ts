import {Component,  OnInit}  from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';

@Component({
  template: `
  <p>You are the mighty {{ _playerService.current_player?.name }}</p>
  `,
})
export class PlayerDetailComponent implements OnInit  {

  constructor(
    private _router: Router,
    private _routeParams: RouteParams,
    private _playerService: PlayerService) {}

  ngOnInit() {
    let id = this._routeParams.get('id');
    this._playerService.getPlayer(id);
  }

  gotoList() {
    this._router.navigate(['PlayerList']);
  }
}
