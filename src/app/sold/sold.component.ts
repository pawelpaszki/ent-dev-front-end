import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-sold',
  templateUrl: './sold.component.html',
})

export class SoldComponent {

  public currencyMultiplier: number = 1;

  constructor(public authService: AuthService) {
    if (!this.authService.currentUser) {
      const id: string = localStorage.getItem('id');
      const token: string = localStorage.getItem('authtoken');
      if (id && token && id.length > 0 && token.length > 0) {
        this.authService.getUser(id).subscribe(() => {});
      }
    }
  }

  public getCost(quantity: number, purchasePrice: number) {
    return quantity * purchasePrice;
  }

  public getSellingValue(sellingPrice: number, quantity: number) {
    return sellingPrice * quantity;
  }

  public getSoldDetailGainLoss(purchasePrice: number, quantity: number, sellingPrice: number, sellingCosts: number) {
    const value: number = quantity * (sellingPrice - purchasePrice) - sellingCosts;
    return value;
  }

  public getSoldGainLossPercentage(sellingPrice: number, quantity: number,
                                   purchasePrice: number, sellingCosts: number) {
    return this.getSoldDetailGainLoss(
      purchasePrice, quantity, sellingPrice, sellingCosts) / (purchasePrice * quantity);
  }

  public getTotalSoldQuantity(symbol: string) {
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

  public getTotalSoldGainLoss(symbol: string) {
    let total = 0;
    if (this.authService.currentUser.stocksSold) {
      for (let i = 0; i < this.authService.currentUser.stocksSold.length; i++) {
        if (this.authService.currentUser.stocksSold[i].symbol === symbol) {
          for (let j = 0; j < this.authService.currentUser.stocksSold[i].shares.length; j++) {
            total += this.getSoldDetailGainLoss(
              this.authService.currentUser.stocksSold[i].shares[j].purchasePrice,
              this.authService.currentUser.stocksSold[i].shares[j].quantity,
              this.authService.currentUser.stocksSold[i].shares[j].sellingPrice,
              this.authService.currentUser.stocksSold[i].shares[j].sellingCosts);
          }
        }
      }
    }
    return total;
  }

}
