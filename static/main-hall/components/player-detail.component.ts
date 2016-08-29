import {Component, OnInit}  from '@angular/core';
import {Router, ActivatedRoute, ROUTER_DIRECTIVES} from '@angular/router';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';
import {StatusComponent} from "../components/status.component";

@Component({
  template: `
  <div class="col-sm-6">
    <p>You are in the main hall of the Guild of Free Adventurers. You can do the following:</p>
    <nav class="row icon-nav">
      <p class="col-sm-4"><a (click)="gotoAdventures()"><img src="/static/images/ravenmore/128/map.png"> Go on an adventure</a></p>
      <p class="col-sm-4"><a (click)="gotoMarcos()"><img src="/static/images/ravenmore/128/axe2.png"> Visit the weapons shop</a></p>
      <p class="col-sm-4"><a (click)="gotoHokas()"><img src="/static/images/ravenmore/128/upg_wand.png"> Find a wizard to teach you some spells</a></p>
      <p class="col-sm-4"><a (click)="gotoBank()"><img src="/static/images/ravenmore/128/coin.png"> Find the banker to deposit or withdraw some gold</a></p>
      <p class="col-sm-4"><a (click)="leaveTheUniverse()"><img src="/static/images/ravenmore/128/x.png"> Temporarily leave the universe</a></p>
    </nav>
    <router-outlet></router-outlet>
  </div>
  <div class="col-sm-6">
    <status [player]="_playerService.player"></status>
  </div>
  `,
  directives: [StatusComponent, ROUTER_DIRECTIVES]
})
export class PlayerDetailComponent implements OnInit {
  player: Player;

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _playerService: PlayerService) {
  }

  ngOnInit() {
    let id = Number(this._route.snapshot.params['id']);
    this._playerService.getPlayer(id);
  }

  gotoAdventures() {
    this._router.navigate( ['/player', this._playerService.player.id, '/adventure'] );
  }

  gotoMarcos() {
    this._router.navigate( ['/player', this._playerService.player.id, '/shop'] );
  }

  gotoHokas() {
    this._router.navigate( ['/player', this._playerService.player.id, '/wizard'] );
  }

  gotoBank() {
    this._router.navigate( ['/player', this._playerService.player.id, '/bank'] );
  }

  leaveTheUniverse() {
    this._playerService.update().subscribe(
      data => {
        this._playerService.player = null;
        this._router.navigate( ['/'] );
      }
    );
  }

}
