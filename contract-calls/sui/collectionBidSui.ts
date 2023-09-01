import { SuiTxBlock } from "./SuiTxBlock"
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addOriginByteCollectionBidTx, addTradePortCollectionBidTx, addTradePortKioskCollectionBidTx } from "./addCollectionBidTxs";
import { collectionIdsToNotUseForKioskContractCollectionBidding, collectionIdsToUseKioskListingContract } from "../constants";

export const collectionBidSui = async ({
  collectionContract,
  collectionId,
  bidAmount,
  numOfBids,
  connectedWalletId,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()

  const sharedObjects = await getSuiSharedObjects(collectionContract)

  for (let i = 0; i < numOfBids; i++) {
    if (sharedObjects?.orderbook && sharedObjects?.collection) {
      await addOriginByteCollectionBidTx({
        txBlock,
        collectionId,
        collectionContract,
        bidAmount,
        bidder: connectedWalletId,
        sharedObjects
      })
    } else {
      if (collectionIdsToUseKioskListingContract?.includes(collectionId) && !collectionIdsToNotUseForKioskContractCollectionBidding?.includes(collectionId)) {
        addTradePortKioskCollectionBidTx({
          txBlock,
          collectionId,
          collectionContract,
          bidAmount,
          sharedObjects
        })
      } else {
        addTradePortCollectionBidTx({
          txBlock,
          collectionId,
          collectionContract,
          bidAmount
        })
      }
    }
  }

  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock,
    collectionId: collectionId
  })
}