import { tradeportBiddingStore } from "../constants";

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
    target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::orderbook::cancel_bid",
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