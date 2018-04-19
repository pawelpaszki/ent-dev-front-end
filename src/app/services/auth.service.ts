import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, tap} from 'rxjs/operators';
import {IUser} from '../shared/user.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};


@Injectable()
export class AuthService {
  public currentUser: IUser;

  constructor(private router: Router, private http: HttpClient) {

  }

  public loginUser(email: string, password: string): Observable<any> {
    // this.loginAttempted = true;
    const loginInfo = { email, password };
    return this.http.post<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/authenticate',
      loginInfo, httpOptions).pipe(
        tap((user: any) => this.currentUser = user.user,
          catchError(this.handleError<IUser>('login user'))),
      );
  }

  public getUser(id: string) {
    const token: string = localStorage.getItem('authtoken');
    const headers = new HttpHeaders({ 'x-access-token': token});
    return this.http.get<any[]>('https://pawelpaszki-ent-dev.herokuapp.com/api/users/' + id, {headers}).pipe(
      tap((user: any) => this.currentUser = user.user,
        catchError(this.handleError<IUser>('get user'))),
    );
  }

  public signUpUser(email: string, password: string): Observable<IUser> {
    // this.signupAttempted = true;
    const loginInfo = { email, password };
    return this.http.post<IUser>('https://pawelpaszki-ent-dev.herokuapp.com/api/signup', loginInfo, httpOptions).pipe(
      tap((user: IUser) =>
        catchError(this.handleError<IUser>('login user'))),
    );
  }

  public logout() {
    this.currentUser = null;
    localStorage.setItem('authtoken', '');
    localStorage.setItem('id', '');
    this.router.navigate(['login']);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }

}
