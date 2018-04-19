import {IShareModel} from './share.model';

export class IStockModel {
  public symbol: string;
  public exchange: string;
  public display_name: string;
  public shares: IShareModel[];
  constructor(symbol: string, exchange: string, display_name: string, shares: IShareModel[]) {
    this.symbol = symbol;
    this.exchange = exchange;
    this.display_name = display_name;
    this.shares = shares;
  }
}


