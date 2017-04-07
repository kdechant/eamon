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
  {path: 'register', component: PlayerAddComponent},
  {path: 'hall', component: PlayerDetailComponent},
  {path: 'adventure', component: AdventureListComponent},
  {path: 'bank', component: BankComponent},
  {path: 'shop', component: ShopComponent},
  {path: 'wizard', component: WizardComponent},
  {path: '**', component: PlayerListComponent},
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
