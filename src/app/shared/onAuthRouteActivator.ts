import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Injectable()
export class OnAuthRouteActivator implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {

  }

  public canActivate(route: ActivatedRouteSnapshot) {
    return this.authService.currentUser !== null;
  }
}
