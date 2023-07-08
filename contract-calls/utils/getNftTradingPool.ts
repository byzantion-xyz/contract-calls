import { gqlChainRequest } from "./gqlChainRequest"
import { fetchNftTradingPool } from "../queries/fetchNftTradingPool"

export const getNftTradingPool = async ({
  chain,
  nftId
}) => {

  const response = await gqlChainRequest({
    chain,
    query: fetchNftTradingPool,
    variables: {
      nftId
    }
  })

  return response?.nfts?.[0]?.trading_pool
}