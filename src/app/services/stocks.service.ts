import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {AuthService} from './auth.service';
import {IDefaultPriceModel} from '../stocks/default.price.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin':'*' })
};

@Injectable()
export class StocksService {

  defaultPrices = [];
  livePricesRaw: any = [];
  livePricesFormatted: IDefaultPriceModel[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {
    this.getSharePrices();
  }

  getSharePrices (): Observable<any[]> {
    return this.http.get<any[]>('https://scraper601.herokuapp.com/scrape/all', httpOptions)
      .pipe(
        tap((_) =>
          catchError(this.handleError('get prices', [])))
      );
  }

  resetUserStock () {
    const token: string = localStorage.getItem('authtoken');
    const headers = new HttpHeaders({ 'x-access-token': token});
    return this.http.put<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/users/' + this.authService.currentUser._id + '/reset', {},{headers})
      .pipe(
        tap(user => this.authService.currentUser = user.user,
          catchError(this.handleError('reset user stock', [])))
      );
  }

  sellStock (quantity: number, sellCosts: number, symbol: string, sellingPrice: number, totalQuantity: number) {
    const data = { quantity, sellCosts, symbol, sellingPrice, totalQuantity };
    const token: string = localStorage.getItem('authtoken');
    const headers = new HttpHeaders({ 'x-access-token': token});
    return this.http.post<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/users/' + this.authService.currentUser._id + '/sell', data, {headers})
      .pipe(
        tap(user => this.authService.currentUser = user.user,
          catchError(this.handleError('reset user stock', [])))
      );
  }

  buyStock (symbol: string, purchasePrice: number, displayName: string, exchange: string, quantity: number) {
    const token: string = localStorage.getItem('authtoken');
    const headers = new HttpHeaders({ 'x-access-token': token});
    const data = { symbol, purchasePrice, displayName, exchange, quantity };
    return this.http.post<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/users/' + this.authService.currentUser._id + '/buy', data, {headers})
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
