import {bootstrap}        from '@angular/platform-browser-dynamic';
import {ROUTER_PROVIDERS} from '@angular/router-deprecated';
import { HTTP_PROVIDERS } from '@angular/http';

// Add all operators (map, catch, etc.) to Observable
import 'rxjs/Rx';

import {MainHallComponent} from "./components/main-hall.component";

import {PlayerService} from "./services/player.service";
import {AdventureService} from "./services/adventure.service";

bootstrap(MainHallComponent, [
  HTTP_PROVIDERS,
  ROUTER_PROVIDERS,
  AdventureService,
  PlayerService
]);
