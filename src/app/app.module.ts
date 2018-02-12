import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AngularFireModule} from 'angularfire2'
import { DropdownModule } from 'angular-custom-dropdown';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {AngularFireDatabase} from 'angularfire2/database';
import {AuthService} from './services/auth.service';
import {AngularFireAuth, AngularFireAuthModule} from 'angularfire2/auth';
import {AuthComponent} from './login/authview.component';
import {TabletopComponent} from './stocks/tabletop.component';
import {StocksComponent} from './stocks/stocks.component';
import {RouterModule} from '@angular/router';
import {appRoutes} from './routes';
import {OnAuthRouteActivator} from './shared/onAuthRouteActivator';
import {StocksService} from './services/stocks.service';
import {HttpClientModule} from '@angular/common/http';
import {BuyTabletopComponent} from './stocks/buy.tabletop.component';

const firebaseConfig = {
  apiKey: 'AIzaSyC6HpPLVT7kQrAAc1MwEJhG3RR5UHK4Ns4',
  authDomain: 'enterprise-dev.firebaseapp.com',
  databaseURL: 'https://enterprise-dev.firebaseio.com',
  projectId: 'enterprise-dev',
  storageBucket: 'enterprise-dev.appspot.com',
  messagingSenderId: '355883793119'
};

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    StocksComponent,
    TabletopComponent,
    BuyTabletopComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { useHash: true }),
    DropdownModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    HttpClientModule,
    FormsModule
  ],
  providers: [OnAuthRouteActivator, AngularFireDatabase, AngularFireAuthModule, AuthService, AngularFireAuth, StocksService, ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
