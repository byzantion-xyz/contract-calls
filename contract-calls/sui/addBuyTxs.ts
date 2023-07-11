import { gqlChainRequest } from "../utils/gqlChainRequest"
import {
  bluemoveCreatorConfigObject,
  bluemoveMarketConfigObject,
  bluemoveRoyaltyCollectionObject,
  keepsakeMarketplaceKiosk,
  keepsakeMarketplaceObject,
  souffl3ExtensionObject,
  souffl3MarketplaceObject,
  souffl3VersionObject,
  tocenMarketplaceObject,
  tradeportListingStore
} from "../constants"
import { fetchWalletKiosks } from "../queries/fetchWalletKiosks"
import { getNftContractCommission } from "../utils/getNftContractCommission"

export function addTradePortBuyTx({txBlock, nftContract, listing, sharedObjects}) {
  txBlock.splitCoins(txBlock.gas, [txBlock.pure(listing?.price)])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(listing?.price)

  const { collection, royaltyStrategy } = sharedObjects
  if (collection && royaltyStrategy) {
    txBlock.moveCall({
      target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::listings::ob_buy",
      arguments: [
        txBlock.object(tradeportListingStore),
        txBlock.pure(listing?.nonce),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 1,
          resultIndex: 0
        },
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
      target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::listings::buy",
      arguments: [
        txBlock.object(tradeportListingStore),
        txBlock.pure(listing?.nonce),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 1,
          resultIndex: 0
        }
      ],
      typeArguments: [
        nftContract?.properties?.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()
  }
  
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

export async function addOriginByteBuyTx({
  txBlock,
  buyer,
  nft,
  nftContract,
  listing,
  sharedObjects
}) {
  const { orderbook, royaltyStrategy, transferPolicy, allowList } = sharedObjects

  const buyerKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: buyer}})
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

  txBlock.splitCoins(txBlock.gas, [txBlock.pure(listing?.price)])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(listing?.price)

  txBlock.moveCall({
    target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::orderbook::buy_nft",
    arguments: [
      txBlock.object(orderbook),
      txBlock.object(listing?.nonce),
      !buyerKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 0
        }
        : txBlock.object(buyerKiosk),
      txBlock.object(nft?.token_id),
      txBlock.pure(listing?.price_str),
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      }
    ],
    typeArguments: [
      nftContract?.properties?.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

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

  txBlock.moveCall({
    target: "0x2::coin::destroy_zero",
    arguments: [
      {
        kind: "NestedResult",
        index: royaltyStrategy ? txBlock.getTotalTxsCount() - 5 : txBlock.getTotalTxsCount() - 4,
        resultIndex: 0
      }
    ],
    typeArguments: [
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addSouffl3BuyTx({txBlock, remainingWalletBalance, nftContract, listing, sharedObjects}) {
  if (txBlock.getTotalSouffl3BuyTxsCount() == 0) {
    txBlock.splitCoins(txBlock.gas, [txBlock.pure(remainingWalletBalance - 50000000)])
    txBlock.incrementTotalTxsCount()
    txBlock.incrementTotalSouffl3BuyTxsCount()
  }

  const { transferPolicy } = sharedObjects

  if (transferPolicy) {
    txBlock.moveCall({
      target: "0x30d90b5b67be77e6e06f02dae9f0f2fcdad16e38854316ae8a7b4f5b4971f5e0::Market::buy_with_sui_with_ext",
      arguments: [
        txBlock.object(souffl3VersionObject),
        txBlock.object(souffl3ExtensionObject),
        txBlock.object(transferPolicy),
        txBlock.object(listing?.nonce),
        txBlock.pure(listing?.price),
        txBlock.object(souffl3MarketplaceObject),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 1,
          resultIndex: 0
        }
      ],
      typeArguments: [
        nftContract?.properties?.nft_type,
      ]
    })
    txBlock.incrementTotalTxsCount()
    txBlock.incrementTotalSouffl3BuyTxsCount()
  } else {
    txBlock.moveCall({
      target: "0x30d90b5b67be77e6e06f02dae9f0f2fcdad16e38854316ae8a7b4f5b4971f5e0::Market::buy_generic_with_ext",
      arguments: [
        txBlock.object(souffl3VersionObject),
        txBlock.object(souffl3ExtensionObject),
        txBlock.object(listing?.nonce),
        txBlock.pure(listing?.price),
        txBlock.object(souffl3MarketplaceObject),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 1,
          resultIndex: 0
        }
      ],
      typeArguments: [
        nftContract?.properties?.nft_type,
        "0x2::sui::SUI"
      ]
    })
    txBlock.incrementTotalTxsCount()
    txBlock.incrementTotalSouffl3BuyTxsCount()
  }
}

export function addBlueMoveBuyTx({txBlock, nft, nftContract, listing}) {
  txBlock.splitCoins(txBlock.gas, [txBlock.pure(listing?.price_str)])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(listing?.price)

  txBlock.moveCall({
    target: "0xd5dd28cc24009752905689b2ba2bf90bfc8de4549b9123f93519bb8ba9bf9981::marketplace::buy_and_take",
    arguments: [
      txBlock.object(bluemoveMarketConfigObject),
      txBlock.object(bluemoveRoyaltyCollectionObject),
      txBlock.object(bluemoveCreatorConfigObject),
      txBlock.object(nft?.token_id),
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      },
      txBlock.pure(listing?.price_str),
    ],
    typeArguments: [
      nftContract.properties.nft_type,
      nftContract.properties.nft_type,
    ]
  })
  txBlock.incrementTotalTxsCount()
}


export async function addKeepsakeBuyTx({txBlock, buyer, nft, nftContract, listing}) {
  const commission = await getNftContractCommission({chain: "sui", nftContractId: nftContract?.id})
  const royaltyStrategy = nftContract?.properties?.shared_objects?.find(o => o.type?.includes("royalty_strategy_bps"))?.id
  const transferPolicy = nftContract?.properties?.shared_objects?.find(o => o.type?.includes("transfer_policy"))?.id

  txBlock.splitCoins(txBlock.gas, [
    txBlock.pure(listing?.price), // base list price
    txBlock.pure((listing?.price * commission?.royalty / 100) + (listing?.price * commission?.royalty * 0.00005)), // base list price * artist royalty
  ])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(listing?.price + (listing?.price * commission?.royalty / 100) + (listing?.price * commission?.royalty * 0.00005))

  txBlock.moveCall({
    target: "0x2::coin::into_balance",
    arguments: [
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 1
      }, // split coins result
    ],
    typeArguments: [
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x2be8c4a1a3cea4d3255d870d367c87838a8cc2bfe4f216a6b67b153027087a7::keepsake_marketplace::buy",
    arguments: [
      txBlock.object(keepsakeMarketplaceObject), // marketplace object
      txBlock.object(keepsakeMarketplaceKiosk), // seller kiosk object
      txBlock.pure(nft?.token_id), // nft token id
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 2,
        resultIndex: 0
      } // split coins result
    ],
    typeArguments: [
      nftContract?.properties?.nft_type, // nft type - "f1681f601a1c021a0b4c8c8859d50917308fcbebfd19364c4e856ac670bb8496::suishi::Suishi"
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x2be8c4a1a3cea4d3255d870d367c87838a8cc2bfe4f216a6b67b153027087a7::keepsake_royalties::confirm_transfer_with_balance",
    arguments: [
      txBlock.object(royaltyStrategy), // collection royalty strategy object
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      }, // buy nft result
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 2,
        resultIndex: 0
      } // coin into balance result
    ],
    typeArguments: [
      nftContract?.properties?.nft_type, // nft type - "f1681f601a1c021a0b4c8c8859d50917308fcbebfd19364c4e856ac670bb8496::suishi::Suishi"
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x2be8c4a1a3cea4d3255d870d367c87838a8cc2bfe4f216a6b67b153027087a7::transfer_policy::confirm_request",
    arguments: [
      txBlock.object(transferPolicy), // collection transfer policy object
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 2,
        resultIndex: 0
      }, // buy nft result
    ],
    typeArguments: [
      nftContract?.properties?.nft_type, // nft type - "f1681f601a1c021a0b4c8c8859d50917308fcbebfd19364c4e856ac670bb8496::suishi::Suishi"
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x2::coin::from_balance",
    arguments: [
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 4,
        resultIndex: 0
      }, // buy nft result
    ],
    typeArguments: [
      "0x2::sui::SUI" // token type (leave hardcdoded)
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.transferObjects(
    [
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      } // split coins result
    ],
    txBlock.pure(buyer) // buyer address - "0x83e298a71b5b2d448c4968328dc035ce0eb2f4e619da28555ac040ccc9057897"
  )
  txBlock.incrementTotalTxsCount()
}

export const addTocenBuyTx = ({txBlock, nftTokenIds, nftType, totalPrice}) => {
  txBlock.splitCoins(txBlock.gas, [txBlock.pure(totalPrice)])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(totalPrice)

  txBlock.moveCall({
    target: "0x3605d91c559e80cf8fdeabae9abaccb0bc38f96eac0b32bf47e95a9159a5277f::tocen_marketplace::buy_cart",
    arguments: [
      txBlock.pure(tocenMarketplaceObject),
      txBlock.pure(nftTokenIds),
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      }
    ],
    typeArguments: [
      nftType
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addSomisBuyTx({txBlock, nft, nftContract, listing, sharedObjects}) {
  txBlock.splitCoins(txBlock.gas, [txBlock.pure(listing?.price)])
  txBlock.incrementTotalTxsCount()

  const {orderbook} = sharedObjects

  txBlock.moveCall({
    target: "0xf0b0beb956e26bde50dbd6ac393026c4525aee3b194a9478f09748f7211b5a02::marketplace::buy_nft",
    arguments: [
      txBlock.object(orderbook),
      txBlock.pure(nft?.token_id),
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      }
    ],
    typeArguments: [
      nftContract.properties.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}