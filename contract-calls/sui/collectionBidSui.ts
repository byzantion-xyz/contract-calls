import { SuiTxBlock } from "./SuiTxBlock"
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addOriginByteCollectionBidTx, addTradePortCollectionBidTx } from "./addCollectionBidTxs";

export const collectionBidSui = async ({
  collectionContract,
  bidAmount,
  connectedWalletId,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()

  const sharedObjects = await getSuiSharedObjects(collectionContract)

  if (sharedObjects?.orderbook) {
    await addOriginByteCollectionBidTx({txBlock, collectionContract, bidAmount, bidder: connectedWalletId})
  } else {
    addTradePortCollectionBidTx({txBlock, collectionContract, bidAmount})
  }

  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}