import {NgModule, CUSTOM_ELEMENTS_SCHEMA}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule}    from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AdventureComponent} from "./components/adventure.component";

import {GameLoaderService} from "./services/game-loader.service";
import {CommandPromptComponent} from "./components/command.component";
import {HistoryComponent} from "./components/history.component";
import {ArtifactComponent} from "./components/artifact.component";
import {SellItemsComponent} from "./components/sell-items.component";
import {HintsComponent} from "./components/hints.component";
import {StatusComponent} from "./components/status.component";

@NgModule({
  imports: [BrowserModule, FormsModule, HttpModule],
  declarations: [
    AdventureComponent,
    ArtifactComponent,
    CommandPromptComponent,
    HistoryComponent,
    SellItemsComponent,
    HintsComponent,
    StatusComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AdventureComponent],
  providers: [GameLoaderService]
})
export class AdventureModule {
}
