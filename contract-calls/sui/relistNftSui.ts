import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { SuiTxBlock } from "./SuiTxBlock";
import { addRelistTxs } from "./addRelistTxs";

export const relistSui = async ({
  connectedWalletId,
  nft,
  nftContract,
  price,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  await addRelistTxs({
    txBlock,
    connectedWalletId,
    nft,
    nftContract,
    price,
    sharedObjects
  })

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock,
    nftTokenId: nft?.token_id,
  })
}