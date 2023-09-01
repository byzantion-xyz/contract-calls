import { collectionIdsToUseKioskListingContract } from "../constants";
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addOriginByteListTx, addTradePortKioskListTx, addTradePortListTx } from "./addListTxs";
import { addRelistTxs } from "./addRelistTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const bulkListSui = async ({
  connectedWalletId,
  listingsToUpdate,
  suiSignAndExecuteTransactionBlock
}) => {

  const txBlock = new SuiTxBlock()

  for (let listing of listingsToUpdate) {

    const {listAmount, nft, nftContract} = listing
    const sharedObjects = await getSuiSharedObjects(nftContract)

    if (nft?.listings?.[0]?.price) { // if listed
      await addRelistTxs({
        txBlock,
        connectedWalletId,
        nft,
        nftContract,
        price: listAmount,
        sharedObjects
      })
    } else { // if not listed
      if (sharedObjects?.orderbook) {
        await addOriginByteListTx({
          txBlock,
          seller: connectedWalletId,
          nft,
          nftContract,
          price: listAmount,
          sharedObjects
        })
      } else {
        if (collectionIdsToUseKioskListingContract?.includes(nft?.collection?.id) && nft?.chain_state?.kiosk_id) {
          await addTradePortKioskListTx({
            txBlock,
            nft,
            nftContract,
            price: listAmount
          })
        } else {
          addTradePortListTx({
            txBlock,
            nft,
            nftContract,
            price: listAmount
          })
        }
      }
    }
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock,
  })
}
