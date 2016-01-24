import {bootstrap}    from 'angular2/platform/browser'
import {HTTP_PROVIDERS, Http, XHRBackend} from 'angular2/http';
import {AppComponent} from '../app.component'

import {CommandParserService} from '../services/command-parser.service'
import {HistoryService} from '../services/history.service'
import {GameLoaderService} from '../services/game-loader.service'

export var game_id = 'demo1';

bootstrap(AppComponent, [
  Http,
  XHRBackend,
  CommandParserService,
  HistoryService,
  GameLoaderService
]);
