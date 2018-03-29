import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Event, NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html'
})

export class NavbarComponent implements OnInit {

  public token: string;

  constructor(public authService: AuthService, private router: Router) {

  }

  public ngOnInit() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.token = localStorage.getItem('authtoken');
        if(!this.token || this.token.length === 0) {
          this.router.navigate(["login"]);
        }
      }
    });
  }
}
