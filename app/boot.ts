import {bootstrap}    from 'angular2/platform/browser'
import {AppComponent} from './app.component'
import {CommandParserService} from './services/command-parser.service'

bootstrap(AppComponent, [CommandParserService]);
