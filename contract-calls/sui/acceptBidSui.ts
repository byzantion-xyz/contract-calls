import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addBluemoveAcceptBidTx, addOriginByteAcceptBidTx, addTradeportAcceptBidTx } from "./addAcceptBidTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const acceptBidSui = async ({
  nft,
  nftContract,
  bid,
  suiSignAndExecuteTransactionBlock
}) => {

  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  switch(bid?.market_contract?.name) {
    case "tradeport":
      if (sharedObjects?.orderbook) {
        await addOriginByteAcceptBidTx({txBlock, nft, nftContract, bid, sharedObjects})
      } else {
        addTradeportAcceptBidTx({txBlock, nft, nftContract, bid, sharedObjects})
      }
      break;
    case "clutchy":
    case "hyperspace":
      await addOriginByteAcceptBidTx({txBlock, nft, nftContract, bid, sharedObjects})
      break;
    case "bluemove":
      addBluemoveAcceptBidTx({txBlock, nft, nftContract, bid})
      break;
    default:
      throw new Error("Marketplace not supported")
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}

