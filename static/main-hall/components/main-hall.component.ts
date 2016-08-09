import {Component} from "@angular/core";
import { ROUTER_DIRECTIVES }  from '@angular/router';

@Component({
  selector: "main-hall",
  template: `
<div class="page-border">&nbsp;</div>
<div class="container">
  <h1>{{game_title}}</h1>
  <router-outlet></router-outlet>
</div>
<div class="page-border">&nbsp;</div>
  `,
  directives: [ROUTER_DIRECTIVES]
})
export class MainHallComponent {

  public game_title = "The Angular World of Eamon";

}
