import { addTransferTx } from "./addTransferTx"
import { SuiTxBlock } from "./SuiTxBlock"

export const bulkTransferSui = async ({
  nfts,
  nftContractsById,
  connectedWalletId,
  receiverId,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()

  for (let nft of nfts) {
    await addTransferTx({txBlock, nft, nftContract: nftContractsById?.[nft?.id], senderId: connectedWalletId, receiverId})
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}