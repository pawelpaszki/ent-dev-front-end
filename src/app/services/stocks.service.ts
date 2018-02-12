import { Injectable } from '@angular/core';
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

  constructor(private http: HttpClient, private authService: AuthService) {
    this.getSharePrices();
  }

  getSharePrices (): Observable<any[]> {
    return this.http.get<any[]>('https://scraper601.herokuapp.com/scrape/all', httpOptions)
      .pipe(
        tap(prices =>
          console.log(prices),
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

  sellStock (quantity: number, sellCosts: number, symbol: string, sellingPrice: number, totalQuantity: number) {
    const data = { quantity, sellCosts, symbol, sellingPrice, totalQuantity };
    return this.http.post<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/users/' + this.authService.currentUser._id + '/sell', data, httpOptions)
      .pipe(
        tap(user => this.authService.currentUser = user.user,
          catchError(this.handleError('reset user stock', [])))
      );
  }

  buyStock (symbol: string, purchasePrice: number, displayName: string, exchange: string, quantity: number) {
    const data = { symbol, purchasePrice, displayName, exchange, quantity };
    return this.http.post<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/users/' + this.authService.currentUser._id + '/buy', data, httpOptions)
      .pipe(
        tap(user => this.authService.currentUser = user.user,
          catchError(this.handleError('reset user stock', [])))
      );
  }

  getDefaultPrices (): Observable<any[]> {
    return this.http.get<any[]>('https://pawelpaszki-ent-dev.herokuapp.com/api/defaults/', httpOptions)
      .pipe(
        tap(defaults =>
          catchError(this.handleError('get default prices', [])))
      );
  }

  pushNewDefault(symbol: string, price: number, exchange: string, displayName: string) {
    const data = { symbol, price, exchange, displayName };
    return this.http.post<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/defaults/', data, httpOptions)
      .pipe(
        tap(data =>
          catchError(this.handleError('push new default', [])))
      );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}
