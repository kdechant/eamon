import {bootstrap}    from 'angular2/platform/browser'
import {HTTP_PROVIDERS} from 'angular2/http';
import 'rxjs/add/operator/map';
import {AppComponent} from './app.component'

import {CommandParserService} from './services/command-parser.service'
import {HistoryService} from './services/history.service'
import {GameLoaderService} from './services/game-loader.service'

bootstrap(AppComponent, [
  HTTP_PROVIDERS,
  CommandParserService,
  HistoryService,
  GameLoaderService
]);
