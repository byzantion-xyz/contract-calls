import { bluemoveOfferDataObject, tocenMarketplaceObject, tradeportBiddingStore } from "../constants";

export function addTradeportRemoveBidSuiTx({txBlock, nftContract, bid}) {
  txBlock.moveCall({
    target: "0x7925fb044dbed3eda525ce059120f5ce3dbd6887ae6937ee9301383423406b57::biddings::cancel_bid",
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

export function addOriginByteRemoveBidSuiTx({txBlock, bid}) {
  txBlock.moveCall({
    target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::bidding::close_bid",
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