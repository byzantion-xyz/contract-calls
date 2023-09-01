import { collectionIdsToUseKioskListingContract } from "../constants";
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addOriginByteListTx, addTradePortKioskListTx, addTradePortListTx } from "./addListTxs";
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

  if (sharedObjects?.orderbook && sharedObjects?.collection) {
    await addOriginByteListTx({
      txBlock,
      seller: connectedWalletId,
      nft,
      nftContract,
      price,
      sharedObjects
    })
  } else {
    if (collectionIdsToUseKioskListingContract?.includes(nft?.collection?.id) && nft?.chain_state?.kiosk_id) {
      await addTradePortKioskListTx({
        txBlock,
        nft,
        nftContract,
        price
      })
    } else {
      addTradePortListTx({
        txBlock,
        nft,
        nftContract,
        price
      })
    }
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock,
    nftTokenId: nft?.token_id,
  })
}


