import { gqlChainRequest } from "../utils/gqlChainRequest"
import { parseCrypto } from "../utils/parseCrypto"
import { tradeportBeneficiaryAddress, tradeportBiddingStore, tradeportKioskBiddingStore } from "../constants"
import { fetchWalletKiosks } from "../queries/fetchWalletKiosks"
import {getSuiMarketFeePrice} from "../utils/getSuiMarketFeePrice"

export function addTradePortBidTx({txBlock, nft, nftContract, bidAmount}) {
  const bidPrice = Number(parseCrypto(bidAmount, "sui"))
  const marketFeePrice = getSuiMarketFeePrice({price: bidPrice, collectionId: nft?.collection?.id})

  txBlock.splitCoins(txBlock.gas,
    [txBlock.pure(bidPrice + marketFeePrice)]
  )
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x398aae1ad267d989dcc99ba449b0a30101a6b851ec1284ccddab5937df66bfcf::biddings::bid",
    arguments: [
      txBlock.object(tradeportBiddingStore),
      txBlock.pure(nft?.token_id),
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
      nftContract?.properties?.nft_type
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

export function addTradePortKioskBidTx({txBlock, nft, nftContract, bidAmount, sharedObjects}) {
  const bidPrice = Number(parseCrypto(bidAmount, "sui"))
  const marketFeePrice = getSuiMarketFeePrice({price: bidPrice, collectionId: nft?.collection?.id})
  const { transferPolicy } = sharedObjects

  txBlock.moveCall({
    target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::fee_amount",
    arguments: [
      txBlock.object(transferPolicy),
      txBlock.pure(bidPrice?.toString()),
    ],
    typeArguments: [
      nftContract.properties.nft_type
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
    target: "0x33a9e4a3089d911c2a2bf16157a1d6a4a8cbd9a2106a98ecbaefe6ed370d7a25::kiosk_biddings::bid",
    arguments: [
      txBlock.object(tradeportKioskBiddingStore),
      txBlock.pure(nft?.token_id),
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
      nftContract?.properties?.nft_type
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

export async function addOriginByteBidTx({txBlock, nft, nftContract, bidAmount, bidder}) {
  const buyerKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: bidder}})
  const buyerKiosk = buyerKioskRes?.kiosks?.filter(kiosk => kiosk?.is_origin_byte)?.[0]?.id

  if (!buyerKiosk) {
    txBlock.moveCall({
      target: "0x787afe0cb02641274667b31235d3d0e1a2d1c43cf984d08007268b9928528493::ob_kiosk::create_for_sender",
      arguments: [],
      typeArguments: []
    })
    txBlock.incrementTotalTxsCount()
  }

  const bidPrice = Number(parseCrypto(bidAmount, "sui"))
  const marketFeePrice = getSuiMarketFeePrice({price: bidPrice, collectionId: nft?.collection?.id})

  txBlock.splitCoins(txBlock.gas,
    [txBlock.pure(bidPrice + marketFeePrice)]
  )
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::bidding::create_bid_with_commission",
    arguments: [
      !buyerKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 0
        }
        : txBlock.object(buyerKiosk),
      txBlock.object(nft?.token_id),
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