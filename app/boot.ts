import {bootstrap}    from 'angular2/platform/browser'
//import {Http, Response, ConnectionBackend} from 'angular2/http';
import {AppComponent} from './app.component'

import {CommandParserService} from './services/command-parser.service'
import {HistoryService} from './services/history.service'
import {GameLoaderService} from './services/game-loader.service'

bootstrap(AppComponent, [
//  Http,
//  ConnectionBackend,
  CommandParserService,
  HistoryService,
  GameLoaderService
]);
