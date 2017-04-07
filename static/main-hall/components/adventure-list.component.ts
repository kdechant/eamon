import {Component, OnInit}  from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {Player} from '../models/player';
import {AdventureService} from '../services/adventure.service';
import {StatusComponent} from "../components/status.component";
import {PlayerService} from "../services/player.service";
import {Adventure} from "../models/adventure";

@Component({
  template: `
  <h2><img src="/static/images/ravenmore/128/map.png"> Go on an adventure</h2>
  <p>Eamon contains many different adventures of many different styles. Some are fantasy or sci-fi, contain a quest or just hack-and-slash. Some are aimed at beginners and others are for veteran adventurers only. Choose your fate and perish (or profit)...</p>
  <div class="row">
    <div class="adventure-list-item col-sm-6"
      *ngFor="let adv of _adventureService.adventures">
      <h3><a (click)="gotoAdventure(adv)">{{adv.name}}</a></h3>
      <p *ngIf="adv.authors.length > 0">By: {{adv.authors}}</p>
      <p>{{adv.description}}</p>
      <p *ngIf="adv.tags.length > 0">Tags: {{adv.tags}}</p>
    </div>
  </div>
  <button class="btn"><a (click)="gotoDetail()">Go back to Main Hall</a></button>
  `,
})
export class AdventureListComponent implements OnInit {

  constructor(private _router: Router,
              private _adventureService: AdventureService,
              private _playerService: PlayerService) {
  }

  ngOnInit() {
    this._adventureService.getList();

    let id = parseInt(window.localStorage.getItem('player_id'));
    this._playerService.getPlayer(id);

  }

  gotoAdventure(adv: Adventure) {
    this._playerService.update().subscribe(
      data => {
        window.location.href = '/adventure/' + adv.slug;
      }
    );
  }

  gotoDetail() {
    this._router.navigate(['/hall']);
  }
}
