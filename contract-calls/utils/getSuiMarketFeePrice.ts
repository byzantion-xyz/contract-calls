import { collectionIdsWithZeroCommission, tradeportDefaultFeeBps, tradeportDefaultFeeDenominator } from "../constants"

export const getSuiMarketFeePrice = ({price, collectionId}) => {
  let marketFeePrice = 0
  if (!collectionIdsWithZeroCommission?.includes(collectionId)) {
    marketFeePrice = (price * tradeportDefaultFeeBps / tradeportDefaultFeeDenominator)
  }
  if (marketFeePrice < 1) {
    return marketFeePrice
  }
  return parseInt((marketFeePrice)?.toFixed(0))
}
