import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {IUser} from '../shared/user.model';
import {of} from 'rxjs/observable/of';
import {catchError, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable()
export class AuthService {
  public currentUser: IUser;

  constructor(private router: Router, private http: HttpClient) {

  }

  loginUser(email: string, password: string): Observable<any> {
    // this.loginAttempted = true;
    const loginInfo = { email, password };
      return this.http.post<any>('https://pawelpaszki-ent-dev.herokuapp.com/api/authenticate', loginInfo, httpOptions).pipe(
        tap((user: any) => this.currentUser = user.user,
          catchError(this.handleError<IUser>('login user'))),
      );

  }

  signUpUser(email: string, password: string): Observable<IUser> {
    // this.signupAttempted = true;
    const loginInfo = { email, password };
    return this.http.post<IUser>('https://pawelpaszki-ent-dev.herokuapp.com/api/signup', loginInfo, httpOptions).pipe(
      tap((user: IUser) =>
        catchError(this.handleError<IUser>('login user')))
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }

  logout() {
    this.currentUser = null;
    this.router.navigate(['login'])
  }
}
