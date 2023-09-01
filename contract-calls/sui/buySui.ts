import { collectionIdsToUseKioskListingContract } from "../constants";
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addBlueMoveBuyTx, addBluemoveKioskBuyTx, addHyperspaceBuyTx, addKeepsakeBuyTx, addOriginByteBuyTx, addSomisBuyTx, addSouffl3BuyTx, addTocenBuyTx, addTradePortBuyTx, addTradePortKioskBuyTx } from "./addBuyTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const buySui = async ({
  nft,
  nftContract,
  connectedWalletId,
  walletBalance,
  listing,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  switch(listing?.market_name) {
    case "tradeport":
      if (sharedObjects?.orderbook && sharedObjects?.collection) {
        await addOriginByteBuyTx({
          txBlock,
          buyer: connectedWalletId,
          nft,
          nftContract,
          listing,
          sharedObjects
        })
      } else {
        if (collectionIdsToUseKioskListingContract?.includes(nft?.collection?.id) && nft?.chain_state?.kiosk_id) {
          await addTradePortKioskBuyTx({
            txBlock,
            buyer: connectedWalletId,
            nft,
            nftContract,
            listing,
            sharedObjects
          })
        } else {
          await addTradePortBuyTx({
            txBlock,
            nftContract,
            listing,
            sharedObjects
          })
        }
      }
      break;
    case "clutchy":
      await addOriginByteBuyTx({
        txBlock,
        buyer: connectedWalletId,
        nft,
        nftContract,
        listing,
        sharedObjects
      })
      break;
    case "hyperspace":
      if (sharedObjects?.orderbook && sharedObjects?.collection) {
        await addOriginByteBuyTx({
          txBlock,
          buyer: connectedWalletId,
          nft,
          nftContract,
          listing,
          sharedObjects
        })
      } else {
        await addHyperspaceBuyTx({
          txBlock,
          buyer: connectedWalletId,
          nft,
          nftContract,
          listing,
          sharedObjects
        })
      } 
      break;
    case "somis":
      if (sharedObjects?.marketplace) {
        addSomisBuyTx({
          txBlock,
          nft,
          nftContract,
          listing,
          marketplace: sharedObjects?.marketplace
        })
      } else {
        await addOriginByteBuyTx({
          txBlock,
          buyer: connectedWalletId,
          nft,
          nftContract,
          listing,
          sharedObjects
        })
      }
      break;
    case "souffl3":
      addSouffl3BuyTx({
        txBlock,
        remainingWalletBalance: walletBalance,
        collectionId: nft?.collection?.id,
        nftContract,
        listing,
        sharedObjects
      })
      txBlock.transferObjects(
        [{kind: "Result", index: txBlock.getTotalTxsCount() - 1}],
        txBlock.pure(connectedWalletId)
      )
      break;
    case "bluemove":
      if (collectionIdsToUseKioskListingContract?.includes(nft?.collection?.id) && nft?.chain_state?.kiosk_id) {
        await addBluemoveKioskBuyTx({
          txBlock,
          buyer: connectedWalletId,
          nft,
          nftContract,
          listing,
          sharedObjects
        })
      } else if (sharedObjects?.orderbook) {
        await addOriginByteBuyTx({
          txBlock,
          buyer: connectedWalletId,
          nft,
          nftContract,
          listing,
          sharedObjects
        })
      } else {
        addBlueMoveBuyTx({
          txBlock,
          nft,
          nftContract, 
          listing
        })
      }
      break;
    case "keepsake":
      await addKeepsakeBuyTx({
        txBlock,
        buyer: connectedWalletId,
        nft,
        nftContract, 
        listing
      })
      break;
    case "tocen":
      addTocenBuyTx({
        txBlock, 
        nftTokenIds: [nft.token_id], 
        nftType: nftContract?.properties?.nft_type,
        totalPrice: listing?.price
      })
      break;
    default:
      throw new Error("Marketplace not supported")
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock,
    nftTokenId: nft?.token_id
  })
}