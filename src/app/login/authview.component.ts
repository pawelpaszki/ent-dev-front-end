import {Component, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from '@angular/router';

@Component({
  selector: 'app-authview',
  templateUrl: './authview.component.html',
  styleUrls: ['./authview.component.css']
})
export class AuthComponent implements OnInit {

  authForm: FormGroup;
  email: FormControl;
  password: FormControl;
  private authAttempted: boolean;
  public authAction = 'login';

  constructor (public authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    this.password = new FormControl("", [Validators.required, Validators.minLength(6)]);
    this.email = new FormControl("", [Validators.required, Validators.pattern("[A-Za-z0-9]*@{1}[A-Za-z0-9]{2,10}.{1}[A-Za-z]{2,10}")]);
    this.authForm = new FormGroup({
      password: this.password,
      email: this.email
    });
  }

  authenticate(formValues) {
    this.authAttempted = true;
    if (this.authAction === "login") {
      if (this.email.valid && this.password.valid) {
        console.log("login", formValues);
        this.authService.loginUser(formValues.email, formValues.password).subscribe((resp) => {
          console.log(resp);
          this.router.navigate(["stocks"]);
        });
      }
    } else {
      console.log("signup", formValues);
      if (this.authForm.valid) {
        console.log("signup", formValues);
        this.authService.signUpUser(formValues.email, formValues.password).subscribe((resp) => {
          if (!resp) {
            console.log("not signed up");
          } else {
            this.authService.loginUser(formValues.email, formValues.password).subscribe((resp) => {
              if (!resp) {
                console.log("unauthenticated");
              } else {
                console.log(this.authService.currentUser);
                this.router.navigate(["stocks"]);
              }
            });
          }
        });
      }
    }
  }

  invalidEmail() {
    return (!this.email.valid && !this.email.untouched) || (this.authAttempted == true && this.email.value == "");
  }
  invalidPassword() {
    return (!this.password.valid && !this.password.untouched) || (this.authAttempted == true && this.password.value == "");
  }

  setAuthAction(value) {
    this.authAction = value;
  }
}
