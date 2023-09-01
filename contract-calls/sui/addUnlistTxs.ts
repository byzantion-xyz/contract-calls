import { bluemoveKioskMarketplaceKioskObject, bluemoveMarketConfigObject, hyperspaceMpTransferPolicyType, keepsakeMarketplaceKiosk, keepsakeMarketplaceObject, souffl3VersionObject, tocenMarketplaceObject, tradeportKioskListingStore, tradeportListingStore } from "../constants"
import { fetchWalletKiosks } from "../queries/fetchWalletKiosks"
import { getSuiOwnerCapByKiosk } from "../utils/getSuiOwnerCapByKiosk"
import { gqlChainRequest } from "../utils/gqlChainRequest"

export function addTradePortUnlistTx({txBlock, nft, nftContract}) {
  txBlock.moveCall({
    target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::listings::unlist",
    arguments: [
      txBlock.object(tradeportListingStore),
      txBlock.pure(nft?.listings?.[0]?.nonce)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export async function addTradePortKioskUnlistTx({txBlock, nft, nftContract}) {
  const sellerKiosk = nft?.chain_state?.kiosk_id
  const sellerKioskOwnerCap = await getSuiOwnerCapByKiosk(sellerKiosk)

  txBlock.moveCall({
    target: "0x33a9e4a3089d911c2a2bf16157a1d6a4a8cbd9a2106a98ecbaefe6ed370d7a25::kiosk_listings::unlist",
    arguments: [
      txBlock.object(tradeportKioskListingStore),
      txBlock.object(sellerKiosk), 
      txBlock.object(sellerKioskOwnerCap),
      txBlock.object(nft?.token_id)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addOriginByteUnlistTx({
  txBlock,
  nft,
  nftContract,
  sharedObjects
}) {
  const { orderbook } = sharedObjects

  txBlock.moveCall({
    target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::orderbook::cancel_ask",
    arguments: [
      txBlock.object(orderbook),
      txBlock.object(nft?.listings[0]?.nonce),
      txBlock.pure(nft?.listings[0]?.price_str),
      txBlock.pure(nft?.token_id)
    ],
    typeArguments: [
      nftContract.properties.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addSouffl3UnlistTx({txBlock, nftContract, listingsToUnlist}) {
  txBlock.moveCall({
    target: "0x30d90b5b67be77e6e06f02dae9f0f2fcdad16e38854316ae8a7b4f5b4971f5e0::Market::delist_generic",
    arguments: [
      txBlock.object(souffl3VersionObject),
      txBlock.pure(listingsToUnlist?.[0]?.nonce),
    ],
    typeArguments: [
      nftContract?.properties?.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addBlueMoveUnlistTx({txBlock, nft, nftContract}) {
  txBlock.moveCall({
    target: "0xd5dd28cc24009752905689b2ba2bf90bfc8de4549b9123f93519bb8ba9bf9981::marketplace::delist_and_take",
    arguments: [
      txBlock.object(bluemoveMarketConfigObject), // marketplace config object
      txBlock.pure(nft?.token_id), // nft object id
    ],
    typeArguments: [
      nftContract?.properties?.nft_type, // nft type
      nftContract?.properties?.nft_type, // nft type
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export async function addBluemoveKioskUnlistTx({txBlock, connectedWalletId, nft, nftContract}) {
  const buyerKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: connectedWalletId}})
  const buyerStandardKiosk = buyerKioskRes?.kiosks?.filter(kiosk => !kiosk?.is_origin_byte)?.[0]?.id

  txBlock.moveCall({
    target: "0x2949e130ca4dabfe6448173758468a3e45ea3f070e3264f112b51c023f3ecf9f::kiosk_trade::kiosk_delist",
    arguments: [
      txBlock.object(bluemoveKioskMarketplaceKioskObject),
      txBlock.object(buyerStandardKiosk),
      txBlock.object(nft?.token_id)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addKeepsakeUnlistTx({txBlock, nft, nftContract, listingsToUnlist}) {
  txBlock.moveCall({
    target: "0x2be8c4a1a3cea4d3255d870d367c87838a8cc2bfe4f216a6b67b153027087a7::keepsake_marketplace::delist_and_take",
    arguments: [
      txBlock.object(keepsakeMarketplaceObject), // marketplace object
      txBlock.object(keepsakeMarketplaceKiosk), // kiosk object
      txBlock.pure(nft?.token_id), // nft token id
    ],
    typeArguments: [
      nftContract?.properties?.nft_type, // nft type
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export async function addHyperspaceUnlistTx({txBlock, buyer, nft, nftContract}) {
  const buyerKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: buyer}})
  const buyerStandardKiosk = buyerKioskRes?.kiosks?.filter(kiosk => !kiosk?.is_origin_byte)?.[0]?.id
  const buyerStandardKioskOwnerCap = await getSuiOwnerCapByKiosk(buyerStandardKiosk)

  txBlock.splitCoins(txBlock.gas, [txBlock.pure(1)])
  txBlock.incrementTotalTxsCount()
  txBlock.addToTotalBuyerCoinsAmount(1)

  txBlock.moveCall({
    target: "0x6ea97b03c441edd54ae89224bf9560e583ee66c37e6c246f5db35258e580ba94::hyperspace::delist",
    arguments: [
      txBlock.object(buyerStandardKiosk),
      txBlock.object(buyerStandardKioskOwnerCap),
      txBlock.pure(nft?.token_id)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type,
      hyperspaceMpTransferPolicyType
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.transferObjects(
    [
      {
        kind: "Result",
        index: txBlock.getTotalTxsCount() - 2,
      }
    ],
    txBlock.pure(nft?.token_id)
  )
  txBlock.incrementTotalTxsCount()
}

export function addTocenUnlistTx({txBlock, nft, nftContract}) {
  txBlock.moveCall({
    target: "0x3605d91c559e80cf8fdeabae9abaccb0bc38f96eac0b32bf47e95a9159a5277f::tocen_marketplace::delist_and_take",
    arguments: [
      txBlock.pure(tocenMarketplaceObject), // marketplace object
      txBlock.pure(nft?.token_id), // nft token id
    ],
    typeArguments: [
      nftContract?.properties?.nft_type, // nft type
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addSomisUnlistTx({txBlock, nft, nftContract, marketplace}) {
  txBlock.moveCall({
    target: "0xf0b0beb956e26bde50dbd6ac393026c4525aee3b194a9478f09748f7211b5a02::marketplace::cancel_ask",
    arguments: [
      txBlock.pure(marketplace),
      txBlock.pure(nft?.token_id),
      txBlock.pure(nft?.listings[0]?.price)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}