import {bootstrap}    from 'angular2/platform/browser'
import {AppComponent} from './app.component'

import {CommandParserService} from './services/command-parser.service'
import {HistoryService} from './services/history.service'
import {RoomService} from './services/room.service'

bootstrap(AppComponent, [
  CommandParserService,
  HistoryService,
  RoomService
]);
