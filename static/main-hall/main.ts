import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MainHallModule } from './main-hall.module';

const platform = platformBrowserDynamic();

platform.bootstrapModule(MainHallModule);