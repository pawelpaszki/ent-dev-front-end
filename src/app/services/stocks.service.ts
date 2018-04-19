import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, tap} from 'rxjs/operators';
import {AuthService} from './auth.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }),
};

@Injectable()
export class StocksService {

  public defaultPrices = [];

  constructor(private http: HttpClient, private authService: AuthService, private toastr: ToastrService) {
    this.getSharePrices();
  }

  public getSharePrices(): Observable<any[]> {
    return this.http.get<any[]>('https://scraper601.herokuapp.com/scrape/all', httpOptions)
      .pipe(
        tap((_) =>
          catchError(this.handleError('get prices', []))),
      );
  }

  public resetUserStock() {
    const token: string = localStorage.getItem('authtoken');
    const headers = new HttpHeaders({ 'x-access-token': token});
    return this.http.put<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/users/'
      + this.authService.currentUser._id + '/reset', {}, {headers})
      .pipe(
        tap((user) => this.authService.currentUser = user.user,
          catchError(this.handleError('reset user stock', []))),
      );
  }

  public sellStock(quantity: number, sellCosts: number, symbol: string, sellingPrice: number, totalQuantity: number) {
    const data = { quantity, sellCosts, symbol, sellingPrice, totalQuantity };
    const token: string = localStorage.getItem('authtoken');
    const headers = new HttpHeaders({ 'x-access-token': token});
    return this.http.post<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/users/' +
      this.authService.currentUser._id + '/sell', data, {headers})
      .pipe(
        tap((user) => this.authService.currentUser = user.user,
          catchError(this.handleError('sell user stock', []))),
      );
  }

  public sellAll(quantities: number[], sellCosts: number[], symbols: string[], sellingPrices: number[]) {
    const that = this;
    function sell(i, that) {
      if (i < quantities.length ) {
        that.sellStock(quantities[i], sellCosts[i], symbols[i], sellingPrices[i], quantities[i]).subscribe(() => {
          sell(i + 1, that);
        });
      } else {
        that.toastr.success('all shares sold', 'Success');
      }
    }
    sell(0, that);
  }

  public buyStock(symbol: string, purchasePrice: number, displayName: string, exchange: string, quantity: number) {
    const token: string = localStorage.getItem('authtoken');
    const headers = new HttpHeaders({ 'x-access-token': token});
    const data = { symbol, purchasePrice, displayName, exchange, quantity };
    return this.http.post<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/users/' +
      this.authService.currentUser._id + '/buy', data, {headers})
      .pipe(
        tap((user) => this.authService.currentUser = user.user,
          catchError(this.handleError('reset user stock', []))),
      );
  }

  public getDefaultPrices(): Observable<any[]> {
    return this.http.get<any[]>('https://pawelpaszki-ent-dev.herokuapp.com/api/defaults/', httpOptions)
      .pipe(
        tap((defaults) =>
          catchError(this.handleError('get default prices', []))),
      );
  }

  public pushNewDefault(symbol: string, price: number, exchange: string, displayName: string) {
    const data = { symbol, price, exchange, displayName };
    return this.http.post<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/defaults/', data, httpOptions)
      .pipe(
        tap((data) =>
          catchError(this.handleError('push new default', []))),
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}
