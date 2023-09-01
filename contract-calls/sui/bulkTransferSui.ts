import { getSuiSharedObjects } from "../utils/getSuiSharedObjects"
import { addTransferTx } from "./addTransferTx"
import { SuiTxBlock } from "./SuiTxBlock"

export const bulkTransferSui = async ({
  nfts,
  nftContractsById,
  connectedWalletId,
  receiverId,
  suiSignAndExecuteTransactionBlock
}) => {

  if (receiverId === connectedWalletId) {
    throw new Error(`Cannot transfer to self`)
  }

  const txBlock = new SuiTxBlock()

  for (let nft of nfts) {
    const sharedObjects = await getSuiSharedObjects(nftContractsById?.[nft?.id])
    await addTransferTx({txBlock, nft, nftContract: nftContractsById?.[nft?.id], senderId: connectedWalletId, receiverId, sharedObjects})
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock,
  })
}