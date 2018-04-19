import {Component, OnInit} from '@angular/core';
import {Event, NavigationEnd, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html',
})

export class NavbarComponent implements OnInit {

  public token: string;

  constructor(public authService: AuthService, private router: Router) {

  }

  public ngOnInit() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.token = localStorage.getItem('authtoken');
        if (!this.token || this.token.length === 0) {
          this.router.navigate(['login']);
        }
      }
    });
  }
}
