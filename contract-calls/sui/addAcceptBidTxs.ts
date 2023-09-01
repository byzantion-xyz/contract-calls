import { bluemoveCreatorConfigObject, bluemoveMarketConfigObject, bluemoveOfferDataObject, bluemoveRoyaltyCollectionObject, collectionIdsThatRequireKioskLocking, tradeportBiddingStore, tradeportKioskBiddingEscrowKiosk, tradeportKioskBiddingStore } from "../constants"
import { getSuiBidderKiosk } from "../utils/getSuiBidderKiosk"
import { getSuiOwnerCapByKiosk } from "../utils/getSuiOwnerCapByKiosk"

export async function addTradeportAcceptBidTx({txBlock, nft, nftContract, bid, sharedObjects}) {
  const { collection, royaltyStrategy } = sharedObjects

  if (collection && royaltyStrategy) {
    txBlock.moveCall({
      target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::biddings::ob_accept_bid",
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
      target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::biddings::accept_bid",
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

export async function addTradeportKioskAcceptBidTx({txBlock, nft, nftContract, bid, sharedObjects}) {
  const { transferPolicy } = sharedObjects
  const sellerKiosk = nft?.chain_state?.kiosk_id
  const sellerKioskOwnerCap = await getSuiOwnerCapByKiosk(sellerKiosk)

  txBlock.moveCall({
    target: "0x33a9e4a3089d911c2a2bf16157a1d6a4a8cbd9a2106a98ecbaefe6ed370d7a25::kiosk_biddings::accept_bid",
    arguments: [
      txBlock.object(tradeportKioskBiddingStore),
      txBlock.pure(bid?.nonce),
      txBlock.object(tradeportKioskBiddingEscrowKiosk),
      txBlock.object(sellerKiosk),
      txBlock.object(sellerKioskOwnerCap),
      txBlock.object(nft?.token_id),
      txBlock.object(transferPolicy)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()

  const requiresKioskLocking = collectionIdsThatRequireKioskLocking?.includes(nft?.collection?.id)

  if (requiresKioskLocking) {
    txBlock.moveCall({
      target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::kiosk_lock_rule::prove",
      arguments: [
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 1,
          resultIndex: 1
        },
        txBlock.object(tradeportKioskBiddingEscrowKiosk),
      ],
      typeArguments: [
        nftContract.properties.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()

    txBlock.moveCall({
      target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::pay",
      arguments: [
        txBlock.object(transferPolicy),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 1
        },
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 0
        }
      ],
      typeArguments: [
        nftContract.properties.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()
  }

  txBlock.moveCall({
    target: "0x2::transfer_policy::confirm_request",
    arguments: [
      txBlock.object(transferPolicy),
      {
        kind: "NestedResult",
        index: requiresKioskLocking ? txBlock.getTotalTxsCount() - 3 : txBlock.getTotalTxsCount() - 1,
        resultIndex: 1
      }
    ],
    typeArguments: [
      nftContract.properties.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()
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
      target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::bidding::sell_nft_from_kiosk",
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
      target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::bidding::sell_nft",
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
    target: "0x353c4070df66f1e9d8542a621844765170338e633bdbaf37331f5c89c85a6968::transfer_allowlist::confirm_transfer",
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
      target: "0x353c4070df66f1e9d8542a621844765170338e633bdbaf37331f5c89c85a6968::royalty_strategy_bps::confirm_transfer",
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
    target: "0xb2b8d1c3fd2b5e3a95389cfcf6f8bda82c88b228dff1f0e1b76a63376cbad7c6::transfer_request::confirm",
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
      nftContract.properties.nft_type
    ]
  })
}