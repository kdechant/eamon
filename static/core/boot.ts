import {bootstrap}    from "angular2/platform/browser";
import {HTTP_PROVIDERS} from "angular2/http";
import "rxjs/add/operator/map";
import {AdventureComponent} from "./components/adventure.component";

import {GameLoaderService} from "./services/game-loader.service";

bootstrap(AdventureComponent, [
  HTTP_PROVIDERS,
  GameLoaderService
]);
