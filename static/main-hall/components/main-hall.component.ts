import {Component} from "@angular/core";
import { Routes, RouterModule } from '@angular/router';

// Add the RxJS Observable operators we need in this app.
import '../rxjs-operators';

@Component({
  selector: "main-hall",
  template: `
<div class="page-border">&nbsp;</div>
<div class="container parchment">
  <h1>{{game_title}}</h1>
  <router-outlet></router-outlet>
</div>
<div class="page-border">&nbsp;</div>
  `
})
export class MainHallComponent {

  public game_title = "The Wonderful World of Eamon";

}
