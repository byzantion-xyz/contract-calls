import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addOriginByteListTx, addTradePortListTx } from "./addListTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const bulkListSui = async ({
  connectedWalletId,
  listingsToUpdate,
  suiSignAndExecuteTransactionBlock
}) => {

  const txBlock = new SuiTxBlock()

  for (let listing of listingsToUpdate) {

    const {market, listAmount, nft, nftContract} = listing
    const sharedObjects = await getSuiSharedObjects(nftContract)

    if (sharedObjects?.orderbook) {
      addOriginByteListTx({
        txBlock,
        seller: connectedWalletId,
        nft,
        nftContract,
        price: listAmount,
        sharedObjects
      })
    } else {
      addTradePortListTx({
        txBlock,
        nft,
        nftContract,
        price: listAmount,
      })
    }
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}
