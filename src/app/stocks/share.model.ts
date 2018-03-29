export class IShareModel {
  date_in: Date;
  date_out: Date;
  purchase_price: number;
  quantity: number;
  selling_costs: number;
  selling_price: number;
  id: string;
  constructor(date_in: Date, date_out: Date, purchase_price: number, quantity: number, selling_costs: number, selling_price: number, id: string) {
    this.date_in = date_in;
    this.date_out = date_out;
    this.purchase_price = purchase_price;
    this.quantity = quantity;
    this.selling_costs = selling_costs;
    this.selling_price = selling_price;
    this.id = id;
  }
}
