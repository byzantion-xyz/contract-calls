import { nftTypesWithZeroCommission, tradeportDefaultFeeBps, tradeportDefaultFeeDenominator } from "../constants"

export const getSuiMarketFeePrice = ({price, nftType}) => {
  let marketFeePrice = 0
  if (!nftTypesWithZeroCommission?.includes(nftType)) {
    marketFeePrice = (price * tradeportDefaultFeeBps / tradeportDefaultFeeDenominator)
  }
  return marketFeePrice
}
