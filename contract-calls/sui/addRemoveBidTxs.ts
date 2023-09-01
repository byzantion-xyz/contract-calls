import { bluemoveOfferDataObject, tocenMarketplaceObject, tradeportBiddingStore, tradeportKioskBiddingStore } from "../constants";

export function addTradeportRemoveBidSuiTx({txBlock, nftContract, bid}) {
  txBlock.moveCall({
    target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::biddings::cancel_bid",
    arguments: [
      txBlock.object(tradeportBiddingStore),
      txBlock.pure(bid?.nonce)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addTradeportKioskRemoveBidSuiTx({txBlock, nftContract, bid}) {
  txBlock.moveCall({
    target: "0x33a9e4a3089d911c2a2bf16157a1d6a4a8cbd9a2106a98ecbaefe6ed370d7a25::kiosk_biddings::cancel_bid",
    arguments: [
      txBlock.object(tradeportKioskBiddingStore),
      txBlock.pure(bid?.nonce)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addOriginByteRemoveBidSuiTx({txBlock, bid}) {
  txBlock.moveCall({
    target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::bidding::close_bid",
    arguments: [
      txBlock.pure(bid?.nonce)
    ],
    typeArguments: [
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addBluemoveRemoveBidSuiTx({txBlock, nft, nftContract, bid}) {
  txBlock.moveCall({
    target: "0xd5dd28cc24009752905689b2ba2bf90bfc8de4549b9123f93519bb8ba9bf9981::offer_item::cancel_offer_nft",
    arguments: [
      txBlock.object(bluemoveOfferDataObject),
      txBlock.object(nft?.token_id),
      txBlock.pure(bid?.nonce),
    ],
    typeArguments: [
      nftContract.properties.nft_type, // nft type - "f1681f601a1c021a0b4c8c8859d50917308fcbebfd19364c4e856ac670bb8496::suishi::Suishi"
    ]
  })
}

export function addTocenRemoveBidSuiTx({txBlock, nft, nftContract, bid}) {
  txBlock.moveCall({
    target: "0x3605d91c559e80cf8fdeabae9abaccb0bc38f96eac0b32bf47e95a9159a5277f::tocen_marketplace::cancel_offer",
    arguments: [
      txBlock.pure(tocenMarketplaceObject),
      txBlock.pure(nft?.token_id),
      txBlock.pure(bid?.price_str),
    ],
    typeArguments: [
    ]
  })
}