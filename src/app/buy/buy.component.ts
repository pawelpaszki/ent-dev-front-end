import {Component} from '@angular/core';
import {StocksService} from '../services/stocks.service';
import {IDefaultPriceModel} from '../stocks/default.price.model';
import {IPaginationModel} from '../stocks/pagination.model';
import {AuthService} from '../services/auth.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html'
})

export class BuyComponent {
  livePricesRaw: any = [];
  livePricesFormatted: IDefaultPriceModel[] = [];
  paginationElements: IPaginationModel[] = [];
  pageItems: [number, number];
  searchedStock: string = '';

  constructor(private stocksService: StocksService, private authService: AuthService, private toastr: ToastrService) {
    this.getPricesFromServer();
    if(!this.authService.currentUser) {
      const id: string = localStorage.getItem('id');
      const token: string = localStorage.getItem('authtoken');
      if(id && token && id.length > 0 && token.length > 0) {
        this.authService.getUser(id).subscribe(() =>{});
      }
    }
  }

  filterStock(name: string) {
    console.log(name);
    this.searchedStock = name;
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
  }

  setPageItems(start: number, end: number) {
    this.pageItems = [start,end];
  }

  buyShares(symbol: string) {
    if(parseInt((<HTMLInputElement>document.getElementById(symbol)).value) > 0) {
      for(let stock of this.livePricesFormatted) {
        if(stock.symbol === symbol) {
          let purchasePrice: number = 0;
          if(this.hasDefaultPrice(stock.symbol)) {
            purchasePrice = this.getDefaultPrice(stock.symbol)
          } else {
            this.stocksService.defaultPrices.push(new IDefaultPriceModel(symbol, stock.price, stock.exchange, stock.displayName));
            this.stocksService.pushNewDefault(symbol, stock.price, stock.exchange, stock.displayName).subscribe();
            purchasePrice = stock.price;
          }
          this.stocksService.buyStock(stock.symbol, purchasePrice, stock.displayName, stock.exchange, Number.parseInt((<HTMLInputElement>document.getElementById(symbol)).value)).subscribe((resp) => {
            const quantity = (<HTMLInputElement>document.getElementById(symbol)).value;
            this.toastr.success('Shares bought: ' + quantity + ' of ' + symbol, 'Success');
            (<HTMLInputElement>document.getElementById(symbol)).value = '';
            this.setQuantityToBuy(symbol);
            if(resp.user.holdings && resp.user.holdings !== null) {
              this.authService.currentUser.holdings = resp.user.holdings;
            }
            if(resp.user.stocksSold && resp.user.stocksSold !== null) {
              this.authService.currentUser.stocksSold = resp.user.stocksSold;
            }
          });
          break;
        }
      }
    }
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

  getDefaultPrice(symbol: string) {
    if(this.stocksService.defaultPrices) {
      for (let i = 0; i < this.livePricesFormatted.length; i++) {
        if (this.livePricesFormatted[i].symbol === symbol) {
          return this.livePricesFormatted[i].price;
        }
      }
    }
    return 1;
  }

  hasDefaultPrice(symbol: string) {
    for(let defaultPrice of this.stocksService.defaultPrices) {
      if(defaultPrice.symbol == symbol) {
        return true;
      }
    }
    return false;
  }
}
