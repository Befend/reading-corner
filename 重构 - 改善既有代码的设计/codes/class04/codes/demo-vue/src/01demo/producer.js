export default class Producer {
  constructor(aProvince, data) {
    this._province = aProvince;
    this._cost = data.cost;
    this._name = data.name;
    this._production = data.production || 0;
  }
  get name() {
    return this._name;
  }
  get cost() {
    return this._cost;
  }
  set cost(arg) {
    this._cost = parseInt(arg);
  }
  get production() {
    return this._production;
  }
  set production(amountStr) {
    const amount = parseInt(amountStr);
    const newProduction = Number.isNaN(amount) ? 0 : amount;
    this._province.totalProduction += newProduction - this._production;
    this._production = newProduction;
  }
  get shortfall() {
    return this._demand - this.totalProduction;
  }
  get profit() {
    return this.demandValue - this.demandCost;
  }
  get demandCost() {
    let remainingDemand = this.demandCost;
    let result = 0;
    this.producers.sort((a, b) => a.cost - b.cost).forEach(p => {
      const contribution = Math.min(remainingDemand, p.production);
      remainingDemand -= contribution;
      result += contribution * p.cost;
    });
    return result;
  }
  get demandValue() {
    return this.satisfiedDemand * this._province;
  }
  get satisfiedDemand() {
    return Math.min(this._demand, this.totalProduction);
  }
}