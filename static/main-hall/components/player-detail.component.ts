import {Component,  OnInit}  from '@angular/core';
import {RouteParams, Router} from '@angular/router-deprecated';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';
import {AdventureService} from '../services/adventure.service';
import {StatusComponent} from "../components/status.component";

@Component({
  template: `
  <p>You are the mighty {{ _playerService.current_player?.name }}</p>
  <div class="col-sm-4">
    <p>Go on an adventure:</p>
    <p class="adventure"
      *ngFor="#adv of _adventureService.adventures"><a href="/adventure/{{adv.slug}}">{{adv.name}}</a></p>
  </div>
  <div class="col-sm-8">
    <status [player]="_playerService.current_player"></status>
  </div>
  `,
  directives: [StatusComponent]
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
