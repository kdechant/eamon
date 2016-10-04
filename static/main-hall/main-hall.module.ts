import {NgModule, CUSTOM_ELEMENTS_SCHEMA}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule}    from '@angular/forms';
import {HttpModule} from '@angular/http';

import {MainHallComponent} from "./components/main-hall.component";
import {AdventureListComponent} from "./components/adventure-list.component";
import {PlayerListComponent} from "./components/player-list.component";
import {PlayerAddComponent} from "./components/player-add.component";
import {PlayerDetailComponent} from "./components/player-detail.component";
import {BankComponent} from "./components/bank.component";
import {ShopComponent} from "./components/shop.component";
import {WizardComponent} from "./components/wizard.component";
import {StatusComponent} from "./components/status.component";

import {PlayerService} from "./services/player.service";
import {AdventureService} from "./services/adventure.service";
import {ShopService} from "./services/shop.service";
import {routing} from './main-hall.routing';

@NgModule({
  imports: [BrowserModule, FormsModule, HttpModule, routing],
  declarations: [
    MainHallComponent,
    AdventureListComponent,
    PlayerListComponent,
    PlayerAddComponent,
    PlayerDetailComponent,
    BankComponent,
    ShopComponent,
    StatusComponent,
    WizardComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [MainHallComponent],
  providers: [PlayerService, AdventureService, ShopService]
})
export class MainHallModule {
}
