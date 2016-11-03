import {Component,  OnInit}  from '@angular/core';
import { Router } from '@angular/router';
import { Observable }     from 'rxjs/Observable';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';

@Component({
  template: `
  <p>You are in the outer chamber of the hall of the Guild of Free Adventurers. Many men and women are guzzling beer and there is loud singing and laughter.</p>
  <p>On the north side of the chamber is a cubbyhole with a desk. Over the desk is a sign which says: <strong>&quot;REGISTER HERE OR ELSE!&quot;</strong></p>
  <p>The guest book on the desk lists the following players:</p>
  <div class="row">
    <div class="player col-sm-4" *ngFor="let player of _playerService.players">
      <div class="icon"><img src="/static/images/ravenmore/128/{{ player.icon }}" width="64" height="64"></div>
      <div class="name"><a (click)="gotoPlayer(player)">{{player.name}}</a></div>
      <div class="delete"><a (click)="deletePlayer(player)"><span class="glyphicon glyphicon-trash"></span></a></div>
    </div>
  </div>
  <p class="addplayer"><a [routerLink]="['/player/add']">New Adventurer</a></p>
  `
})
export class PlayerListComponent implements OnInit  {

  constructor(
    private _router: Router,
    private _playerService: PlayerService){}

  public ngOnInit(): void {
    this._playerService.getList();
  }

  gotoPlayer(player: Player) {
    window.localStorage.setItem('player_id', String(player.id));
    this._router.navigate( ['/player', player.id] );
  }

  deletePlayer(player: Player) {
    if (confirm("Are you sure you want to delete " + player.name + "?")) {
      window.localStorage.setItem('player_id', null);
      this._playerService.delete(player).subscribe(
         data => {
           this._playerService.getList();
           return true;
         },
         error => {
           console.error("Error deleting player!");
           return Observable.throw(error);
         });
    }
  }
}
