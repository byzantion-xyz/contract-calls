import { collectionIdsToUseKioskListingContract } from "../constants"
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects"
import { addOriginByteBidTx, addTradePortBidTx, addTradePortKioskBidTx } from "./addBidTxs"
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

  if (sharedObjects?.orderbook && sharedObjects?.collection) {
    await addOriginByteBidTx({
      txBlock,
      nft,
      nftContract,
      bidAmount,
      bidder: connectedWalletId
    })
  } else {
    if (collectionIdsToUseKioskListingContract?.includes(nft?.collection?.id) && nft?.chain_state?.kiosk_id) {
      addTradePortKioskBidTx({
        txBlock,
        nft,
        nftContract,
        bidAmount,
        sharedObjects
      })
    } else {
      addTradePortBidTx({
        txBlock,
        nft,
        nftContract,
        bidAmount
      })
    }
  }

  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock,
    nftTokenId: nft?.token_id
  })
}