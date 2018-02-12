import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {DecimalPipe} from '@angular/common';
import {IDefaultPriceModel} from './default.price.model';
//import {PriceScraperService} from '../common/pricescraper.service';
import {TabletopComponent} from './tabletop.component';
import {StocksService} from '../services/stocks.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {IShareModel} from './share.model';
import {IStockModel} from './stock.model';
import {IPaginationModel} from './pagination.model';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})



export class StocksComponent implements OnInit {

  stocksHeld? = [];
  stocksSold? = [];
  currency: string = 'EUR';
  caseScenario: string = 'Reset Original';
  caseMultiplier = 1;
  currencyMultiplier = 1;
  holdingsVisible: boolean = true;
  soldVisible: boolean = true;
  toBuyVisible: boolean = true;
  forecastVisible: boolean = true;
  desiredIncomeVisible: boolean = false;
  maxProfitVisible: boolean = false;
  nonTaxableVisible: boolean = false;
  cash: number = 100;
  mode: string = 'test mode';
  email: string;
  livePricesRaw: any = [];
  livePricesFormatted: IDefaultPriceModel[] = [];
  stockForSaleSymbol: string;
  sellForm: FormGroup;
  quantity: FormControl;
  fabVisible: boolean = false;
  paginationElements: IPaginationModel[] = [];
  pageItems: [number, number];

  defaultPrices = [];

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
    this.getDefaultPrices();
  }

  getDefaultPrices() {
    this.stocksService.getDefaultPrices().subscribe((resp) => {
      console.log(resp);
      this.defaultPrices = (resp as any).defaults;
      console.log(this.defaultPrices);
    });
  }

  topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.scroll();
  }

  ngOnInit() {
    window.addEventListener('scroll', this.scroll, true); //third parameter
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, true);
  }

  scroll = () => {
    this.fabVisible = document.body.scrollTop > 100 || document.documentElement.scrollTop > 100;

  };

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

  // TODO
  showDesiredIncome() {
    const desiredIncome = parseInt((<HTMLInputElement>document.getElementById('desiredIncome')).value);
    let results = [];
    for(let stock of this.stocksHeld) {
      if(this.getTotalGainLoss(stock.symbol) >= desiredIncome) {
        let cumulativeIncome = 0;
        let cumulativeProfit = 0;
        let cumulativeQuantity = 0;
        for(let share of stock.shares) {
          console.log(this.getDetailGainLoss(stock.symbol, share.quantity, share.purchasePrice));
          // if(cumulativeIncome + this.getDetailGainLoss(stock.symbol, share.quantity, share.purchasePrice) >= desiredIncome) {
          //   const shareQuantity = Math.ceil((desiredIncome - cumulativeIncome) / this.getDetailGainLoss(stock.symbol, share.quantity, share.purchasePrice) * share.quantity);
          //   //console.log(shareQuantity);
          //   cumulativeQuantity += shareQuantity;
          //   cumulativeIncome += this.getDetailGainLoss(stock.symbol, shareQuantity, share.purchasePrice);
          //   results.push({stock: stock.symbol, quantity: cumulativeQuantity});
          //   break;
          // } else {
          //   cumulativeIncome += this.getDetailGainLoss(stock.symbol, share.quantity, share.purchasePrice);
          //   cumulativeQuantity += share.quantity;
          // }
        }
      }
    }
    (<HTMLInputElement>document.getElementById('desiredIncome')).value = '';
    this.desiredIncomeVisible = true;
  }

  // TODO
  showMaxProfit() {
    const quantity = parseInt((<HTMLInputElement>document.getElementById('maxProfit')).value);
    console.log(quantity);
    (<HTMLInputElement>document.getElementById('maxProfit')).value = '';
    this.maxProfitVisible = true;
  }

  //TODO
  showNonTaxable() {
    this.nonTaxableVisible = true;
  }

  hideDesiredIncome() {
    this.desiredIncomeVisible = false;
  }

  hideMaxProfit() {
    this.maxProfitVisible = false;
  }

  hideNonTaxable() {
    this.nonTaxableVisible = false;
  }

  invalidQuantity() {
    return !this.quantity.valid && !this.quantity.untouched;
  }

  setStockForSale(symbol: string) {
    this.stockForSaleSymbol = symbol;
    this.quantity.clearValidators();
    this.quantity.setValidators([Validators.min(1), Validators.max(this.getTotalQuantity(this.stockForSaleSymbol))]);
  }

  setPageItems(start: number, end: number) {
    this.pageItems = [start,end];
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
    }
  }


  getPricesFromServer() {
    this.stocksService.getSharePrices()
      .subscribe(prices => {
        this.livePricesRaw = prices;
        this.getFormattedPrices();
      });
  }

  hasDefaultPrice(symbol: string) {
    for(let defaultPrice of this.defaultPrices) {
      if(defaultPrice.symbol == symbol) {
        return true;
      }
    }
    return false;
  }

  getFormattedPrices() {
    this.livePricesFormatted = [];
    this.paginationElements = [];
    for (let j = 0; j < this.livePricesRaw.ise.data.length; j++) {
      this.livePricesFormatted.push(new IDefaultPriceModel(this.livePricesRaw.ise.data[j].symbol, this.livePricesRaw.ise.data[j].price.toString().replace(',',''), this.livePricesRaw.ise.exchange, this.livePricesRaw.ise.data[j].company));
    }
    for (let j = 0; j < this.livePricesRaw.ftse350.data.length; j++) {
      this.livePricesFormatted.push(new IDefaultPriceModel(this.livePricesRaw.ftse350.data[j].symbol, this.livePricesRaw.ftse350.data[j].price.toString().replace(',',''), this.livePricesRaw.ftse350.exchange, this.livePricesRaw.ftse350.data[j].company));
    }
    for (let j = 0; j < this.livePricesRaw.coinranking.data.length; j++) {
      this.livePricesFormatted.push(new IDefaultPriceModel(this.livePricesRaw.coinranking.data[j].symbol, this.livePricesRaw.coinranking.data[j].price.toString().replace(',',''), this.livePricesRaw.coinranking.exchange, this.livePricesRaw.coinranking.data[j].company));
    }
    for(let i = 0; i < this.livePricesFormatted.length; i += 30) {
      if(i + 30 >= this.livePricesFormatted.length) {
        this.paginationElements.push(new IPaginationModel(i + 1, this.livePricesFormatted.length));
      } else {
        this.paginationElements.push(new IPaginationModel(i + 1, i + 30));
      }
    }
    this.pageItems = [this.paginationElements[0].startIndex, this.paginationElements[0].endIndex];
    console.log(this.pageItems);
    console.log(this.paginationElements);
    console.log(this.livePricesFormatted.length);
  }

  setQuantityToBuy(symbol) {
    for(let stock of this.livePricesFormatted) {
      if(stock.symbol === symbol) {
        const quantity = parseInt((<HTMLInputElement>document.getElementById(symbol)).value);
        if(quantity < 0) {
          stock.quantity = 0;
          (<HTMLInputElement>document.getElementById(symbol)).value = '0';
        } else if (Number.isNaN(quantity)) {
          stock.quantity = 0;
          (<HTMLInputElement>document.getElementById(symbol)).value = '';
        } else {
          stock.quantity = quantity;
        }
      }
    }
  }

  buyShares(symbol: string) {
    if(parseInt((<HTMLInputElement>document.getElementById(symbol)).value) > 0) {
      for(let stock of this.livePricesFormatted) {
        if(stock.symbol === symbol) {
          let purchasePrice: number = 0;
          if(this.hasDefaultPrice(stock.symbol)) {
            purchasePrice = this.getDefaultPrice(stock.symbol)
          } else {
            this.defaultPrices.push(new IDefaultPriceModel(symbol, stock.price, stock.exchange, stock.displayName));
            this.stocksService.pushNewDefault(symbol, stock.price, stock.exchange, stock.displayName).subscribe();
            purchasePrice = stock.price;
          }
          this.stocksService.buyStock(stock.symbol, purchasePrice, stock.displayName, stock.exchange, Number.parseInt((<HTMLInputElement>document.getElementById(symbol)).value)).subscribe((resp) => {
            (<HTMLInputElement>document.getElementById(symbol)).value = '';
            this.setQuantityToBuy(symbol);
            if(resp.user.holdings && resp.user.holdings !== null) {
              this.stocksHeld = resp.user.holdings;
            }
            if(resp.user.stocksSold && resp.user.stocksSold !== null) {
              this.stocksSold = resp.user.stocksSold;
            }
          });
          break;
        }
      }
    }
    console.log(symbol + ' ' + (<HTMLInputElement>document.getElementById(symbol)).value);
  }

  toggleHoldins() {
    this.holdingsVisible = !this.holdingsVisible;
  }

  toggleSold() {
    this.soldVisible = !this.soldVisible;
  }

  toggleToBuy() {
    this.toBuyVisible = !this.toBuyVisible;
  }

  toggleForecast() {
    this.forecastVisible = !this.forecastVisible;
  }

  getDefaultPrice(symbol: string) {
    if(this.defaultPrices) {
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
