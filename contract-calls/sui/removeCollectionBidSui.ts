import { collectionIdsToNotUseForKioskContractCollectionBidding, collectionIdsToUseKioskListingContract } from "../constants"
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects"
import { addBluemoveRemoveCollectionBidSuiTx, addOriginByteRemoveCollectionBidSuiTx, addTradePortKioskRemoveCollectionBidSuiTx, addTradeportRemoveCollectionBidSuiTx } from "./addRemoveCollectionBidTxs"
import { SuiTxBlock } from "./SuiTxBlock"

export const removeCollectionBidSui = async ({
  bid,
  collectionContract,
  collectionId,
  connectedWalletId,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(collectionContract)

  switch(bid?.market_contract?.name) {
    case "tradeport":
      if (sharedObjects?.orderbook && sharedObjects?.collection) {
        addOriginByteRemoveCollectionBidSuiTx({
          txBlock,
          collectionContract,
          bid,
          bidder: connectedWalletId,
          sharedObjects
        })
      } else {
        if (collectionIdsToUseKioskListingContract?.includes(collectionId) && !collectionIdsToNotUseForKioskContractCollectionBidding?.includes(collectionId)) {
          addTradePortKioskRemoveCollectionBidSuiTx({
            txBlock,
            nftContract: collectionContract,
            bid
          })
        } else {
          addTradeportRemoveCollectionBidSuiTx({
            txBlock,
            nftContract: collectionContract,
            bid
          })
        }
      }
      break;
    case "bluemove":
      if (sharedObjects?.orderbook) {
        addOriginByteRemoveCollectionBidSuiTx({txBlock, collectionContract, bid, bidder: connectedWalletId, sharedObjects})
      } else {
        addBluemoveRemoveCollectionBidSuiTx({txBlock, nftContract: collectionContract, bid})
      }
      break;
    default:
      throw new Error("Marketplace not supported")
  }

  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock
  })
}