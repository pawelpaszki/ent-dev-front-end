import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-authview',
  styleUrls: ['./authview.component.css'],
  templateUrl: './authview.component.html',
})
export class AuthComponent implements OnInit {

  public authForm: FormGroup;
  public email: FormControl;
  public password: FormControl;
  public invalidCredentials: boolean = false;
  public authAction = 'login';
  public loading: boolean = false;
  private authAttempted: boolean;


  constructor(public authService: AuthService, private router: Router, private toastr: ToastrService) {
  }

  public ngOnInit() {
    this.password = new FormControl('', [Validators.required, Validators.minLength(6)]);
    this.email = new FormControl('',
      [Validators.required, Validators.pattern('[A-Za-z0-9]*@{1}[A-Za-z0-9]{2,10}.{1}[A-Za-z]{2,10}')]);
    this.authForm = new FormGroup({
      email: this.email,
      password: this.password,
    });
  }

  public authenticate(formValues) {
    this.authAttempted = true;
    this.loading = true;
    if (this.authAction === 'login') {
      if (this.email.valid && this.password.valid) {
        this.authService.loginUser(formValues.email, formValues.password).subscribe((resp) => {
          this.loading = false;
          localStorage.setItem('id', resp.user._id);
          localStorage.setItem('authtoken', resp.token);
          this.router.navigate(['stocks']);
        },
          (error) => {
            this.toastr.error('Invalid credentials provided');
            this.invalidCredentials = true;
            this.loading = false;
          });
      }
    } else {
      if (this.authForm.valid) {
        this.authService.signUpUser(formValues.email, formValues.password).subscribe((resp) => {
          if (!resp) {
            console.log('not signed up');
            this.loading = false;
          } else {
            this.authService.loginUser(formValues.email, formValues.password).subscribe((resp) => {
              if (!resp) {
                console.log('unauthenticated');
                this.toastr.error('Unable to register with credentials provided');
                this.loading = false;
              } else {
                this.loading = false;
                localStorage.setItem('id', resp.user._id);
                localStorage.setItem('authtoken', resp.token);
                this.router.navigate(['stocks']);
              }
            });
          }
        },
          (error) => {
            this.toastr.error('Unable to sign up. Email taken');
            this.invalidCredentials = true;
            this.loading = false;
          });
      }
    }
  }

  public invalidEmail() {
    return (!this.email.valid && !this.email.untouched) || (this.authAttempted === true && this.email.value === '');
  }
  public invalidPassword() {
    return (!this.password.valid && !this.password.untouched) ||
      (this.authAttempted === true && this.password.value === '');
  }

  public invalidInput() {
    return this.email.value === '' || this.password.value === '' || this.invalidPassword() || this.invalidEmail();
  }

  public setAuthAction(value) {
    this.authAction = value;
  }
}
