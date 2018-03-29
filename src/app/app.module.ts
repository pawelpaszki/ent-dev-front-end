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
import {BuyTabletopComponent} from './buy/buy.tabletop.component';
import {NavbarComponent} from './navbar/navbar.component';
import {SoldComponent} from './sold/sold.component';
import {BuyComponent} from './buy/buy.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';

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
    NavbarComponent,
    StocksComponent,
    SoldComponent,
    BuyComponent,
    TabletopComponent,
    BuyTabletopComponent
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
  providers: [OnAuthRouteActivator, AngularFireDatabase, AngularFireAuthModule, AuthService, AngularFireAuth, StocksService, ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
