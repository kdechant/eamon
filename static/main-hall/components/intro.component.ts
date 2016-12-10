import {Component,  OnInit}  from '@angular/core';
import { Router } from '@angular/router';

@Component({
  template: `
  <div class="row">
    <div class="col-sm-6">
      <h2>Welcome to EAMON!</h2>
      <p class="lead">Computerized fantasy role-playing system. Looting dungeons and slaying dragons for fun and profit!<p>
      <p class="addplayer"><a [routerLink]="['/players']"><img src="/static/images/ravenmore/128/map.png"> Enter the Main Hall</a></p>
      <p><small>Based on the Eamon Adventure Series, written by Donald Brown for the Apple ][, and on Eamon Deluxe by Frank Black.</small></p>
    </div>
    <div class="col-sm-6 text-center">
      <img src="/static/images/Eamon_dragon_NEUC.png" width="375">    
    </div>
  </div>
  `
})
export class IntroComponent {

  constructor(
    private _router: Router){}

}
