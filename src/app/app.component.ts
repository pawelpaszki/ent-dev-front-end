import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  connected: any;

  // constructor(private af: AngularFireDatabase) {
  //   this.af.object('connected').valueChanges().subscribe(result => {
  //     this.connected = result;
  //   });
  // }

  constructor() {

  }
}
