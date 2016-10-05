import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AdventureModule } from './adventure.module';

const platform = platformBrowserDynamic();

platform.bootstrapModule(AdventureModule);
