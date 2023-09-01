import { gqlChainRequest } from "../utils/gqlChainRequest"
import { parseCrypto } from "../utils/parseCrypto"
import { tradeportBeneficiaryAddress, tradeportBiddingStore, tradeportKioskBiddingStore } from "../constants"
import { fetchWalletKiosks } from "../queries/fetchWalletKiosks"
import { getSuiMarketFeePrice } from "../utils/getSuiMarketFeePrice"

export function addTradePortCollectionBidTx({txBlock, collectionId, collectionContract, bidAmount}) {
  const bidPrice = Number(parseCrypto(bidAmount, "sui"))
  const marketFeePrice = getSuiMarketFeePrice({price: bidPrice, collectionId})

  txBlock.splitCoins(txBlock.gas,
    [txBlock.pure(bidPrice + marketFeePrice)]
  )
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::biddings::collection_bid",
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

export function addTradePortKioskCollectionBidTx({txBlock, collectionId, collectionContract, bidAmount, sharedObjects}) {
  const bidPrice = Number(parseCrypto(bidAmount, "sui"))
  const marketFeePrice = getSuiMarketFeePrice({price: bidPrice, collectionId})
  const { transferPolicy } = sharedObjects

  txBlock.moveCall({
    target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::fee_amount",
    arguments: [
      txBlock.object(transferPolicy),
      txBlock.pure(bidPrice?.toString()),
    ],
    typeArguments: [
      collectionContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.splitCoins(txBlock.gas, [
    txBlock.pure(bidPrice + marketFeePrice), 
    {
      kind: "Result",
      index: txBlock.getTotalTxsCount() - 1
    }
  ])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(bidPrice + marketFeePrice)
  
  txBlock.mergeCoins(
    {
      kind: "NestedResult",
      index: txBlock.getTotalTxsCount() - 1,
      resultIndex: 0
    },
    [
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 1
      }
    ]
  )
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x33a9e4a3089d911c2a2bf16157a1d6a4a8cbd9a2106a98ecbaefe6ed370d7a25::kiosk_biddings::collection_bid",
    arguments: [
      txBlock.object(tradeportKioskBiddingStore),
      txBlock.pure(bidPrice),
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 2,
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
        index: txBlock.getTotalTxsCount() - 3,
        resultIndex: 0
      }
    ],
    typeArguments: [
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export async function addOriginByteCollectionBidTx({txBlock, collectionId, collectionContract, bidAmount, bidder, sharedObjects}) {
  const {orderbook} = sharedObjects

  const buyerKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: bidder}})
  const buyerKiosk = buyerKioskRes?.kiosks?.filter(kiosk => kiosk?.is_origin_byte)?.[0]?.id

  if (!buyerKiosk) {
    txBlock.moveCall({
      target: "0x787afe0cb02641274667b31235d3d0e1a2d1c43cf984d08007268b9928528493::ob_kiosk::new",
      arguments: [],
      typeArguments: []
    })
    txBlock.incrementTotalTxsCount()
  }

  const bidPrice = Number(parseCrypto(bidAmount, "sui"))
  const marketFeePrice = getSuiMarketFeePrice({price: bidPrice, collectionId})

  txBlock.splitCoins(txBlock.gas,
    [txBlock.pure(bidPrice + marketFeePrice)]
  )
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::orderbook::create_bid_with_commission",
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
      txBlock.pure(tradeportBeneficiaryAddress),
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

  if (!buyerKiosk) {
    txBlock.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [
        {
          kind: "NestedResult",
          index:  txBlock.getTotalTxsCount() - 4,
          resultIndex: 0
        }
      ],
      typeArguments: [
        "0x2::kiosk::Kiosk"
      ]
    })
    txBlock.incrementTotalTxsCount()
  }
}