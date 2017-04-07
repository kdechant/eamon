import {Component, OnInit}  from '@angular/core';
import {Router} from '@angular/router';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';

@Component({
  template: `
  <div class="col-sm-6">
    <p>You are in the main hall of the Guild of Free Adventurers. You can do the following:</p>
    <nav class="row icon-nav">
      <p class="col-xs-6 col-md-4"><a (click)="gotoAdventures()"><img src="/static/images/ravenmore/128/map.png"><br /> Go on an adventure</a></p>
      <p class="col-xs-6 col-md-4"><a (click)="gotoMarcos()"><img src="/static/images/ravenmore/128/axe2.png"><br /> Visit the weapons shop</a></p>
      <p class="col-xs-6 col-md-4"><a (click)="gotoHokas()"><img src="/static/images/ravenmore/128/tome.png"><br /> Find a wizard to teach you some spells</a></p>
      <p class="col-xs-6 col-md-4"><a (click)="gotoBank()"><img src="/static/images/ravenmore/128/coin.png"><br /> Find the banker to deposit or withdraw some gold</a></p>
      <p class="col-xs-6 col-md-4"><a (click)="leaveTheUniverse()"><img src="/static/images/ravenmore/128/x.png"><br /> Temporarily leave the universe</a></p>
    </nav>
    <router-outlet></router-outlet>
  </div>
  <div class="col-sm-6">
    <status [player]="_playerService.player"></status>
  </div>
  `
})
export class PlayerDetailComponent implements OnInit {
  player: Player;

  constructor(private _router: Router,
              private _playerService: PlayerService) {
  }

  ngOnInit() {
    let id = parseInt(window.localStorage.getItem('player_id'));
    this._playerService.getPlayer(id);
  }

  gotoAdventures() {
    this._router.navigate( ['/adventure'] );
  }

  gotoMarcos() {
    this._router.navigate( ['/shop'] );
  }

  gotoHokas() {
    this._router.navigate( ['/wizard']);
  }

  gotoBank() {
    this._router.navigate( ['/bank'] );
  }

  leaveTheUniverse() {
    this._playerService.log("leave");
    this._playerService.update().subscribe(
      data => {
        this._playerService.player = null;
        window.localStorage.removeItem('player_id');
        this._router.navigate( ['/'] );
      }
    );
  }

}
