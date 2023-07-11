import { bluemoveMarketConfigObject, keepsakeMarketplaceKiosk, keepsakeMarketplaceObject, souffl3VersionObject, tocenMarketplaceObject, tradeportListingStore } from "../constants"

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

export function addOriginByteUnlistTx({
  txBlock,
  nft,
  nftContract,
  sharedObjects
}) {
  const { orderbook } = sharedObjects

  txBlock.moveCall({
    target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::orderbook::cancel_ask",
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
}