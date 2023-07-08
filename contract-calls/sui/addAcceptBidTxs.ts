import { bluemoveCreatorConfigObject, bluemoveMarketConfigObject, bluemoveOfferDataObject, bluemoveRoyaltyCollectionObject, originByteAllowListObject, tradeportBiddingStore } from "../constants"
import { getSuiBidderKiosk } from "../utils/getSuiBidderKiosk"

export async function addTradeportAcceptBidTx({
  txBlock, 
  nft, 
  nftContract, 
  bid, 
  sharedObjects
}) {
  const { collection, royaltyStrategy } = sharedObjects

  if (collection && royaltyStrategy) {
    txBlock.moveCall({
      target: "0x7925fb044dbed3eda525ce059120f5ce3dbd6887ae6937ee9301383423406b57::biddings::ob_accept_bid",
      arguments: [
        txBlock.object(tradeportBiddingStore),
        txBlock.pure(bid?.nonce),
        txBlock.object(nft?.token_id),
        txBlock.object(collection),
        txBlock.object(royaltyStrategy)
      ],
      typeArguments: [
        nftContract?.properties?.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()
  } else {
    txBlock.moveCall({
      target: "0x7925fb044dbed3eda525ce059120f5ce3dbd6887ae6937ee9301383423406b57::biddings::accept_bid",
      arguments: [
        txBlock.object(tradeportBiddingStore),
        txBlock.pure(bid?.nonce),
        txBlock.object(nft?.token_id)
      ],
      typeArguments: [
        nftContract?.properties?.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()
  }
}

export async function addOriginByteAcceptBidTx({
  txBlock, 
  nft, 
  nftContract, 
  bid,
  sharedObjects
}) {
  const { transferPolicy, royaltyStrategy, allowList } = sharedObjects
  const senderKiosk = nft?.chain_state?.kiosk_id
  const receiverKiosk = await getSuiBidderKiosk(bid?.nonce)

  if (senderKiosk) {
    txBlock.moveCall({
      target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::bidding::sell_nft_from_kiosk",
      arguments: [
        txBlock.object(bid?.nonce),
        txBlock.object(senderKiosk),
        txBlock.object(receiverKiosk),
        txBlock.object(nft?.token_id)
      ],
      typeArguments: [
        nftContract.properties.nft_type,
        "0x2::sui::SUI"
      ]
    })
    txBlock.incrementTotalTxsCount()
  } else {
    txBlock.moveCall({
      target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::bidding::sell_nft",
      arguments: [
        txBlock.object(bid?.nonce),
        txBlock.object(receiverKiosk),
        txBlock.object(nft?.token_id)
      ],
      typeArguments: [
        nftContract.properties.nft_type,
        "0x2::sui::SUI"
      ]
    })
    txBlock.incrementTotalTxsCount()
  }

  txBlock.moveCall({
    target: "0x77d0f09420a590ee59eeb5e39eb4f953330dbb97789e845b6e43ce64f16f812e::transfer_allowlist::confirm_transfer",
    arguments: [
      txBlock.object(allowList),
      {
        kind: "Result",
        index: txBlock.getTotalTxsCount() - 1
      },
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()

  if (royaltyStrategy) {
    txBlock.moveCall({
      target: "0x77d0f09420a590ee59eeb5e39eb4f953330dbb97789e845b6e43ce64f16f812e::royalty_strategy_bps::confirm_transfer",
      arguments: [
        txBlock.object(royaltyStrategy),
        {
          kind: "Result",
          index: txBlock.getTotalTxsCount() - 2
        },
      ],
      typeArguments: [
        nftContract?.properties?.nft_type,
        "0x2::sui::SUI"
      ]
    })
    txBlock.incrementTotalTxsCount()
  }

  txBlock.moveCall({
    target: "0xe2c7a6843cb13d9549a9d2dc1c266b572ead0b4b9f090e7c3c46de2714102b43::transfer_request::confirm",
    arguments: [
      {
        kind: "Result",
        index: royaltyStrategy ? txBlock.getTotalTxsCount() - 3 : txBlock.getTotalTxsCount() - 2
      },
      txBlock.object(transferPolicy),
    ],
    typeArguments: [
      nftContract?.properties?.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addBluemoveAcceptBidTx({txBlock, nft, nftContract, bid}) {
  if (nft?.listings?.[0]?.price && nft?.listings?.[0]?.market_name === "bluemove") {
    txBlock.moveCall({
      target: "0xd5dd28cc24009752905689b2ba2bf90bfc8de4549b9123f93519bb8ba9bf9981::marketplace::delist",
      arguments: [
        txBlock.object(bluemoveMarketConfigObject),
        txBlock.object(nft?.token_id),
      ],
      typeArguments: [
        nftContract.properties.nft_type,
        nftContract.properties.nft_type,
      ]
    })
  }
  txBlock.moveCall({
    target: "0xd5dd28cc24009752905689b2ba2bf90bfc8de4549b9123f93519bb8ba9bf9981::offer_item::accept_offer_nft",
    arguments: [
      txBlock.object(bluemoveMarketConfigObject),
      txBlock.object(bluemoveRoyaltyCollectionObject),
      txBlock.object(bluemoveCreatorConfigObject),
      txBlock.object(bluemoveOfferDataObject),
      txBlock.pure(bid?.nonce),
      (nft?.listings?.[0]?.price && nft?.listings?.[0]?.market_name === "bluemove") ?
        {
          kind: "Result",
          index: 0
        }
        :
        txBlock.pure(nft?.token_id),
    ],
    typeArguments: [
      nftContract.properties.nft_type,
    ]
  })
}