import { getSuiSharedObjects } from "../utils/getSuiSharedObjects"
import { addOriginByteBidTx, addTradePortBidTx } from "./addBidTxs"
import { SuiTxBlock } from "./SuiTxBlock"

export const bidSui = async ({
  nft,
  nftContract,
  bidAmount,
  connectedWalletId,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  if (sharedObjects?.orderbook) {
    await addOriginByteBidTx({txBlock, nft, bidAmount, bidder: connectedWalletId})
  } else {
    addTradePortBidTx({txBlock, nft, nftContract, bidAmount})
  }

  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}