import {bootstrap}    from "angular2/platform/browser";
import {HTTP_PROVIDERS} from "angular2/http";
import "rxjs/add/operator/map";
import {CoreComponent} from "./core.component";

import {GameLoaderService} from "./services/game-loader.service";

bootstrap(CoreComponent, [
  HTTP_PROVIDERS,
  GameLoaderService
]);
