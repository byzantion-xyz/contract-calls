import { gqlChainRequest } from "../utils/gqlChainRequest"
import { parseCrypto } from "../utils/parseCrypto"
import { tradeportBeneficiaryAddress, tradeportBiddingStore } from "../constants"
import { fetchWalletKiosks } from "../queries/fetchWalletKiosks"
import {getSuiMarketFeePrice} from "../utils/getSuiMarketFeePrice"

export function addTradePortBidTx({txBlock, nft, nftContract, bidAmount}) {
  const bidPrice = Number(parseCrypto(bidAmount, "sui"))
  const marketFeePrice = getSuiMarketFeePrice({price: bidPrice, nftType: nftContract?.properties?.nft_type})

  txBlock.splitCoins(txBlock.gas,
    [txBlock.pure(bidPrice + marketFeePrice)]
  )
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::biddings::bid",
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

export async function addOriginByteBidTx({txBlock, nft, nftContract, bidAmount, bidder}) {
  const buyerKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: bidder}})
  const buyerKiosk = buyerKioskRes?.kiosks?.filter(kiosk => kiosk?.is_origin_byte)?.[0]?.id

  if (!buyerKiosk) {
    txBlock.moveCall({
      target: "0x083b02db943238dcea0ff0938a54a17d7575f5b48034506446e501e963391480::ob_kiosk::new",
      arguments: [],
      typeArguments: []
    })
    txBlock.incrementTotalTxsCount()

    txBlock.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [
        {
          kind: "NestedResult",
          index:  txBlock.getTotalTxsCount() - 1,
          resultIndex: 0
        }
      ],
      typeArguments: [
        "0x2::kiosk::Kiosk"
      ]
    })
    txBlock.incrementTotalTxsCount()
  }

  const bidPrice = Number(parseCrypto(bidAmount, "sui"))
  const marketFeePrice = getSuiMarketFeePrice({price: bidPrice, nftType: nftContract?.properties?.nft_type})

  txBlock.splitCoins(txBlock.gas,
    [txBlock.pure(bidPrice + marketFeePrice)]
  )
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::bidding::create_bid_with_commission",
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