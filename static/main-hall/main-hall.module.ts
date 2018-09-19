import {NgModule, CUSTOM_ELEMENTS_SCHEMA}      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule}    from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {
    SocialLoginModule,
    AuthServiceConfig,
    GoogleLoginProvider,
    FacebookLoginProvider,
} from "angular5-social-login";

import {DividePipe} from "./pipes/divide.pipe";
import {TitleCasePipe} from "./pipes/title-case.pipe";
import {PercentOrNonePipe} from "./pipes/percent-or-none.pipe";

import {MainHallComponent} from "./components/main-hall.component";
import {AdventureListComponent} from "./components/adventure-list.component";
import {PlayerListComponent} from "./components/player-list.component";
import {PlayerAddComponent} from "./components/player-add.component";
import {PlayerDetailComponent} from "./components/player-detail.component";
import {SavedGameTileComponent} from "./components/saved-game-tile.component";
import {BankComponent} from "./components/bank.component";
import {ShopComponent} from "./components/shop.component";
import {ArtifactTileComponent} from "./components/artifact-tile.component";
import {WitchComponent} from "./components/witch.component";
import {WizardComponent} from "./components/wizard.component";
import {StatusComponent} from "./components/status.component";

import {PlayerService} from "./services/player.service";
import {AdventureService} from "./services/adventure.service";
import {ShopService} from "./services/shop.service";
import {UuidService} from "./services/uuid.service";
import {routing} from './main-hall.routing';

// Configs
export function getAuthServiceConfigs() {
  let config = new AuthServiceConfig([
      {
        id: FacebookLoginProvider.PROVIDER_ID,
        provider: new FacebookLoginProvider("184221458976224")
      },
    ]
  );
  return config;
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    routing,
    CookieModule.forRoot(),
    NgbModule.forRoot(),
    SocialLoginModule
  ],
  declarations: [
    MainHallComponent,
    AdventureListComponent,
    PlayerListComponent,
    PlayerAddComponent,
    PlayerDetailComponent,
    SavedGameTileComponent,
    BankComponent,
    ShopComponent,
    ArtifactTileComponent,
    StatusComponent,
    WitchComponent,
    WizardComponent,
    DividePipe,
    PercentOrNonePipe,
    TitleCasePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [MainHallComponent],
  providers: [
    PlayerService,
    AdventureService,
    ShopService,
    UuidService,
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    }
  ]
})
export class MainHallModule {
}
