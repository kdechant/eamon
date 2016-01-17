import {bootstrap}    from 'angular2/platform/browser'
import {AppComponent} from './app.component'

import {CommandParserService} from './services/command-parser.service'
import {HistoryService} from './services/history.service'
import {RoomService} from './services/room.service'
import {MonsterService} from './services/monster.service'
import {ArtifactService} from './services/artifact.service'

bootstrap(AppComponent, [
  CommandParserService,
  HistoryService,
  RoomService,
  MonsterService,
  ArtifactService
]);
