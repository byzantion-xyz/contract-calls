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
    return {error: `Cannot transfer to self`}
  }

  const txBlock = new SuiTxBlock()

  const transferTx = await addTransferTx({txBlock, nft, nftContract, senderId: connectedWalletId, receiverId})
  if (transferTx?.error) return transferTx

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}