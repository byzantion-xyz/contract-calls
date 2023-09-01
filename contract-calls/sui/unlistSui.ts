import { collectionIdsToUseKioskListingContract } from "../constants";
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addBluemoveKioskUnlistTx, addBlueMoveUnlistTx, addHyperspaceUnlistTx, addKeepsakeUnlistTx, addOriginByteUnlistTx, addSomisUnlistTx, addSouffl3UnlistTx, addTocenUnlistTx, addTradePortKioskUnlistTx, addTradePortUnlistTx } from "./addUnlistTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const unlistSui = async ({
  nft, 
  nftContract,
  connectedWalletId,
  listingsToUnlist,
  suiSignAndExecuteTransactionBlock
}) => {
  
  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  switch(nft?.listings[0]?.market_name) {
    case "tradeport":
      if (sharedObjects?.orderbook && sharedObjects?.collection) {
        addOriginByteUnlistTx({
          txBlock,
          nft,
          nftContract,
          sharedObjects
        })
      } else {
        if (collectionIdsToUseKioskListingContract?.includes(nft?.collection?.id) && nft?.chain_state?.kiosk_id) {
          await addTradePortKioskUnlistTx({
            txBlock,
            nft,
            nftContract
          })
        } else {
          addTradePortUnlistTx({
            txBlock,
            nft,
            nftContract
          })
        }
      }
      break;
    case "hyperspace":
      if (sharedObjects?.orderbook && sharedObjects?.collection) {
        addOriginByteUnlistTx({
          txBlock,
          nft,
          nftContract,
          sharedObjects
        })
      } else {
        await addHyperspaceUnlistTx({
          txBlock,
          buyer: connectedWalletId,
          nft,
          nftContract
        })
      }
      break;
    case "clutchy":
      addOriginByteUnlistTx({
        txBlock,
        nft,
        nftContract,
        sharedObjects
      })
      break;
    case "somis":
      if (sharedObjects?.marketplace) {
        addSomisUnlistTx({
          txBlock,
          nft,
          nftContract,
          marketplace: sharedObjects?.marketplace
        })
      } else {
        addOriginByteUnlistTx({
          txBlock,
          nft,
          nftContract,
          sharedObjects
        })
      }
      break;
    case "souffl3":
      addSouffl3UnlistTx({
        txBlock,
        nftContract,
        listingsToUnlist
      })
      break;
    case "bluemove":
      if (collectionIdsToUseKioskListingContract?.includes(nft?.collection?.id) && nft?.chain_state?.kiosk_id) {
        await addBluemoveKioskUnlistTx({
          txBlock,
          connectedWalletId,
          nft,
          nftContract,
        })
      } else if (sharedObjects?.orderbook) {
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
  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock
  })
}