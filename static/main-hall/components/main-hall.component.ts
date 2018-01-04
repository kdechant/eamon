import {Component,  OnInit} from "@angular/core";
import {Routes, RouterModule, Router} from '@angular/router';

import {UuidService} from '../services/uuid.service';

// Add the RxJS Observable operators we need in this app.
import '../rxjs-operators';
import {PlayerService} from "../services/player.service";

@Component({
  selector: "main-hall",
  template: `
<div class="container-fluid">
  <div class="parchment">
    <div class="parchment-inner">
      <router-outlet></router-outlet>
    </div>
  </div>
</div>
  `
})
export class MainHallComponent {

  constructor(private uuid: UuidService) { }

  public ngOnInit(): void {
    // set a UUID for this browser. The user will only see players associated with their UUID.
    let token:string = window.localStorage.getItem('eamon_uuid');
    if (!token) {
      token = this.uuid.uuid();
      window.localStorage.setItem('eamon_uuid', token);
    }
  }

}
