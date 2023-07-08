import { getSuiSharedObjects } from "../utils/getSuiSharedObjects"
import { addOriginByteRemoveCollectionBidSuiTx, addTradeportRemoveCollectionBidSuiTx } from "./addRemoveCollectionBidTxs"
import { SuiTxBlock } from "./SuiTxBlock"

export const removeCollectionBidSui = async ({
  bid,
  collectionContract,
  connectedWalletId,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(collectionContract)

  if (sharedObjects?.orderbook) {
    addOriginByteRemoveCollectionBidSuiTx({txBlock, collectionContract, bid, bidder: connectedWalletId, sharedObjects})
  } else {
    addTradeportRemoveCollectionBidSuiTx({txBlock, nftContract: collectionContract, bid})
  }

  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}