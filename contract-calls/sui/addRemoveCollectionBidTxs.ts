import { bluemoveOfferCollectionDataObject, tradeportBiddingStore } from "../constants";

export function addTradeportRemoveCollectionBidSuiTx({txBlock, nftContract, bid}) {
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

export function addTradePortKioskRemoveCollectionBidSuiTx({txBlock, nftContract, bid}) {
  addTradePortKioskRemoveCollectionBidSuiTx({txBlock, nftContract, bid})
}

export function addOriginByteRemoveCollectionBidSuiTx({
  txBlock,
  collectionContract,
  bid,
  bidder,
  sharedObjects}) {
  const {orderbook} = sharedObjects

  txBlock.moveCall({
    target: "0x2::coin::zero",
    arguments: [],
    typeArguments: [
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::orderbook::cancel_bid",
    arguments: [
      txBlock.object(orderbook),
      txBlock.pure(bid?.price),
      {
        kind: "NestedResult",
        index: txBlock.getTotalTxsCount() - 1,
        resultIndex: 0
      }
    ],
    typeArguments: [
      collectionContract?.properties?.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.transferObjects(
      [
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 0
        }
      ],
      txBlock.pure(bidder)
  )
  txBlock.incrementTotalTxsCount()
}

export function addBluemoveRemoveCollectionBidSuiTx({txBlock, nftContract, bid}) {
  txBlock.moveCall({
    target: "0xd5dd28cc24009752905689b2ba2bf90bfc8de4549b9123f93519bb8ba9bf9981::offer_collection::cancel_offer_collection",
    arguments: [
      txBlock.object(bluemoveOfferCollectionDataObject),
      txBlock.pure(bid?.nonce)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()
}