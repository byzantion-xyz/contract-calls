import { bluemoveCreatorConfigObject, bluemoveKioskMarketplaceKioskObject, bluemoveKioskOfferCollectionBidderBag, bluemoveKioskOfferCollectionDataObject, bluemoveMarketConfigObject, bluemoveOfferCollectionDataObject, bluemoveRoyaltyCollectionObject, tocenMarketplaceObject } from "../constants"
import {gqlChainRequest} from "../utils/gqlChainRequest";
import {fetchWalletKiosks} from "../queries/fetchWalletKiosks";
import { tradeportBiddingStore } from "../constants";
import { getSuiOwnerCapByKiosk } from "../utils/getSuiOwnerCapByKiosk";
import { addTradeportKioskAcceptBidTx } from "./addAcceptBidTxs";
import { addOriginByteUnlistTx } from "./addUnlistTxs";

export async function addTradeportAcceptCollectionBidTx({txBlock, nft, nftContract, bid, sharedObjects}) {
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

export const addTradeportKioskAcceptCollectionBidTx = async ({txBlock, nft, nftContract, bid, sharedObjects}) => {
  await addTradeportKioskAcceptBidTx({txBlock, nft, nftContract, bid, sharedObjects})
}

export async function addOriginByteAcceptCollectionBidTx({txBlock, sender, nft, nftContract, bid, sharedObjects}) {
  if (nft?.listings?.[0]?.price) {
    addOriginByteUnlistTx({
      txBlock,
      nft,
      nftContract,
      sharedObjects
    })
  }
  
  const {orderbook, transferPolicy, royaltyStrategy, allowList} = sharedObjects
  let senderKiosk = nft?.chain_state?.kiosk_id

  if (!senderKiosk) {
    const senderKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: sender}})
    senderKiosk = senderKioskRes?.kiosks?.filter(kiosk => kiosk?.is_origin_byte)?.[0]?.id

    if (!senderKiosk) {
      txBlock.moveCall({
        target: "0x787afe0cb02641274667b31235d3d0e1a2d1c43cf984d08007268b9928528493::ob_kiosk::new",
        arguments: [],
        typeArguments: []
      })
      txBlock.incrementTotalTxsCount()

      txBlock.moveCall({
        target: "0x787afe0cb02641274667b31235d3d0e1a2d1c43cf984d08007268b9928528493::ob_kiosk::deposit",
        arguments: [
          !senderKiosk ?
            {
              kind: "NestedResult",
              index: txBlock.getTotalTxsCount() - 1,
              resultIndex: 0
            }
            : txBlock.object(senderKiosk),
          txBlock.object(nft?.token_id)
        ],
        typeArguments: [
          nftContract.properties.nft_type
        ]
      })
      txBlock.incrementTotalTxsCount()
    }
  }

  txBlock.moveCall({
    target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::orderbook::market_sell",
    arguments: [
      txBlock.object(orderbook),
      !senderKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 0
        }
        : txBlock.object(senderKiosk),
      txBlock.pure(bid?.price_str),
      txBlock.pure(nft?.token_id),
    ],
    typeArguments: [
      nftContract?.properties?.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::orderbook::trade_id",
    arguments: [
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      }
    ],
    typeArguments: []
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::orderbook::finish_trade",
    arguments: [
      txBlock.object(orderbook),
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      },
      !senderKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 4,
          resultIndex: 0
        }
        : txBlock.object(senderKiosk),
      txBlock.object(bid?.nonce)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

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

  if (!senderKiosk) {
    txBlock.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [
        {
          kind: "NestedResult",
          index: royaltyStrategy ? txBlock.getTotalTxsCount() - 8 : txBlock.getTotalTxsCount() - 7,
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


export function addBluemoveAcceptCollectionBidTx({txBlock, nft, nftContract, bid}) {
  if (nft?.listings?.[0]?.price) {
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
    target: "0xd5dd28cc24009752905689b2ba2bf90bfc8de4549b9123f93519bb8ba9bf9981::offer_collection::accept_offer_collection",
    arguments: [
      txBlock.object(bluemoveMarketConfigObject),
      txBlock.object(bluemoveRoyaltyCollectionObject),
      txBlock.object(bluemoveCreatorConfigObject),
      txBlock.object(bluemoveOfferCollectionDataObject),
      txBlock.pure(bid?.nonce),
      nft?.listings?.[0]?.price ?
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

export async function addBluemoveKioskAcceptCollectionBidTx({txBlock, sender, nft, nftContract, bid}) {
  let senderKiosk = nft?.chain_state?.kiosk_id
  let senderKioskOwnerCap = null
  if (senderKiosk) {
    senderKioskOwnerCap = await getSuiOwnerCapByKiosk(senderKiosk)
  }
  
  if (!senderKiosk) {
    const senderKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: sender}})
    senderKiosk = senderKioskRes?.kiosks?.filter(kiosk => kiosk?.is_origin_byte)?.[0]?.id

    if (!senderKiosk) {
      txBlock.moveCall({
        target: "0x083b02db943238dcea0ff0938a54a17d7575f5b48034506446e501e963391480::ob_kiosk::new",
        arguments: [],
        typeArguments: []
      })
      txBlock.incrementTotalTxsCount()
    }

    txBlock.moveCall({
      target: "0x083b02db943238dcea0ff0938a54a17d7575f5b48034506446e501e963391480::ob_kiosk::deposit",
      arguments: [
        !senderKiosk ?
            {
              kind: "NestedResult",
              index: txBlock.getTotalTxsCount() - 1,
              resultIndex: 0
            }
            : txBlock.object(senderKiosk),
        txBlock.object(nft?.token_id)
      ],
      typeArguments: [
        nftContract.properties.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()
  }

  txBlock.moveCall({
    target: "0x2949e130ca4dabfe6448173758468a3e45ea3f070e3264f112b51c023f3ecf9f::kiosk_offer_collection_v2::accept_offer_collection_v2",
    arguments: [
      txBlock.object(bluemoveKioskMarketplaceKioskObject),
      txBlock.object(bluemoveKioskOfferCollectionDataObject),
      txBlock.object(bluemoveKioskOfferCollectionBidderBag),
      txBlock.pure(bid?.nonce),
      !senderKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 0
        }
        : txBlock.object(senderKiosk),
      !senderKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 1
        }
        : txBlock.object(senderKioskOwnerCap),
      txBlock.object(nft?.token_id),
    ],
    typeArguments: [
      nftContract.properties.nft_type,
    ]
  })

  if (!senderKiosk) {
    txBlock.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [
        {
          kind: "NestedResult",
          index:  txBlock.getTotalTxsCount() - 3,
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

export function addTocenAcceptCollectionBidTx({txBlock, nft, nftContract, bid}) {
  txBlock.moveCall({
    target: "0x3605d91c559e80cf8fdeabae9abaccb0bc38f96eac0b32bf47e95a9159a5277f::tocen_marketplace::accept_offer_list",
    arguments: [
      txBlock.object(tocenMarketplaceObject),
      txBlock.pure(nft?.token_id),
      txBlock.pure(bid?.buyer),
      txBlock.pure(bid?.price_str),
    ],
    typeArguments: [
      nftContract.properties.nft_type,
    ]
  })
}