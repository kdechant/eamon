import {Component,  OnInit} from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { UUID } from 'angular2-uuid';

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

  public ngOnInit(): void {
    // set a UUID for this browser. The user will only see players associated with their UUID.
    let token:string = window.localStorage.getItem('eamon_uuid');
    if (!token) {
      token = UUID.UUID();
      window.localStorage.setItem('eamon_uuid', token);
    }
  }

}
