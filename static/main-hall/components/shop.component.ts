import {Component,  OnInit}  from '@angular/core';
import {RouteParams, Router} from '@angular/router-deprecated';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';
import {AdventureService} from '../services/adventure.service';
import {StatusComponent} from "../components/status.component";

@Component({
  template: `
  <h4>Marcos Cavielli's Weapons and Armour Shoppe</h4>
  <p><a (click)="gotoDetail()">Back to Main Hall</a></p>
  `,
})
export class ShopComponent implements OnInit  {

  constructor(
    private _router: Router,
    private _routeParams: RouteParams) {}

  ngOnInit() {
    let id = this._routeParams.get('id');
  }

  gotoDetail() {
    this._router.navigate(['PlayerDetail']);
  }
}
