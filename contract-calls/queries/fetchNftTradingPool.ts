import { gql } from "graphql-request"

export const fetchNftTradingPool = gql`
  query fetchNftTradingPool($nftId: uuid!) {
    nfts(
      where: {
        id: { _eq: $nftId }
      }
    ) {
      trading_pool {
        creator
        creator_fee_pct
        delta
        nonce
        spot_price
        type
      }
    }
  }
`
