import {IShareModel} from './share.model';

export class IStockModel {
  symbol: string;
  exchange: string;
  display_name: string;
  shares: IShareModel[];
  constructor(symbol: string, exchange: string, display_name: string, shares: IShareModel[]) {
    this.symbol = symbol;
    this.exchange = exchange;
    this.display_name = display_name;
    this.shares = shares;
  }
}


