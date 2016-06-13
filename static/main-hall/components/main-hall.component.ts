import {Component, OnInit} from "@angular/core";
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

import {PlayerService} from "../services/player.service";

import {PlayerListComponent}     from './player-list.component';
import {PlayerDetailComponent}   from './player-detail.component';
import {PlayerAddComponent}   from './player-add.component';
import {Player} from "../models/player";

@Component({
  selector: "main-hall",
  template: `
<div class="container">
  <h1>{{game_title}}</h1>
  <router-outlet></router-outlet>
</div>
  `,
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
  {path: '/', name: 'PlayerList', component: PlayerListComponent},
  {path: '/player/:id/...', name: 'PlayerDetail', component: PlayerDetailComponent},
  {path: '/player/add', name: 'PlayerAdd', component: PlayerAddComponent},
])
export class MainHallComponent {

  public game_title = "The Angular World of Eamon";

}
