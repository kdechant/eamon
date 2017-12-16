import {NgModule, CUSTOM_ELEMENTS_SCHEMA}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule}    from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';

import {Nl2brPipe} from "./pipes/nl2br.pipe";
import {GameVarsPipe} from "./pipes/gamevars.pipe";

import {AdventureComponent} from "./components/adventure.component";

import {GameLoaderService} from "./services/game-loader.service";
import {LoggerService} from "./services/logger.service";
import {CommandPromptComponent} from "./components/command.component";
import {HistoryComponent} from "./components/history.component";
import {ArtifactComponent} from "./components/artifact.component";
import {SellItemsComponent} from "./components/sell-items.component";
import {HintsComponent} from "./components/hints.component";
import {CommandListComponent} from "./components/command-list.component";
import {StatusComponent} from "./components/status.component";

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule, FormsModule, HttpClientModule, CookieModule.forRoot()],
  declarations: [
    Nl2brPipe,
    GameVarsPipe,
    AdventureComponent,
    ArtifactComponent,
    CommandPromptComponent,
    HistoryComponent,
    SellItemsComponent,
    HintsComponent,
    CommandListComponent,
    StatusComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AdventureComponent],
  providers: [GameLoaderService, LoggerService]
})
export class AdventureModule {
}
