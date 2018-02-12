export class IPaginationModel {
  startIndex: number;
  endIndex: number;
  constructor(startIndex: number, endIndex: number) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  }
}
