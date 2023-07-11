import { parseCrypto } from "../utils/parseCrypto";
import { bluemoveMarketConfigObject, tocenMarketplaceObject, tradeportBeneficiaryAddress, tradeportDefaultFeeBps, tradeportDefaultFeeDenominator, tradeportListingStore } from "../constants";
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addOriginByteListTx } from "./addListTxs";
import { addOriginByteUnlistTx } from "./addUnlistTxs";
import { SuiTxBlock } from "./SuiTxBlock";
import { getSuiMarketFeePrice } from "../utils/getSuiMarketFeePrice";

export const relistSui = async ({
  connectedWalletId,
  nft,
  nftContract,
  price,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

  const listPrice = parseCrypto(price, "sui")
  const marketFeePrice = getSuiMarketFeePrice({price: listPrice, nftType: nftContract?.properties?.nft_type})

  switch(nft?.listings?.[0]?.market_name) {
    case "tradeport":
      if (sharedObjects?.orderbook) {
        addOriginByteUnlistTx({
          txBlock,
          nft,
          nftContract,
          sharedObjects
        })
        await addOriginByteListTx({
          txBlock,
          seller: connectedWalletId,
          nft,
          nftContract,
          price,
          sharedObjects
        })
      } else {
        txBlock.moveCall({
          target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::listings::relist",
          arguments: [
            txBlock.object(tradeportListingStore),
            txBlock.pure(nft?.listings?.[0]?.nonce),
            txBlock.pure(listPrice),
            txBlock.pure(marketFeePrice),
            txBlock.pure(tradeportBeneficiaryAddress)
          ],
          typeArguments: [
            nftContract?.properties?.nft_type
          ]
        })
        txBlock.incrementTotalTxsCount()
      }
      break;
    case "hyperspace":
    case "clutchy":
    case "somis":
      addOriginByteUnlistTx({
        txBlock,
        nft,
        nftContract,
        sharedObjects
      })
      await addOriginByteListTx({
        txBlock,
        seller: connectedWalletId,
        nft,
        nftContract,
        price,
        sharedObjects
      })
      break;
    case "souffl3":
      // can't do, so just showing unlist as option on UI
      break;
    case "bluemove":
      if (sharedObjects?.orderbook) {
        addOriginByteUnlistTx({
          txBlock,
          nft,
          nftContract,
          sharedObjects
        })
        await addOriginByteListTx({
          txBlock,
          seller: connectedWalletId,
          nft,
          nftContract,
          price,
          sharedObjects
        })
      } else {
        txBlock.moveCall({
          target: "0xd5dd28cc24009752905689b2ba2bf90bfc8de4549b9123f93519bb8ba9bf9981::marketplace::delist",
          arguments: [
            txBlock.object(bluemoveMarketConfigObject),
            txBlock.pure(nft?.token_id),
          ],
          typeArguments: [
            nftContract?.properties?.nft_type,
            nftContract?.properties?.nft_type,
          ]
        })
        txBlock.incrementTotalTxsCount()

        txBlock.moveCall({
          target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::listings::list",
          arguments: [
            txBlock.object(tradeportListingStore),
            {
              kind: "Result",
              index: 0
            },
            txBlock.pure(listPrice),
            txBlock.pure(marketFeePrice),
            txBlock.pure(tradeportBeneficiaryAddress)
          ],
          typeArguments: [
            nftContract?.properties?.nft_type
          ]
        })
        txBlock.incrementTotalTxsCount()
      }
      break;
    case "tocen":
      txBlock.moveCall({
        target: "0x3605d91c559e80cf8fdeabae9abaccb0bc38f96eac0b32bf47e95a9159a5277f::tocen_marketplace::delist",
        arguments: [
          txBlock.pure(tocenMarketplaceObject),
          txBlock.pure(nft?.token_id)
        ],
        typeArguments: [
          nftContract?.properties?.nft_type
        ]
      })
      txBlock.incrementTotalTxsCount()

      txBlock.moveCall({
        target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::listings::list",
        arguments: [
          txBlock.object(tradeportListingStore),
          {
            kind: "Result",
            index: 0
          },
          txBlock.pure(listPrice),
          txBlock.pure(marketFeePrice),
          txBlock.pure(tradeportBeneficiaryAddress)
        ],
        typeArguments: [
          nftContract?.properties?.nft_type
        ]
      })
      txBlock.incrementTotalTxsCount()
      break;
    default:
      throw new Error("Marketplace not supported")
  }

  if (txBlock.getTotalGasBudget() > 0) txBlock.setGasBudget(txBlock.getTotalGasBudget())
  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}
