import { gqlChainRequest } from "../utils/gqlChainRequest"
import {
  bluemoveCreatorConfigObject,
  bluemoveKioskMarketplaceKioskObject,
  bluemoveMarketConfigObject,
  bluemoveRoyaltyCollectionObject,
  collectionIdsThatRequireKioskLocking,
  hyperspaceMpTransferPolicy,
  hyperspaceMpTransferPolicyType,
  hyperspaceTransferPolicy,
  hyperspaceTransferPolicyType,
  keepsakeMarketplaceKiosk,
  keepsakeMarketplaceObject,
  souffl3ExtensionObject,
  souffl3GenericBuyMethodCollections,
  souffl3MarketplaceObject,
  souffl3VersionObject,
  tocenMarketplaceObject,
  tradeportKioskListingStore,
  tradeportListingStore
} from "../constants"
import { fetchWalletKiosks } from "../queries/fetchWalletKiosks"
import { getNftContractCommission } from "../utils/getNftContractCommission"
import { getSuiOwnerCapByKiosk } from "../utils/getSuiOwnerCapByKiosk"

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

export async function addTradePortKioskBuyTx({txBlock, buyer, nft, nftContract, listing, sharedObjects}) {
  const { transferPolicy } = sharedObjects

  const buyerStandardKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: buyer}})
  const buyerStandardKiosk = buyerStandardKioskRes?.kiosks?.filter(kiosk => !kiosk?.is_origin_byte)?.[0]?.id
  const buyerStandardKioskOwnerCap = await getSuiOwnerCapByKiosk(buyerStandardKiosk)
  const sellerKiosk = nft?.chain_state?.kiosk_id

  const requiresKioskLocking = collectionIdsThatRequireKioskLocking?.includes(nft?.collection?.id)

  if (!buyerStandardKiosk) {
    txBlock.moveCall({
      target: "0x2::kiosk::new",
      arguments: [],
      typeArguments: []
    })
    txBlock.incrementTotalTxsCount()
  }

  txBlock.splitCoins(txBlock.gas, [txBlock.pure(listing?.price)])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(listing?.price)

  txBlock.moveCall({
    target: "0x33a9e4a3089d911c2a2bf16157a1d6a4a8cbd9a2106a98ecbaefe6ed370d7a25::kiosk_listings::buy",
    arguments: [
      txBlock.object(tradeportKioskListingStore),
      txBlock.object(sellerKiosk),
      !buyerStandardKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 0
        }
        :
        txBlock.object(buyerStandardKiosk),
      txBlock.pure(nft?.token_id),
      {
        kind: "Result",
        index: txBlock.getTotalTxsCount() - 1
      }
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()

  if (requiresKioskLocking) {
    txBlock.moveCall({
      target: "0x2::kiosk::lock",
      arguments: [
        !buyerStandardKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 3,
            resultIndex: 0
          }
          :
          txBlock.object(buyerStandardKiosk),
        !buyerStandardKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 3,
            resultIndex: 1
          }
          :
          txBlock.object(buyerStandardKioskOwnerCap),
        txBlock.object(transferPolicy),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 1,
          resultIndex: 0
        }
      ],
      typeArguments: [
        nftContract.properties.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()

    txBlock.moveCall({
      target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::kiosk_lock_rule::prove",
      arguments: [
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 1
        },
        !buyerStandardKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 4,
            resultIndex: 0
          }
          :
          txBlock.object(buyerStandardKiosk),
      ],
      typeArguments: [
        nftContract.properties.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()

    txBlock.moveCall({
      target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::fee_amount",
      arguments: [
        txBlock.object(transferPolicy),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 3,
          resultIndex: 2
        }
      ],
      typeArguments: [
        nftContract.properties.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()

    txBlock.splitCoins(txBlock.gas, [
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      }
    ])
    txBlock.incrementTotalTxsCount()
    txBlock.addToTotalBuyerCoinsAmount({
      kind: "NestedResult",
      index: txBlock.getTotalTxsCount() - 1,
      resultIndex: 0
    })

    txBlock.moveCall({
      target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::pay",
      arguments: [
        txBlock.object(transferPolicy),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 5,
          resultIndex: 1
        },
        {
          kind: "Result",
          index: txBlock.getTotalTxsCount() - 1
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
        index: requiresKioskLocking ? txBlock.getTotalTxsCount() - 6 : txBlock.getTotalTxsCount() - 1,
        resultIndex: 1
      }
    ],
    typeArguments: [
      nftContract.properties.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()

  if (!requiresKioskLocking) {
    txBlock.moveCall({
      target: "0x2::kiosk::place",
      arguments: [
        !buyerStandardKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 4,
            resultIndex: 0
          }
          :
          txBlock.object(buyerStandardKiosk),
        !buyerStandardKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 4,
            resultIndex: 1
          }
          :
          txBlock.object(buyerStandardKioskOwnerCap),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
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
        index: requiresKioskLocking ? txBlock.getTotalTxsCount() - 8 : txBlock.getTotalTxsCount() - 4,
        resultIndex: 0
      }
    ],
    typeArguments: [
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

  if (!buyerStandardKiosk) {
    txBlock.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [
        {
          kind: "NestedResult",
          index:  requiresKioskLocking ? txBlock.getTotalTxsCount() - 10 : txBlock.getTotalTxsCount() - 6,
          resultIndex: 0
        }
      ],
      typeArguments: [
        "0x2::kiosk::Kiosk"
      ]
    })
    txBlock.incrementTotalTxsCount()

    txBlock.transferObjects(
      [
        {
          kind: "NestedResult",
          index:  requiresKioskLocking ? txBlock.getTotalTxsCount() - 11 : txBlock.getTotalTxsCount() - 7,
          resultIndex: 1
        }
      ],
      txBlock.pure(buyer)
    )
    txBlock.incrementTotalTxsCount()
  }
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
      target: "0x787afe0cb02641274667b31235d3d0e1a2d1c43cf984d08007268b9928528493::ob_kiosk::new",
      arguments: [],
      typeArguments: []
    })
    txBlock.incrementTotalTxsCount()
  }

  txBlock.splitCoins(txBlock.gas, [txBlock.pure(listing?.price)])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(listing?.price)

  txBlock.moveCall({
    target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::orderbook::buy_nft",
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

  if (!buyerKiosk) {
    txBlock.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [
        {
          kind: "NestedResult",
          index:  txBlock.getTotalTxsCount() - 7,
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

export function addSouffl3BuyTx({txBlock, remainingWalletBalance, collectionId, nftContract, listing, sharedObjects}) {
  if (txBlock.getTotalSouffl3BuyTxsCount() == 0) {
    txBlock.splitCoins(txBlock.gas, [txBlock.pure(remainingWalletBalance - 50000000)])
    txBlock.incrementTotalTxsCount()
    txBlock.incrementTotalSouffl3BuyTxsCount()
  }

  const { transferPolicy } = sharedObjects

  if (transferPolicy && !souffl3GenericBuyMethodCollections?.includes(collectionId)) {
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

export async function addBluemoveKioskBuyTx({
  txBlock,
  buyer,
  nft,
  nftContract,
  listing,
  sharedObjects
}) {
  const {transferPolicy} = sharedObjects

  const buyerKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: buyer}})
  const buyerStandardKiosk = buyerKioskRes?.kiosks?.filter(kiosk => !kiosk?.is_origin_byte)?.[0]?.id
  const buyerStandardKioskOwnerCap = await getSuiOwnerCapByKiosk(buyerStandardKiosk)
  const sellerKiosk = nft?.chain_state?.kiosk_id

  if (!buyerStandardKiosk) {
    txBlock.moveCall({
      target: "0x2::kiosk::new",
      arguments: [],
      typeArguments: []
    })
    txBlock.incrementTotalTxsCount()
  }

  txBlock.moveCall({
    target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::fee_amount",
    arguments: [
      txBlock.object(transferPolicy),
      txBlock.pure(listing?.price_str),
    ],
    typeArguments: [
      nftContract.properties.nft_type,
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.splitCoins(txBlock.gas, [
    txBlock.pure(listing?.price_str),
    {
      kind: "Result",
      index: txBlock.getTotalTxsCount() - 1
    },
    txBlock.pure(listing?.price * 0.025),
  ])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(listing?.price)

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
      },
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 2
      }
    ]
  )
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x2949e130ca4dabfe6448173758468a3e45ea3f070e3264f112b51c023f3ecf9f::kiosk_trade::kiosk_buy_direct",
    arguments: [
      txBlock.object(bluemoveKioskMarketplaceKioskObject),
      txBlock.object(sellerKiosk),
      txBlock.object(transferPolicy),
      !buyerStandardKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 4,
          resultIndex: 0
        }
        :
        txBlock.object(buyerStandardKiosk),
      !buyerStandardKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 4,
          resultIndex: 1
        }
        :
        txBlock.object(buyerStandardKioskOwnerCap),
      txBlock.object(nft?.token_id),
      txBlock.pure(listing?.price_str),
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 2,
        resultIndex: 0
      }
    ],
    typeArguments: [
      nftContract.properties.nft_type,
    ]
  })
  txBlock.incrementTotalTxsCount()

  if (!buyerStandardKiosk) {
    txBlock.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 5,
          resultIndex: 0
        }
      ],
      typeArguments: [
        "0x2::kiosk::Kiosk"
      ]
    })
    txBlock.incrementTotalTxsCount()

    txBlock.transferObjects(
      [
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 6,
          resultIndex: 1
        }
      ],
      txBlock.pure(buyer)
    )
    txBlock.incrementTotalTxsCount()
  }
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
      },
    ],
    typeArguments: [
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.transferObjects(
    [
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      }
    ],
    txBlock.pure(buyer)
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

export function addSomisBuyTx({txBlock, nft, nftContract, listing, marketplace}) {
  txBlock.splitCoins(txBlock.gas, [txBlock.pure(listing?.price)])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(listing?.price)

  txBlock.moveCall({
    target: "0xf0b0beb956e26bde50dbd6ac393026c4525aee3b194a9478f09748f7211b5a02::marketplace::buy_nft",
    arguments: [
      txBlock.object(marketplace),
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

export async function addHyperspaceBuyTx({
  txBlock,
  buyer,
  nft,
  nftContract,
  listing,
  sharedObjects
}) {
  const {transferPolicy} = sharedObjects
  const buyerStandardKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: buyer}})
  const buyerStandardKiosk = buyerStandardKioskRes?.kiosks?.filter(kiosk => !kiosk?.is_origin_byte)?.[0]?.id
  const buyerStandardKioskOwnerCap = await getSuiOwnerCapByKiosk(buyerStandardKiosk)
  const sellerKiosk = nft?.chain_state?.kiosk_id

  const requiresKioskLocking = collectionIdsThatRequireKioskLocking?.includes(nft?.collection?.id)

  if (!buyerStandardKiosk) {
    txBlock.moveCall({
      target: "0x2::kiosk::new",
      arguments: [],
      typeArguments: []
    })
    txBlock.incrementTotalTxsCount()
  }

  txBlock.splitCoins(txBlock.gas, [txBlock.pure(listing?.price)])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(listing?.price)

  txBlock.moveCall({
    target: "0x6ea97b03c441edd54ae89224bf9560e583ee66c37e6c246f5db35258e580ba94::hyperspace::purchase",
    arguments: [
      txBlock.object(sellerKiosk),
      txBlock.pure(nft?.token_id),
      {
        kind: "Result",
        index: txBlock.getTotalTxsCount() - 1,
      }
    ],
    typeArguments: [
      nftContract.properties.nft_type,
      hyperspaceMpTransferPolicyType
    ]
  })
  txBlock.incrementTotalTxsCount()

  if (requiresKioskLocking) {
    txBlock.moveCall({
      target: "0x2::kiosk::lock",
      arguments: [
        !buyerStandardKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 3,
            resultIndex: 0
          }
          :
          txBlock.object(buyerStandardKiosk),
        !buyerStandardKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 3,
            resultIndex: 1
          }
          :
          txBlock.object(buyerStandardKioskOwnerCap),
        txBlock.object(transferPolicy),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 1,
          resultIndex: 0
        }
      ],
      typeArguments: [
        nftContract.properties.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()

    txBlock.moveCall({
      target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::kiosk_lock_rule::prove",
      arguments: [
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 1
        },
        !buyerStandardKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 4,
            resultIndex: 0
          }
          :
          txBlock.object(buyerStandardKiosk),
      ],
      typeArguments: [
        nftContract.properties.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()

    txBlock.moveCall({
      target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::fee_amount",
      arguments: [
        txBlock.object(transferPolicy),
        txBlock.object(listing?.price_str)
      ],
      typeArguments: [
        nftContract.properties.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()

    txBlock.splitCoins(txBlock.gas, [
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      }
    ])
    txBlock.incrementTotalTxsCount()
    txBlock.addToTotalBuyerCoinsAmount({
      kind: "NestedResult",
      index: txBlock.getTotalTxsCount() - 1,
      resultIndex: 0
    })

    txBlock.moveCall({
      target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::pay",
      arguments: [
        txBlock.object(transferPolicy),
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 5,
          resultIndex: 1
        },
        {
          kind: "Result",
          index: txBlock.getTotalTxsCount() - 1
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
        index: requiresKioskLocking ? txBlock.getTotalTxsCount() - 6 : txBlock.getTotalTxsCount() - 1,
        resultIndex: 1
      }
    ],
    typeArguments: [
      nftContract.properties.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::fee_amount",
    arguments: [
      txBlock.object(hyperspaceTransferPolicy),
      txBlock.object(listing?.price_str),
    ],
    typeArguments: [
      hyperspaceTransferPolicyType
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.splitCoins(txBlock.gas, [
    {
      kind: "NestedResult",
      index: txBlock.getTotalTxsCount() - 1,
      resultIndex: 0
    }
  ])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount({
    kind: "NestedResult",
    index: txBlock.getTotalTxsCount() - 1,
    resultIndex: 0
  })

  txBlock.moveCall({
    target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::pay",
    arguments: [
      txBlock.object(hyperspaceTransferPolicy),
      {
        kind: "NestedResult",
        index: requiresKioskLocking ? txBlock.getTotalTxsCount() - 9 : txBlock.getTotalTxsCount() - 4,
        resultIndex: 2
      },
      {
        kind: "Result",
        index: txBlock.getTotalTxsCount() - 1
      }
    ],
    typeArguments: [
      hyperspaceTransferPolicyType
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x2::transfer_policy::confirm_request",
    arguments: [
      txBlock.object(hyperspaceTransferPolicy),
      {
        kind: "NestedResult",
        index: requiresKioskLocking ? txBlock.getTotalTxsCount() - 10 : txBlock.getTotalTxsCount() - 5,
        resultIndex: 2
      }
    ],
    typeArguments: [
      hyperspaceTransferPolicyType
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::fee_amount",
    arguments: [
      txBlock.object(hyperspaceMpTransferPolicy),
      txBlock.object(listing?.price_str),
    ],
    typeArguments: [
      hyperspaceMpTransferPolicyType
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.splitCoins(txBlock.gas, [
    {
      kind: "NestedResult",
      index: txBlock.getTotalTxsCount() - 1,
      resultIndex: 0
    }
  ])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount({
    kind: "NestedResult",
    index: txBlock.getTotalTxsCount() - 1,
    resultIndex: 0
  })

  txBlock.moveCall({
    target: "0x434b5bd8f6a7b05fede0ff46c6e511d71ea326ed38056e3bcd681d2d7c2a7879::royalty_rule::pay",
    arguments: [
      txBlock.object(hyperspaceMpTransferPolicy),
      {
        kind: "NestedResult",
        index: requiresKioskLocking ? txBlock.getTotalTxsCount() - 13 : txBlock.getTotalTxsCount() - 8,
        resultIndex: 3
      },
      {
        kind: "Result",
        index: txBlock.getTotalTxsCount() - 1
      }
    ],
    typeArguments: [
      hyperspaceMpTransferPolicyType
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x2::transfer_policy::confirm_request",
    arguments: [
      txBlock.object(hyperspaceMpTransferPolicy),
      {
        kind: "NestedResult",
        index: requiresKioskLocking ? txBlock.getTotalTxsCount() - 14 : txBlock.getTotalTxsCount() - 9,
        resultIndex: 3
      }
    ],
    typeArguments: [
      hyperspaceMpTransferPolicyType
    ]
  })
  txBlock.incrementTotalTxsCount()

  if (!requiresKioskLocking) {
    txBlock.moveCall({
      target: "0x2::kiosk::place",
      arguments: [
        !buyerStandardKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 12,
            resultIndex: 0
          }
          :
          txBlock.object(buyerStandardKiosk),
        !buyerStandardKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 12,
            resultIndex: 1
          }
          :
          txBlock.object(buyerStandardKioskOwnerCap),
        {
          kind: "NestedResult",
          index: !buyerStandardKiosk ? txBlock.getTotalTxsCount() - 10 : txBlock.getTotalTxsCount() - 10,
          resultIndex: 0
        }
      ],
      typeArguments: [
        nftContract?.properties?.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()
  }

  if (!buyerStandardKiosk) {
    txBlock.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [
        {
          kind: "NestedResult",
          index: requiresKioskLocking ? txBlock.getTotalTxsCount() - 17 : txBlock.getTotalTxsCount() - 13,
          resultIndex: 0
        }
      ],
      typeArguments: [
        "0x2::kiosk::Kiosk"
      ]
    })
    txBlock.incrementTotalTxsCount()

    txBlock.transferObjects(
      [
        {
          kind: "NestedResult",
          index: requiresKioskLocking ? txBlock.getTotalTxsCount() - 18 : txBlock.getTotalTxsCount() - 14,
          resultIndex: 1
        }
      ],
      txBlock.pure(buyer)
    )
    txBlock.incrementTotalTxsCount()
  }
}
