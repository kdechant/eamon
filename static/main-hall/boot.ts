import {bootstrap}        from '@angular/platform-browser-dynamic';
import { APP_ROUTER_PROVIDERS } from './app.routes';
import { HTTP_PROVIDERS } from '@angular/http';
import { disableDeprecatedForms, provideForms } from '@angular/forms';

// Add all operators (map, catch, etc.) to Observable
import 'rxjs/Rx';

import {MainHallComponent} from "./components/main-hall.component";

import {PlayerService} from "./services/player.service";
import {AdventureService} from "./services/adventure.service";
import {ShopService} from "./services/shop.service";

bootstrap(MainHallComponent, [
  HTTP_PROVIDERS,
  APP_ROUTER_PROVIDERS,
  AdventureService,
  PlayerService,
  ShopService,
  disableDeprecatedForms(),
  provideForms()
])
.catch(err => console.error(err));
