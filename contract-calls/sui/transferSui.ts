import { getSuiSharedObjects } from "../utils/getSuiSharedObjects"
import { addTransferTx } from "./addTransferTx"
import { SuiTxBlock } from "./SuiTxBlock"

export const transferSui = async ({
  nft, 
  nftContract, 
  connectedWalletId,
  receiverId,
  suiSignAndExecuteTransactionBlock
}) => {

  if (receiverId === connectedWalletId) {
    throw new Error(`Cannot transfer to self`)
  }

  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  await addTransferTx({txBlock, nft, nftContract, senderId: connectedWalletId, receiverId, sharedObjects})

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock
  })
}