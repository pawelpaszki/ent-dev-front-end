export class IPaginationModel {
  public startIndex: number;
  public endIndex: number;
  constructor(startIndex: number, endIndex: number) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  }
}
