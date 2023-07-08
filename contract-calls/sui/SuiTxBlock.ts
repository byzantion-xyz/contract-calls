import { TransactionBlock } from "@mysten/sui.js";

export class SuiTxBlock extends TransactionBlock {
  totalTxsCount: number;
  totalGasBudget: number;
  totalSouffl3BuyTxsCount: number;
  totalBuyerCoinsAmount: number;
  
  constructor() {
    super()
    this.totalTxsCount = 0
    this.totalGasBudget = 0
    this.totalSouffl3BuyTxsCount = 0
    this.totalBuyerCoinsAmount = 0
  }

  incrementTotalTxsCount() {
    this.totalTxsCount++
  }

  incrementTotalSouffl3BuyTxsCount() {
    this.totalSouffl3BuyTxsCount++
  }

  addToTotalBuyerCoinsAmount(buyerCoinsAmount) {
    this.totalBuyerCoinsAmount += buyerCoinsAmount
  }

  addToTotalGasBudget(gasBudget) {
    this.totalGasBudget += gasBudget
  }

  getTotalTxsCount() {
    return this.totalTxsCount
  }

  getTotalSouffl3BuyTxsCount() {
    return this.totalSouffl3BuyTxsCount
  }

  getTotalGasBudget() {
    return this.totalGasBudget
  }

  getTotalBuyerCoinsAmount() {
    return this.totalBuyerCoinsAmount
  }
}