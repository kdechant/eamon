import { provideRouter }  from '@angular/router';

import {PlayerListComponent} from './components/player-list.component';
import {PlayerDetailComponent} from './components/player-detail.component';
import {PlayerAddComponent} from './components/player-add.component';
import {AdventureListComponent} from "./components/adventure-list.component";
import {ShopComponent} from "./components/shop.component";

export const routes = [
  {path: '', component: PlayerListComponent},
  {path: 'player/add', component: PlayerAddComponent},
  {path: 'player/:id', component: PlayerDetailComponent},
  {path: 'player/:id/adventure', component: AdventureListComponent},
  {path: 'player/:id/shop', component: ShopComponent},
  {path: '**', component: PlayerListComponent},
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes),
];
