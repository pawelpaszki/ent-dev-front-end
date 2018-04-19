import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from '../services/auth.service';
import {StocksService} from '../services/stocks.service';
import {IDefaultPriceModel} from './default.price.model';
import * as q from 'q';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
})

export class StocksComponent implements OnInit, OnDestroy {

  public currency: string = 'EUR';
  public caseScenario: string = 'Reset Original';
  public caseMultiplier = 1;
  public currencyMultiplier = 1;
  public cash: number = 100;
  public mode: string = 'test mode';
  public email: string;
  public livePricesRaw: any = [];
  public livePricesFormatted: IDefaultPriceModel[] = [];
  public stockForSaleSymbol: string = '';
  public fabVisible: boolean = false;
  public symbolValid: boolean = true;
  public quantityValid: boolean = true;
  public quantityForSale: number = 0;
  public showCookieWarning: boolean = false;

  constructor(public authService: AuthService, private router: Router, public stocksService: StocksService,
              private toastr: ToastrService) {
    if (this.authService.currentUser && this.authService.currentUser !== null
      && this.authService.currentUser.holdings && this.authService.currentUser.holdings !== null) {
      this.email = this.authService.currentUser.email;
      this.openWarning();
    } else {
      const id: string = localStorage.getItem('id');
      const token: string = localStorage.getItem('authtoken');
      if (id && token && id.length > 0 && token.length > 0) {
        this.authService.getUser(id).subscribe(() => {
          this.openWarning();
        });
      }
    }
    this.getPricesFromServer();
    this.getDefaultPrices();
  }

  public openWarning() {
    const cookieWarningShown: string = localStorage.getItem(this.authService.currentUser._id + 'cookieWarning');
    if (cookieWarningShown !== 'shown') {
      this.showCookieWarning = true;
    }
  }

  public closeWarning() {
    this.showCookieWarning = false;
    localStorage.setItem(this.authService.currentUser._id + 'cookieWarning', 'shown');
  }

  public getDefaultPrices() {
    this.stocksService.getDefaultPrices().subscribe((resp) => {
      this.stocksService.defaultPrices = (resp as any).defaults;
    });
  }

  public setStockSymbol(symbol: string) {
    this.symbolValid = false;
    for (const stock of this.authService.currentUser.holdings) {
      if (stock.symbol === symbol) {
        this.symbolValid = true;
        this.stockForSaleSymbol = symbol;
        break;
      }
    }
  }

  public setSellingQuantity(quantity: number) {
    this.quantityValid = false;
    if (this.getTotalQuantity(this.stockForSaleSymbol) >= quantity && quantity > 0) {
      this.quantityValid = true;
      this.quantityForSale = quantity;
    }
  }

  public topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.scroll();
  }

  public ngOnInit() {
    window.addEventListener('scroll', this.scroll, true);
  }

  public ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, true);
  }

  public scroll = () => {
    this.fabVisible = document.body.scrollTop > 100 || document.documentElement.scrollTop > 100;
  }

  public resetStock() {
    this.stocksService.resetUserStock().subscribe((resp) => {
      this.toastr.success('User\'s stock successfully reset', 'Success');
      if (resp.user.holdings && resp.user.holdings !== null) {
        this.authService.currentUser.holdings = resp.user.holdings;
      }
      if (resp.user.stocksSold && resp.user.stocksSold !== null) {
        this.authService.currentUser.stocksSold = resp.user.stocksSold;
      }
    });
  }

  public removeShare(symbol: string, id: string) {
    let stockIndex: number = 0;
    let shareIndex: number = 0;
    for (let i = 0; i < this.authService.currentUser.holdings.length; i++) {
      if (this.authService.currentUser.holdings[i].symbol === symbol) {
        stockIndex = i;
        for (let j = 0; j < this.authService.currentUser.holdings[i].shares.length; j++) {
          if (this.authService.currentUser.holdings[i].shares[j]._id === id) {
            shareIndex = j;
            break;
          }
        }
        break;
      }
    }
    this.authService.currentUser.holdings[stockIndex].shares.splice(stockIndex, 1);
    if (this.authService.currentUser.holdings[stockIndex].shares.length === 0) {
      this.authService.currentUser.holdings.splice(stockIndex, 1);
    }
  }

  public sellShares() {
    this.stocksService.sellStock(this.quantityForSale, this.getSellingCosts(
      this.stockForSaleSymbol, this.quantityForSale), this.stockForSaleSymbol,
      this.getDefaultPrice(this.stockForSaleSymbol),
      this.getTotalQuantity(this.stockForSaleSymbol)).subscribe((resp) => {
      this.toastr.success('Shares sold: ' + this.quantityForSale + ' of ' +
        this.stockForSaleSymbol, 'Success');
      (document.getElementById('stockSymbol') as HTMLInputElement).value = '';
      (document.getElementById('shareQuantity') as HTMLInputElement).value = '';
      if (resp.user.holdings && resp.user.holdings !== null) {
        this.authService.currentUser.holdings = resp.user.holdings;
      }
      if (resp.user.stocksSold && resp.user.stocksSold !== null) {
        this.authService.currentUser.stocksSold = resp.user.stocksSold;
      }
    });
  }

  public sellAllShares() {
    const quantities: number[] = [];
    const sellingCosts: number[] = [];
    const symbols: string[] = [];
    const sellingPrices: number[] = [];
    for (const holding of this.authService.currentUser.holdings) {
      quantities.push(this.getTotalQuantity(holding.symbol));
      sellingCosts.push(this.getSellingCosts(holding.symbol,
        this.getTotalQuantity(holding.symbol)));
      symbols.push(holding.symbol);
      sellingPrices.push(this.getDefaultPrice(holding.symbol));
    }
    this.stocksService.sellAll(
      quantities, sellingCosts, symbols, sellingPrices);

  }

  public getDefaultPrice(symbol: string) {
    if (this.stocksService.defaultPrices) {
      if (this.caseScenario === 'Live') {
        for (let i = 0; i < this.livePricesFormatted.length; i++) {
          if (this.livePricesFormatted[i].symbol === symbol) {
            return this.livePricesFormatted[i].price * this.caseMultiplier;
          }
        }
      } else {
        for (let i = 0; i < this.stocksService.defaultPrices.length; i++) {
          if (this.stocksService.defaultPrices[i].symbol === symbol) {
            return this.stocksService.defaultPrices[i].price * this.caseMultiplier;
          }
        }
      }
    }
    return 1;
  }

  public getPricesFromServer() {
    this.stocksService.getSharePrices()
      .subscribe((prices) => {
        this.livePricesRaw = prices;
        this.getFormattedPrices();
      });
  }

  public getFormattedPrices() {
    this.livePricesFormatted = [];
    for (let j = 0; j < this.livePricesRaw.ise.data.length; j++) {
      this.livePricesFormatted.push(new IDefaultPriceModel(this.livePricesRaw.ise.data[j].symbol,
        this.livePricesRaw.ise.data[j].price.toString().replace(',', ''),
        this.livePricesRaw.ise.exchange, this.livePricesRaw.ise.data[j].company));
    }
    for (let j = 0; j < this.livePricesRaw.ftse350.data.length; j++) {
      this.livePricesFormatted.push(new IDefaultPriceModel(this.livePricesRaw.ftse350.data[j].symbol,
        this.livePricesRaw.ftse350.data[j].price.toString().replace(',', ''),
        this.livePricesRaw.ftse350.exchange, this.livePricesRaw.ftse350.data[j].company));
    }
    for (let j = 0; j < this.livePricesRaw.coinranking.data.length; j++) {
      this.livePricesFormatted.push(new IDefaultPriceModel(this.livePricesRaw.coinranking.data[j].symbol,
        this.livePricesRaw.coinranking.data[j].price.toString().replace(',', ''),
        this.livePricesRaw.coinranking.exchange, this.livePricesRaw.coinranking.data[j].company));
    }
  }

  public getTotalQuantity(symbol: string) {
    let total = 0;
    if (this.authService.currentUser.holdings) {
      for (let i = 0; i < this.authService.currentUser.holdings.length; i++) {
        if (this.authService.currentUser.holdings[i].symbol === symbol) {
          for (let j = 0; j < this.authService.currentUser.holdings[i].shares.length; j++) {
            total += this.authService.currentUser.holdings[i].shares[j].quantity;
          }
        }
      }
    }
    return total;
  }

  public getTotalProfitLoss() {
    let total = 0;
    if (this.authService.currentUser && this.authService.currentUser.holdings) {
      for (let i = 0; i < this.authService.currentUser.holdings.length; i++) {
        for (let j = 0; j < this.authService.currentUser.holdings[i].shares.length; j++) {
          total += this.getDetailGainLoss(this.authService.currentUser.holdings[i].symbol,
            this.authService.currentUser.holdings[i].shares[j].quantity,
            this.authService.currentUser.holdings[i].shares[j].purchasePrice);
        }
      }
    }
    return total;
  }

  public getTotalGainLoss(symbol: string) {
    let total = 0;
    if (this.authService.currentUser.holdings) {
      for (let i = 0; i < this.authService.currentUser.holdings.length; i++) {
        if (this.authService.currentUser.holdings[i].symbol === symbol) {
          for (let j = 0; j < this.authService.currentUser.holdings[i].shares.length; j++) {
            total += this.getDetailGainLoss(symbol, this.authService.currentUser.holdings[i].shares[j].quantity,
              this.authService.currentUser.holdings[i].shares[j].purchasePrice);
          }
        }
      }
    }
    return total;
  }

  public getTotalSellingCosts() {
    let total = 0;
    if (this.authService.currentUser.holdings) {
      for (let i = 0; i < this.authService.currentUser.holdings.length; i++) {
        for (let j = 0; j < this.authService.currentUser.holdings[i].shares.length; j++) {
          total += this.getSellingCosts(this.authService.currentUser.holdings[i].symbol,
            this.authService.currentUser.holdings[i].shares[j].quantity);
        }
      }
    }
    return total;
  }

  public getTotalCost() {
    let total = 0;
    if (this.authService.currentUser.holdings) {
      for (let i = 0; i < this.authService.currentUser.holdings.length; i++) {
        for (let j = 0; j < this.authService.currentUser.holdings[i].shares.length; j++) {
          total += this.getCost(this.authService.currentUser.holdings[i].shares[j].quantity,
            this.authService.currentUser.holdings[i].shares[j].purchasePrice);
        }
      }
    }
    return total + this.cash;
  }

  public getTotalGPV() {
    let total = 0;
    if (this.authService.currentUser.holdings) {
      for (let i = 0; i < this.authService.currentUser.holdings.length; i++) {
        for (let j = 0; j < this.authService.currentUser.holdings[i].shares.length; j++) {
          total += this.getValue(this.authService.currentUser.holdings[i].symbol,
            this.authService.currentUser.holdings[i].shares[j].quantity);
        }
      }
    }
    return total + this.cash; // hardcoded cash
  }

  public getValue(symbol: string, quantity: number) {
    return this.getDefaultPrice(symbol) * quantity;
  }

  public getDetailGainLoss(symbol: string, quantity: number, purchasePrice: number) {
    const value: number = quantity * (this.getDefaultPrice(symbol) - purchasePrice)
      - this.getSellingCosts(symbol, quantity);
    return value;
  }

  public getCost(quantity: number, purchasePrice: number) {
    return quantity * purchasePrice;
  }

  public getSellingCosts(symbol: string, quantity: number) {
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

  public getGainLossPercentage(symbol: string, quantity: number, purchasePrice: number) {
    return this.getDetailGainLoss(symbol, quantity, purchasePrice) / (purchasePrice * quantity);
  }

  public setCurrencyMultiplier(value: string) {
    if (value === 'EUR') {
      this.currencyMultiplier = 1;
    } else if (value === 'USD') {
      this.currencyMultiplier = 1.2;
    } else {
      this.currencyMultiplier = 0.85;
    }
    this.currency = value;
  }

  public setCaseMultiplier(value: string) {
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
