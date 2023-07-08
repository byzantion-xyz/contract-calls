import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addOriginByteListTx, addTradePortListTx } from "./addListTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const listSui = async ({
  connectedWalletId,
  nft,
  nftContract,
  price,
  suiSignAndExecuteTransactionBlock
}) => {

  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  if (sharedObjects?.orderbook) {
    await addOriginByteListTx({
      txBlock,
      seller: connectedWalletId,
      nft,
      nftContract,
      price,
      sharedObjects
    })
  } else {
    addTradePortListTx({
      txBlock,
      nft,
      nftContract,
      price
    })
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}



