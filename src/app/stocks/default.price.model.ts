export class IDefaultPriceModel {
  public symbol: string;
  public price: number;
  public exchange: string;
  public displayName: string;
  public quantity: number;
  constructor(symbol: string, price: number, exchange: string, displayName: string) {
    this.symbol = symbol;
    this.price = price;
    this.exchange = exchange;
    this.displayName = displayName;
    this.quantity = 0;
  }
}


