export class IDefaultPriceModel {
  symbol: string;
  price: number;
  exchange: string;
  displayName: string;
  quantity: number;
  constructor(symbol: string, price: number, exchange: string, displayName: string) {
    this.symbol = symbol;
    this.price = price;
    this.exchange = exchange;
    this.displayName = displayName;
    this.quantity = 0;
  }
}


