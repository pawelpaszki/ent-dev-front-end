import {Routes} from '@angular/router';
import {StocksComponent} from './stocks/stocks.component';
import {AuthComponent} from './login/authview.component';
import {OnAuthRouteActivator} from './shared/onAuthRouteActivator';
import {SoldComponent} from './sold/sold.component';
import {BuyComponent} from './buy/buy.component';

export const appRoutes: Routes = [
  { path: 'stocks', component: StocksComponent, canActivate: [OnAuthRouteActivator] },
  { path: 'sold', component: SoldComponent, canActivate: [OnAuthRouteActivator] },
  { path: 'buy', component: BuyComponent, canActivate: [OnAuthRouteActivator] },
  { path: 'login', component: AuthComponent},
  { path: '**', redirectTo: 'login' },
];
