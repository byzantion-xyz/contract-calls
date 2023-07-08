import { parseCrypto } from "../utils/parseCrypto";
import { bluemoveMarketConfigObject, tocenMarketplaceObject, tradeportBeneficiaryAddress, tradeportDefaultFeeBps, tradeportDefaultFeeDenominator, tradeportListingStore } from "../constants";
import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { addOriginByteListTx } from "./addListTxs";
import { addOriginByteUnlistTx } from "./addUnlistTxs";
import { SuiTxBlock } from "./SuiTxBlock";

export const relistSui = async ({
  connectedWalletId,
  nft,
  nftContract,
  price,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()
  const sharedObjects = await getSuiSharedObjects(nftContract)

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
          target: "0x7925fb044dbed3eda525ce059120f5ce3dbd6887ae6937ee9301383423406b57::listings::relist",
          arguments: [
            txBlock.object(tradeportListingStore),
            txBlock.pure(nft?.listings?.[0]?.nonce),
            txBlock.pure(parseCrypto(price, "sui"))
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
        txBlock.moveCall({
          target: "0x7925fb044dbed3eda525ce059120f5ce3dbd6887ae6937ee9301383423406b57::listings::list",
          arguments: [
            txBlock.object(tradeportListingStore),
            {
              kind: "Result",
              index: 0
            },
            txBlock.pure(parseCrypto(price, "sui")),
            txBlock.pure(Number(parseCrypto(price, "sui")) * tradeportDefaultFeeBps / tradeportDefaultFeeDenominator),
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
          txBlock.pure(tocenMarketplaceObject), // marketplace object
          txBlock.pure(nft?.token_id), // nft token id
        ],
        typeArguments: [
          nftContract?.properties?.nft_type, // nft type
        ]
      })
      txBlock.moveCall({
        target: "0x7925fb044dbed3eda525ce059120f5ce3dbd6887ae6937ee9301383423406b57::listings::list",
        arguments: [
          txBlock.object(tradeportListingStore),
          {
            kind: "Result",
            index: 0
          },
          txBlock.pure(parseCrypto(price, "sui")),
          txBlock.pure(Number(parseCrypto(price, "sui")) * tradeportDefaultFeeBps / tradeportDefaultFeeDenominator),
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
