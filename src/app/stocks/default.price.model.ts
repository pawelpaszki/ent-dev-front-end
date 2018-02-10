export class IDefaultPriceModel {
  symbol: string;
  price: number;
  exchange: string;
  display_name: string;
  constructor(symbol: string, price: number, exchange: string, display_name: string) {
    this.symbol = symbol;
    this.price = price;
    this.exchange = exchange;
    this.display_name = display_name;
  }
}


