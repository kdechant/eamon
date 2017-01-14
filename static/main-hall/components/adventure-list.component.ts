import {Component, OnInit}  from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {Player} from '../models/player';
import {AdventureService} from '../services/adventure.service';
import {StatusComponent} from "../components/status.component";
import {PlayerService} from "../services/player.service";
import {Adventure} from "../models/adventure";

@Component({
  template: `
  <p class="adventure"
    *ngFor="let adv of _adventureService.adventures"><a (click)="gotoAdventure(adv)">{{adv.name}}</a></p>
  <h2><img src="/static/images/ravenmore/128/map.png"> Go on an adventure</h2>
  <p>Eamon contains many different adventures of many different styles. Some are fantasy or sci-fi, contain a quest or just hack-and-slash. Some are aimed at beginners and others are for veteran adventurers only. Choose your fate and perish (or profit)...</p>
  <button class="btn"><a (click)="gotoDetail()">Go back to Main Hall</a></button>
  `,
})
export class AdventureListComponent implements OnInit {

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _adventureService: AdventureService,
              private _playerService: PlayerService) {
  }

  ngOnInit() {
    this._adventureService.getList();

    let id = Number(this._route.snapshot.params['id']);
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
    this._router.navigate(['/player', this._playerService.player.id]);
  }
}
