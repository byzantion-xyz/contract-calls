import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addBluemoveAcceptCollectionBidTx, addOriginByteAcceptCollectionBidTx, addTocenAcceptCollectionBidTx } from "./addAcceptCollectionBidTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const acceptCollectionBidSui = async ({
  nft,
  nftContract, 
  bid,
  connectedWalletId,
  suiSignAndExecuteTransactionBlock
}) => {

  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  switch(bid?.market_contract?.name) {
    case "tradeport":
      if (sharedObjects?.orderbook) {
        await addOriginByteAcceptCollectionBidTx({
          txBlock, 
          sender: connectedWalletId, 
          nft, 
          nftContract, 
          bid,
          sharedObjects
        })
      } else {
        
      }
      break;
    case "clutchy":
      await addOriginByteAcceptCollectionBidTx({
        txBlock, 
        sender: connectedWalletId, 
        nft, 
        nftContract, 
        bid,
        sharedObjects
      })
      break;
    case "hyperspace":
      break;
    case "bluemove":
      if (sharedObjects?.orderbook) {
        await addOriginByteAcceptCollectionBidTx({
          txBlock, 
          sender: connectedWalletId, 
          nft, 
          nftContract,
          bid,
          sharedObjects
        })
      } else {
        addBluemoveAcceptCollectionBidTx({txBlock, nft, nftContract, bid})
      }
      break;
    case "tocen":
      addTocenAcceptCollectionBidTx({txBlock, nft, nftContract, bid})
      break;
    default:
      throw new Error("Marketplace not supported")
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}