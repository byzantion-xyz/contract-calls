import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addBlueMoveUnlistTx, addKeepsakeUnlistTx, addOriginByteUnlistTx, addSouffl3UnlistTx, addTocenUnlistTx, addTradePortUnlistTx } from "./addUnlistTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const unlistSui = async ({
  nft, 
  nftContract,
  listingsToUnlist,
  suiSignAndExecuteTransactionBlock
}) => {
  
  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  switch(nft?.listings[0]?.market_name) {
    case "tradeport":
      if (sharedObjects?.orderbook) {
        addOriginByteUnlistTx({
          txBlock,
          nft,
          nftContract,
          sharedObjects
        })
      } else {
        addTradePortUnlistTx({
          txBlock,
          nft,
          nftContract
        })
      }
      break;
    case "hyperspace":
    case "clutchy":
      addOriginByteUnlistTx({
        txBlock,
        nft,
        nftContract,
        sharedObjects
      })
      break;
    case "souffl3":
      addSouffl3UnlistTx({
        txBlock,
        nftContract,
        listingsToUnlist
      })
      break;
    case "bluemove":
      if (sharedObjects?.orderbook) {
        addOriginByteUnlistTx({
          txBlock,
          nft,
          nftContract,
          sharedObjects
        })
      } else {
        addBlueMoveUnlistTx({
          txBlock,
          nft,
          nftContract
        })
      }
      break;
    case "keepsake":
      addKeepsakeUnlistTx({
        txBlock,
        nft,
        nftContract,
        listingsToUnlist
      })
      break;
    case "tocen":
      addTocenUnlistTx({
        txBlock,
        nft,
        nftContract
      })
      break;
    default:
      throw new Error("Marketplace not supported")
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}

