import { collectionIdsToUseKioskListingContract } from "../constants";
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addBluemoveRemoveBidSuiTx, addOriginByteRemoveBidSuiTx, addTocenRemoveBidSuiTx, addTradeportKioskRemoveBidSuiTx, addTradeportRemoveBidSuiTx } from "./addRemoveBidTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const removeBidSui = async ({
  nft,
  nftContract,
  bid,
  suiSignAndExecuteTransactionBlock
}) => {

  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  switch(bid?.market_contract?.name) {
    case "tradeport":
      if (sharedObjects?.orderbook && sharedObjects?.collection) {
        addOriginByteRemoveBidSuiTx({txBlock, bid})
      } else {
        if (collectionIdsToUseKioskListingContract?.includes(nft?.collection?.id) && nft?.chain_state?.kiosk_id) {
          addTradeportKioskRemoveBidSuiTx({txBlock, nftContract, bid})
        } else {
          addTradeportRemoveBidSuiTx({txBlock, nftContract, bid})
        }
      }
      break;
    case "clutchy":
      addOriginByteRemoveBidSuiTx({txBlock, bid})
      break;
    case "bluemove":
      addBluemoveRemoveBidSuiTx({txBlock, nft, nftContract, bid})
      break;
    case "tocen":
      addTocenRemoveBidSuiTx({txBlock, nft, nftContract, bid})
      break;
    default:
      throw new Error("Marketplace not supported")
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock,
    nftTokenId: nft?.token_id,
  })
}