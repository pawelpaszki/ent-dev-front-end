import {Component} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-sold',
  templateUrl: './sold.component.html'
})

export class SoldComponent {

  currencyMultiplier: number = 1;

  constructor(public authService: AuthService) {
    if(!this.authService.currentUser) {
      const id: string = localStorage.getItem('id');
      const token: string = localStorage.getItem('authtoken');
      if(id && token && id.length > 0 && token.length > 0) {
        this.authService.getUser(id).subscribe(() =>{});
      }
    }
  }

  getCost(quantity: number, purchasePrice: number) {
    return quantity * purchasePrice;
  }

  getSellingValue(sellingPrice: number, quantity: number) {
    return sellingPrice * quantity;
  }

  getSoldDetailGainLoss(purchasePrice: number, quantity: number, sellingPrice: number, sellingCosts: number) {
    const value: number = quantity * (sellingPrice - purchasePrice) - sellingCosts;
    return value;
  }

  getSoldGainLossPercentage(sellingPrice: number, quantity: number, purchasePrice: number, sellingCosts: number) {
    return this.getSoldDetailGainLoss(purchasePrice, quantity, sellingPrice, sellingCosts) / (purchasePrice * quantity);
  }

  getTotalSoldQuantity(symbol: string) {
    let total = 0;
    if (this.authService.currentUser.stocksSold) {
      for (let i = 0; i < this.authService.currentUser.stocksSold.length; i++) {
        if (this.authService.currentUser.stocksSold[i].symbol === symbol) {
          for (let j = 0; j < this.authService.currentUser.stocksSold[i].shares.length; j++) {
            total += this.authService.currentUser.stocksSold[i].shares[j].quantity;
          }
        }
      }
    }
    return total;
  }

  getTotalSoldGainLoss(symbol: string) {
    let total = 0;
    if(this.authService.currentUser.stocksSold) {
      for (let i = 0; i < this.authService.currentUser.stocksSold.length; i++) {
        if (this.authService.currentUser.stocksSold[i].symbol === symbol) {
          for (let j = 0; j < this.authService.currentUser.stocksSold[i].shares.length; j++) {
            total += this.getSoldDetailGainLoss(this.authService.currentUser.stocksSold[i].shares[j].purchasePrice, this.authService.currentUser.stocksSold[i].shares[j].quantity,
              this.authService.currentUser.stocksSold[i].shares[j].sellingPrice, this.authService.currentUser.stocksSold[i].shares[j].sellingCosts);
          }
        }
      }
    }
    return total;
  }

}
