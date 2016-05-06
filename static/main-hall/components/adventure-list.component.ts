import {Component,  OnInit}  from '@angular/core';
import {RouteParams, Router} from '@angular/router-deprecated';

import {Player} from '../models/player';
import {AdventureService} from '../services/adventure.service';
import {StatusComponent} from "../components/status.component";

@Component({
  template: `
  <h4>Go on an adventure</h4>
  <p class="adventure"
    *ngFor="let adv of _adventureService.adventures"><a href="/adventure/{{adv.slug}}">{{adv.name}}</a></p>
  <p><a (click)="gotoDetail()">Back to Main Hall</a></p>
  `,
  directives: [StatusComponent]
})
export class AdventureListComponent implements OnInit  {

  constructor(
    private _adventureService: AdventureService) {}

  ngOnInit() {
    this._adventureService.getList();
  }

  gotoDetail() {
    this._router.navigate(['PlayerDetail']);
  }
}
