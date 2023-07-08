export const getAptosContractCallMarketParamName = (market: string) => {
  switch(market) {
    case "tradeport":
    default:
      return "TradePort"
    case "topaz":
      return "Topaz"
    case "souffl3":
      return "Souffl3"
    case "bluemove":
      return "BlueMove"
    case "sea-shrine":
      return "SeaShrine"
    case "okx":
      return "Okx"
    case "ozozoz":
      return "Ozozoz"
  }
}