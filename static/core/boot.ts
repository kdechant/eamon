import {bootstrap}        from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import { disableDeprecatedForms, provideForms } from '@angular/forms';

// Add all operators (map, catch, etc.) to Observable
import 'rxjs/Rx';

import {AdventureComponent} from "./components/adventure.component";

import {GameLoaderService} from "./services/game-loader.service";

bootstrap(AdventureComponent, [
  HTTP_PROVIDERS,
  GameLoaderService,
  disableDeprecatedForms(),
  provideForms()
]);
