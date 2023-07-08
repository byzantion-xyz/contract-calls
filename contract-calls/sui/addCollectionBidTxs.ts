import { gqlChainRequest } from "../utils/gqlChainRequest"
import { parseCrypto } from "../utils/parseCrypto"
import { tradeportBeneficiaryAddress, tradeportBiddingStore, tradeportDefaultFeeBps, tradeportDefaultFeeDenominator } from "../constants"
import { fetchWalletKiosks } from "../queries/fetchWalletKiosks"

export function addTradePortCollectionBidTx({txBlock, collectionContract, bidAmount}) {
  const bidPrice = Number(parseCrypto(bidAmount, "sui"))
  const marketFeePrice = bidPrice * tradeportDefaultFeeBps / tradeportDefaultFeeDenominator

  txBlock.splitCoins(txBlock.gas,
    [txBlock.pure(bidPrice + marketFeePrice)]
  )
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x7925fb044dbed3eda525ce059120f5ce3dbd6887ae6937ee9301383423406b57::biddings::collection_bid",
    arguments: [
      txBlock.object(tradeportBiddingStore),
      txBlock.pure(bidPrice),
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      },
      txBlock.pure(marketFeePrice),
      txBlock.pure(tradeportBeneficiaryAddress)
    ],
    typeArguments: [
      collectionContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x2::coin::destroy_zero",
    arguments: [
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 2,
        resultIndex: 0
      }
    ],
    typeArguments: [
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export async function addOriginByteCollectionBidTx({txBlock, collectionContract, bidAmount, bidder}) {
  const orderbook = collectionContract?.properties?.shared_objects?.find(o => o.type?.includes("orderbook"))?.id

  const buyerKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: bidder}})
  const buyerKiosk = buyerKioskRes?.kiosks?.filter(kiosk => kiosk?.is_origin_byte)?.[0]?.id

  if (!buyerKiosk) {
    txBlock.moveCall({
      target: "0x083b02db943238dcea0ff0938a54a17d7575f5b48034506446e501e963391480::ob_kiosk::create_for_sender",
      arguments: [],
      typeArguments: []
    })
    txBlock.incrementTotalTxsCount()
  }

  let bidPrice = Number(parseCrypto(bidAmount, "sui"))
  let marketFeePrice = bidPrice * tradeportDefaultFeeBps / tradeportDefaultFeeDenominator

  txBlock.splitCoins(txBlock.gas,
    [txBlock.pure(bidPrice + marketFeePrice)]
  )
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::orderbook::create_bid_with_commission",
    arguments: [
      txBlock.object(orderbook),
      !buyerKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 0
        }
        : txBlock.object(buyerKiosk),
      txBlock.pure(bidPrice),
      txBlock.pure(bidder),
      txBlock.pure(marketFeePrice),
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      }
    ],
    typeArguments: [
      collectionContract?.properties?.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x2::coin::destroy_zero",
    arguments: [
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 2,
        resultIndex: 0
      }
    ],
    typeArguments: [
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}