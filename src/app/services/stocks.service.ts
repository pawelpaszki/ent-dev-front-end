import * as firebase from 'firebase/app';
import { Injectable } from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {AuthService} from './auth.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin':'*' })
};

@Injectable()
export class StocksService {

  public testStocksHeld: any;
  public testStocksSold: any;
  constructor(private db: AngularFireDatabase, private http: HttpClient, private authService: AuthService) {
    // this.testStocksHeld = this.db.object('users/1/testStocksHeld').valueChanges();
    // this.testStocksSold = this.db.object('users/1/testStocksSold').valueChanges();
    let testUser = firebase.database().ref('/users/1');
    testUser.once('value', (snapshot) => {
      if(snapshot.val().testStocksHeld !== null) {
        this.testStocksHeld = snapshot.val().testStocksHeld;
      }
      if(snapshot.val().testStocksSold !== null) {
        this.testStocksSold = snapshot.val().testStocksSold;
      }
    });
    this.getSharePrices();
  }

  getSharePrices (): Observable<any[]> {
    return this.http.get<any[]>('https://scraper601.herokuapp.com/scrape/all', httpOptions)
      .pipe(
        tap(prices =>
          catchError(this.handleError('get prices', [])))
      );
  }

  resetUserStock () {
    return this.http.put<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/users/' + this.authService.currentUser._id + '/reset', httpOptions)
      .pipe(
        tap(user => this.authService.currentUser = user.user,
          catchError(this.handleError('reset user stock', [])))
      );
  }

  // TODO change path to https://pawelpaszki-ent-dev.herokuapp.com
  sellStock (quantity: number, sellCosts: number, symbol: string, sellingPrice: number, totalQuantity: number) {
    const data = { quantity, sellCosts, symbol, sellingPrice, totalQuantity };
    return this.http.post<any>('http://localhost:8001/api/users/' + this.authService.currentUser._id + '/sell', data, httpOptions)
      .pipe(
        tap(user => this.authService.currentUser = user.user,
          catchError(this.handleError('reset user stock', [])))
      );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}
