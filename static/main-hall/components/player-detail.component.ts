import {Component, OnInit}  from '@angular/core';
import {Router, ActivatedRoute, ROUTER_DIRECTIVES} from '@angular/router';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';
import {StatusComponent} from "../components/status.component";

@Component({
  template: `
  <div class="col-sm-4">
    <p>You are in the main hall of the Guild of Free Adventurers. You can do the following:</p>
    <nav>
      <p><a (click)="gotoAdventures()">Go on an adventure</a></p>
      <p><a (click)="gotoMarcos()">Visit the weapons shop</a></p>
      <p><a [routerLink]="['/']">Temporarily leave the universe</a></p>
    </nav>
    <router-outlet></router-outlet>
  </div>
  <div class="col-sm-8">
    <status [player]="player"></status>
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
    this._playerService.getPlayer(id).subscribe(
      data => {
        this.player = new Player();
        this.player.init(data);
        this.player.update();
      }
    );
  }

  gotoAdventures() {
    this._router.navigate( ['/player', this.player.id, '/adventure'] );
  }

  gotoMarcos() {
    this._router.navigate( ['/player', this.player.id, '/shop'] );
  }

}
