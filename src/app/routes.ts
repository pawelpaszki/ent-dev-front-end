import {Routes} from '@angular/router';
import {BuyComponent} from './buy/buy.component';
import {AuthComponent} from './login/authview.component';
import {OnAuthRouteActivator} from './shared/onAuthRouteActivator';
import {SoldComponent} from './sold/sold.component';
import {StocksComponent} from './stocks/stocks.component';

export const appRoutes: Routes = [
  { path: 'stocks', component: StocksComponent, canActivate: [OnAuthRouteActivator] },
  { path: 'sold', component: SoldComponent, canActivate: [OnAuthRouteActivator] },
  { path: 'buy', component: BuyComponent, canActivate: [OnAuthRouteActivator] },
  { path: 'login', component: AuthComponent},
  { path: '**', redirectTo: 'stocks' },
];
