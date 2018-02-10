import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {DecimalPipe} from '@angular/common';
import {IDefaultPriceModel} from './default.price.model';
//import {PriceScraperService} from '../common/pricescraper.service';
import {TabletopComponent} from './tabletop.component';
import {StocksService} from '../services/stocks.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {IShareModel} from './share.model';
import {IStockModel} from './stock.model';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent {

  stocksHeld? = [];
  stocksSold? = [];
  currency: string = 'EUR';
  caseScenario: string = 'Reset Original';
  caseMultiplier = 1;
  currencyMultiplier = 1;
  holdingsVisible: boolean = true;
  soldVisible: boolean = true;
  cash: number = 100;
  mode: string = 'test mode';
  email: string;
  livePricesRaw: any = [];
  livePricesFormatted: IDefaultPriceModel[] = [];
  stockForSaleSymbol: string;
  sellForm: FormGroup;
  quantity: FormControl;

  defaultPrices: IDefaultPriceModel[] = [
    new IDefaultPriceModel('AIBG.I', 5, 'ise', 'AIB GROUP PLC'),
    new IDefaultPriceModel('BIRG.I', 4, 'ise', 'BK IRE GRP PLC'),
    new IDefaultPriceModel('CRH.I', 30, 'ise', 'CRH PLC'),
    new IDefaultPriceModel('TSCO', 4.5, 'ftse', 'Tesco'),
    new IDefaultPriceModel('ripple-xrp', 2, 'coinranking', 'Ripple'),
  ];

  constructor(public authService: AuthService, private router: Router, public stocksService: StocksService) {
    if(this.authService.currentUser && this.authService.currentUser !== null && this.authService.currentUser.holdings && this.authService.currentUser.holdings !== null) {
      this.stocksHeld = authService.currentUser.holdings;
      this.stocksSold = authService.currentUser.stocksSold;
      this.quantity = new FormControl("", [Validators.min(1), Validators.max(this.getTotalQuantity(this.stockForSaleSymbol))]);
      this.sellForm = new FormGroup({
        quantity: this.quantity
      });
      this.email = this.authService.currentUser.email;
    }
    this.getPricesFromServer();
  }

  resetStock() {
    this.stocksService.resetUserStock().subscribe((resp) => {
      console.log(resp);
      if(resp.user.holdings && resp.user.holdings !== null) {
        this.stocksHeld = resp.user.holdings;
      }
      if(resp.user.stocksSold && resp.user.stocksSold !== null) {
        this.stocksSold = resp.user.stocksSold;
      }
    });
  }

  invalidQuantity() {
    return !this.quantity.valid && !this.quantity.untouched;
  }

  setStockForSale(symbol: string) {
    this.stockForSaleSymbol = symbol;
    this.quantity.clearValidators();
    this.quantity.setValidators([Validators.min(1), Validators.max(this.getTotalQuantity(this.stockForSaleSymbol))]);
  }

  sellShares(formValue) {

    if(!this.invalidQuantity()) {
      this.stocksService.sellStock(formValue.quantity, this.getSellingCosts(this.stockForSaleSymbol, formValue.quantity), this.stockForSaleSymbol, this.getDefaultPrice(this.stockForSaleSymbol),this.getTotalQuantity(this.stockForSaleSymbol)).subscribe((resp) => {
        console.log(resp);
        if(resp.user.holdings && resp.user.holdings !== null) {
          this.stocksHeld = resp.user.holdings;
        }
        if(resp.user.stocksSold && resp.user.stocksSold !== null) {
          this.stocksSold = resp.user.stocksSold;
        }
      });
      // let removeStock: boolean = false;
      // for(let stock of this.stocksHeld) {
      //   if(stock.symbol === this.stockForSaleSymbol) {
      //     let quantityToSell: number = formValue.quantity;
      //     const exchange = stock.exchange;
      //     const displayName = stock.displayName;
      //     let sharesBeingSold: IShareModel[] = [];
      //     let sharesAfterSale: IShareModel[] = [];
      //     let saleDate = new Date();
      //     let quantitySold = 0;
      //     let totalSellingCosts = this.getSellingCosts(this.stockForSaleSymbol, quantityToSell);
      //     let quantity = 0;
      //     let sellingCosts: number;
      //     for(let j = 0; j < stock.shares.length; j++) {
      //       if(quantityToSell - quantitySold > 0) {
      //         if(quantityToSell - quantitySold >= stock.shares[j].quantity) {
      //           quantity = stock.shares[j].quantity;
      //           sellingCosts = Math.round(totalSellingCosts * stock.shares[j].quantity / quantityToSell * 100) / 100;
      //           sharesBeingSold.push(new IShareModel(stock.shares[j].dateIn,
      //             saleDate, stock.shares[j].purchasePrice,
      //             stock.shares[j].quantity, sellingCosts, this.getDefaultPrice(stock.symbol)));
      //         } else {
      //           quantity = quantityToSell - quantitySold;
      //           sellingCosts = Math.round(totalSellingCosts * quantity / quantityToSell * 100) / 100;
      //           sharesBeingSold.push(new IShareModel(stock.shares[j].dateIn,
      //             saleDate, stock.shares[j].purchasePrice,
      //             quantity, sellingCosts, this.getDefaultPrice(stock.symbol)));
      //           sharesAfterSale.push(new IShareModel(stock.shares[j].dateIn,
      //             null, stock.shares[j].purchasePrice,
      //             stock.shares[j].quantity - quantity, 0, this.getDefaultPrice(stock.symbol)));
      //
      //         }
      //         quantitySold += quantity;
      //       } else {
      //         sharesAfterSale.push(new IShareModel(stock.shares[j].dateIn,
      //           null, stock.shares[j].purchasePrice,
      //           stock.shares[j].quantity, 0, this.getDefaultPrice(stock.symbol)));
      //       }
      //     }
      //     if(quantityToSell === this.getTotalQuantity(stock.symbol)) {
      //       removeStock = true;
      //     } else {
      //       stock.shares = sharesAfterSale;
      //     }
      //
      //     this.updateSoldStock(sharesBeingSold, stock.symbol, exchange, displayName, removeStock);
      //   }
      // }
    }
  }

  updateSoldStock(shares: IShareModel[], symbol: string, exchange: string, displayName: string, removeStock: boolean) {
    let stockPresent: boolean = false;
    for(let i = 0; i < this.stocksSold.length; i++) {
      if(this.stocksSold[i].symbol === symbol) {
        stockPresent = true;
        const newArray = this.stocksSold[i].shares.concat(shares);
        this.stocksSold[i].shares = newArray;
        break;
      }
    }
    if(!stockPresent) {
      let stock: IStockModel = new IStockModel(symbol, exchange, displayName, shares);
      this.stocksSold.push(stock);
    }
    if(removeStock) {
      let removeIndex = 0;
      for(let i = 0; i < this.stocksHeld.length; i++) {
        if(this.stocksHeld[i].symbol === symbol) {
          console.log(i);
          removeIndex = i;
          break;
        }
      }
      this.stocksHeld.splice(removeIndex,1);
    }
    this.quantity.setValue('');
    this.stockForSaleSymbol = '';
  }

  getPricesFromServer() {
    this.stocksService.getSharePrices()
      .subscribe(prices => {
        this.livePricesRaw = prices;
        this.getFormattedPrices();
      });
  }

  getFormattedPrices() {
    this.livePricesFormatted = [];
    for (let j = 0; j < this.livePricesRaw.ise.data.length; j++) {
      this.livePricesFormatted.push(new IDefaultPriceModel(this.livePricesRaw.ise.data[j].symbol, this.livePricesRaw.ise.data[j].price, this.livePricesRaw.ise.exchange, this.livePricesRaw.ise.data[j].company));
    }
    for (let j = 0; j < this.livePricesRaw.ftse350.data.length; j++) {
      this.livePricesFormatted.push(new IDefaultPriceModel(this.livePricesRaw.ftse350.data[j].symbol, this.livePricesRaw.ftse350.data[j].price, this.livePricesRaw.ftse350.exchange, this.livePricesRaw.ftse350.data[j].company));
    }
    for (let j = 0; j < this.livePricesRaw.coinranking.data.length; j++) {
      this.livePricesFormatted.push(new IDefaultPriceModel(this.livePricesRaw.coinranking.data[j].symbol, this.livePricesRaw.coinranking.data[j].price, this.livePricesRaw.coinranking.exchange, this.livePricesRaw.coinranking.data[j].company));
    }
  }

  toggleHoldins() {
    this.holdingsVisible = !this.holdingsVisible;
  }

  toggleSold() {
    this.soldVisible = !this.soldVisible;
  }

  getDefaultPrice(symbol: string) {
    if(this.caseScenario === 'Live') {
      for (let i = 0; i < this.livePricesFormatted.length; i++) {
        if (this.livePricesFormatted[i].symbol === symbol) {
          return this.livePricesFormatted[i].price * this.caseMultiplier;
        }
      }
    } else {
      for (let i = 0; i < this.defaultPrices.length; i++) {
        if (this.defaultPrices[i].symbol === symbol) {
          return this.defaultPrices[i].price * this.caseMultiplier;
        }
      }
    }
    return 1;
  }

  getTotalQuantity(symbol: string) {
    let total = 0;
    if(this.stocksHeld) {
      for (let i = 0; i < this.stocksHeld.length; i++) {
        if (this.stocksHeld[i].symbol === symbol) {
          for (let j = 0; j < this.stocksHeld[i].shares.length; j++) {
            total += this.stocksHeld[i].shares[j].quantity;
          }
        }
      }
    }
    return total;
  }

  getTotalSoldQuantity(symbol: string) {
    let total = 0;
    if (this.stocksSold) {
      for (let i = 0; i < this.stocksSold.length; i++) {
        if (this.stocksSold[i].symbol === symbol) {
          for (let j = 0; j < this.stocksSold[i].shares.length; j++) {
            total += this.stocksSold[i].shares[j].quantity;

          }
        }
      }
    }
    return total;
  }

  getTotalProfitLoss() {
    let total = 0;
    if (this.stocksHeld) {
      for (let i = 0; i < this.stocksHeld.length; i++) {
        for (let j = 0; j < this.stocksHeld[i].shares.length; j++) {
          total += this.getDetailGainLoss(this.stocksHeld[i].symbol, this.stocksHeld[i].shares[j].quantity,
            this.stocksHeld[i].shares[j].purchasePrice);
        }
      }
    }
    return total;
  }

  getTotalGainLoss(symbol: string) {
    let total = 0;
    if(this.stocksHeld) {
      for (let i = 0; i < this.stocksHeld.length; i++) {
        if (this.stocksHeld[i].symbol === symbol) {
          for (let j = 0; j < this.stocksHeld[i].shares.length; j++) {
            total += this.getDetailGainLoss(symbol, this.stocksHeld[i].shares[j].quantity, this.stocksHeld[i].shares[j].purchasePrice);
          }
        }
      }
    }
    return total;
  }

  getTotalSoldGainLoss(symbol: string) {
    let total = 0;
    if(this.stocksSold) {
      for (let i = 0; i < this.stocksSold.length; i++) {
        if (this.stocksSold[i].symbol === symbol) {
          for (let j = 0; j < this.stocksSold[i].shares.length; j++) {
            total += this.getSoldDetailGainLoss(this.stocksSold[i].shares[j].purchasePrice, this.stocksSold[i].shares[j].quantity,
              this.stocksSold[i].shares[j].sellingPrice, this.stocksSold[i].shares[j].sellingCosts);
          }
        }
      }
    }
    return total;
  }

  getTotalSellingCosts() {
    let total = 0;
    if(this.stocksHeld) {
      for (let i = 0; i < this.stocksHeld.length; i++) {
        for (let j = 0; j < this.stocksHeld[i].shares.length; j++) {
          total += this.getSellingCosts(this.stocksHeld[i].symbol, this.stocksHeld[i].shares[j].quantity);
        }
      }
    }
    return total;
  }

  getTotalCost() {
    let total = 0;
    if(this.stocksHeld) {
      for (let i = 0; i < this.stocksHeld.length; i++) {
        for (let j = 0; j < this.stocksHeld[i].shares.length; j++) {
          total += this.getCost(this.stocksHeld[i].shares[j].quantity, this.stocksHeld[i].shares[j].purchasePrice);
        }
      }
    }
    return total + this.cash;
  }

  getTotalGPV() {
    let total = 0;
    if(this.stocksHeld) {
      for (let i = 0; i < this.stocksHeld.length; i++) {
        for (let j = 0; j < this.stocksHeld[i].shares.length; j++) {
          total += this.getValue(this.stocksHeld[i].symbol, this.stocksHeld[i].shares[j].quantity);
        }
      }
    }
    return total + this.cash; // hardcoded cash
  }

  getValue(symbol: string, quantity: number) {
    return this.getDefaultPrice(symbol) * quantity;
  }

  getSellingValue(sellingPrice: number, quantity: number) {
    return sellingPrice * quantity;
  }

  getSoldDetailGainLoss(purchasePrice: number, quantity: number, sellingPrice: number, sellingCosts: number) {
    const value: number = quantity * (sellingPrice - purchasePrice) - sellingCosts;
    return value;
  }

  getSoldSellingCosts(sellingPrice: number, quantity: number) {
    let value = this.getSellingValue(sellingPrice, quantity);
    if (value <= 25000) {
      value = value * 0.01;
    } else {
      const over25 = value - 25000;
      value = 250 + over25 * 0.005;
    }
    if (value <= 25) {
      value = 26.25;
    } else {
      value = value + 1.25;
    }
    return value;
  }

  getSoldGainLossPercentage(sellingPrice: number, quantity: number, purchasePrice: number, sellingCosts: number) {
    return this.getSoldDetailGainLoss(purchasePrice, quantity, sellingPrice, sellingCosts) / (purchasePrice * quantity);
  }

  getDetailGainLoss(symbol: string, quantity: number, purchasePrice: number) {
    const value: number = quantity * (this.getDefaultPrice(symbol) - purchasePrice) - this.getSellingCosts(symbol, quantity);
    return value;
  }

  getCost(quantity: number, purchasePrice: number) {
    return quantity * purchasePrice;
  }

  getSellingCosts(symbol: string, quantity: number) {
    let value = this.getValue(symbol, quantity);
    if (value <= 25000) {
      value = value * 0.01;
    } else {
      const over25 = value - 25000;
      value = 250 + over25 * 0.005;
    }
    if (value <= 25) {
      value = 26.25;
    } else {
      value = value + 1.25;
    }
    return value;
  }

  getGainLossPercentage(symbol: string, quantity: number, purchasePrice: number) {
    return this.getDetailGainLoss(symbol, quantity, purchasePrice) / (purchasePrice * quantity);
  }

  setCurrencyMultiplier(value: string) {
    if (value === 'EUR') {
      this.currencyMultiplier = 1;
    } else if (value === 'USD') {
      this.currencyMultiplier = 1.2;
    } else {
      this.currencyMultiplier = 0.85;
    }
    this.currency = value;
  }

  setCaseMultiplier(value: string) {
    if (value === 'Reset original') {
      this.caseMultiplier = 1;
    } else if (value === 'case1 +10%') {
      this.caseMultiplier = 1.1;
    } else if (value === 'case2 -10%') {
      this.caseMultiplier = 0.9;
    } else if (value === 'case3 +20%') {
      this.caseMultiplier = 1.2;
    } else if (value === 'case4 -20%') {
      this.caseMultiplier = 0.8;
    } else if (value === 'case5 +100%') {
      this.caseMultiplier = 2;
    } else {
      this.caseMultiplier = 1;
    }
    this.caseScenario = value;
  }
}
