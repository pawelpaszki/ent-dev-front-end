import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import { DropdownModule } from 'angular-custom-dropdown';
import {AngularFireModule} from 'angularfire2';
import {AngularFireAuth, AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireDatabase} from 'angularfire2/database';
import {ToastrModule} from 'ngx-toastr';
import {AppComponent} from './app.component';
import {BuyComponent} from './buy/buy.component';
import {BuyTabletopComponent} from './buy/buy.tabletop.component';
import {AuthComponent} from './login/authview.component';
import {NavbarComponent} from './navbar/navbar.component';
import {appRoutes} from './routes';
import {AuthService} from './services/auth.service';
import {StocksService} from './services/stocks.service';
import {OnAuthRouteActivator} from './shared/onAuthRouteActivator';
import {SoldComponent} from './sold/sold.component';
import {StocksComponent} from './stocks/stocks.component';
import {TabletopComponent} from './stocks/tabletop.component';

const firebaseConfig = {
  apiKey: 'AIzaSyC6HpPLVT7kQrAAc1MwEJhG3RR5UHK4Ns4',
  authDomain: 'enterprise-dev.firebaseapp.com',
  databaseURL: 'https://enterprise-dev.firebaseio.com',
  messagingSenderId: '355883793119',
  projectId: 'enterprise-dev',
  storageBucket: 'enterprise-dev.appspot.com',
};

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    AuthComponent,
    NavbarComponent,
    StocksComponent,
    SoldComponent,
    BuyComponent,
    TabletopComponent,
    BuyTabletopComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    RouterModule.forRoot(appRoutes, { useHash: true }),
    DropdownModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    HttpClientModule,
    FormsModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    OnAuthRouteActivator,
    AngularFireDatabase,
    AngularFireAuthModule,
    AuthService,
    AngularFireAuth,
    StocksService
  ],
})
export class AppModule {
}
