import {Routes} from '@angular/router';
import {StocksComponent} from './stocks/stocks.component';
import {AuthComponent} from './login/authview.component';
import {OnAuthRouteActivator} from './shared/onAuthRouteActivator';

export const appRoutes: Routes = [
  { path: 'stocks', component: StocksComponent, canActivate: [OnAuthRouteActivator] },
  { path: 'login', component: AuthComponent},
  { path: '**', redirectTo: 'stocks', canActivate: [OnAuthRouteActivator] },
];
