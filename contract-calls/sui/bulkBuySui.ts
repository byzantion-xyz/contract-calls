import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addBlueMoveBuyTx, addKeepsakeBuyTx, addOriginByteBuyTx, addSouffl3BuyTx, addTocenBuyTx, addTradePortBuyTx } from "./addBuyTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const bulkBuySui = async ({
  nfts,
  nftContractsById,
  connectedWalletId,
  walletBalance,
  suiSignAndExecuteTransactionBlock
}) => {

  const txBlock = new SuiTxBlock()

  const orderedNfts = nfts.sort((a, b) => {
    if (a?.listings?.[0]?.market_name === "souffl3") return 1
    if (b?.listings?.[0]?.market_name === "souffl3") return -1
    return 0
  })

  let tocenTokenIds = []
  let tocenNftType = ""
  let tocenTotalPrice = 0

  for (let nft of orderedNfts) {
    const lowestListing = nft?.listings[0]
    const nftContract = nftContractsById?.[nft?.id]
    const sharedObjects = await getSuiSharedObjects(nftContract)

    switch(lowestListing?.market_name) {
      case "tradeport":
        if (sharedObjects?.orderbook) {
          await addOriginByteBuyTx({
            txBlock,
            buyer: connectedWalletId,
            nft,
            nftContract,
            listing: lowestListing,
            sharedObjects
          })
        } else {
          await addTradePortBuyTx({
            txBlock,
            nftContract,
            listing: lowestListing,
            sharedObjects
          })
        }
        break;
      case "hyperspace":
      case "clutchy":
        await addOriginByteBuyTx({
          txBlock,
          buyer: connectedWalletId,
          nft,
          nftContract,
          listing: lowestListing,
          sharedObjects
        })
        break;
      case "souffl3":
        addSouffl3BuyTx({
          txBlock,
          remainingWalletBalance: walletBalance - txBlock.getTotalBuyerCoinsAmount(),
          nftContract,
          listing: lowestListing,
          sharedObjects
        })
        break;
      case "bluemove":
        if (sharedObjects?.orderbook) {
          await addOriginByteBuyTx({
            txBlock,
            buyer: connectedWalletId,
            nft,
            nftContract,
            listing: lowestListing,
            sharedObjects
          })
        } else {
          addBlueMoveBuyTx({
            txBlock,
            nft,
            nftContract,
            listing: lowestListing
          })
        }
        break;
      case "keepsake":
        await addKeepsakeBuyTx({
          txBlock,
          buyer: connectedWalletId,
          nft,
          nftContract,
          listing: lowestListing
        })
        break;
      case "tocen":
        tocenTokenIds.push(nft?.token_id)
        tocenNftType = nftContract?.properties?.nft_type
        tocenTotalPrice += lowestListing?.price
        break;
      default:
        throw new Error("Marketplace not supported")
    }
  }

  if (txBlock.getTotalSouffl3BuyTxsCount() > 0) {
    txBlock.transferObjects(
      [
        {
          kind: "Result",
          index: txBlock.getTotalTxsCount() - 1,
        }
      ],
      txBlock.pure(connectedWalletId)
    )
  }

  if (tocenTokenIds?.length > 0) {
    addTocenBuyTx({
      txBlock, 
      nftTokenIds: tocenTokenIds, 
      nftType: tocenNftType,
      totalPrice: tocenTotalPrice
    })
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}


