import {bootstrap}    from 'angular2/platform/browser'
import {AppComponent} from './app.component'
import {CommandParserService} from './command-parser.service'

bootstrap(AppComponent, [CommandParserService]);
