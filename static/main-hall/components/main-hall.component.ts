import {Component,  OnInit} from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { UUID } from 'angular2-uuid';

// Add the RxJS Observable operators we need in this app.
import '../rxjs-operators';

@Component({
  selector: "main-hall",
  template: `
<div class="container parchment">
  <router-outlet></router-outlet>
</div>
  `
})
export class MainHallComponent {

  public ngOnInit(): void {
    // set a UUID for this browser. The user will only see players associated with their UUID.
    let token:string = window.localStorage.getItem('eamon_uuid');
    if (!token) {
      token = UUID.UUID();
      window.localStorage.setItem('eamon_uuid', token);
    }
  }

}
