import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {PlayerListComponent} from './components/player-list.component';
import {PlayerDetailComponent} from './components/player-detail.component';
import {PlayerAddComponent} from './components/player-add.component';
import {AdventureListComponent} from "./components/adventure-list.component";
import {ShopComponent} from "./components/shop.component";
import {WizardComponent} from "./components/wizard.component";
import {BankComponent} from "./components/bank.component";

const appRoutes: Routes = [
  {path: '', component: PlayerListComponent},
  {path: 'player/add', component: PlayerAddComponent},
  {path: 'player/:id', component: PlayerDetailComponent},
  {path: 'player/:id/adventure', component: AdventureListComponent},
  {path: 'player/:id/bank', component: BankComponent},
  {path: 'player/:id/shop', component: ShopComponent},
  {path: 'player/:id/wizard', component: WizardComponent},
  {path: '**', component: PlayerListComponent},
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
