import { bluemoveMarketConfigObject, collectionIdsToUseKioskListingContract, tocenMarketplaceObject, tradeportBeneficiaryAddress, tradeportListingStore } from "../constants"
import { getSuiMarketFeePrice } from "../utils/getSuiMarketFeePrice"
import { parseCrypto } from "../utils/parseCrypto"
import { addOriginByteListTx, addTradePortKioskListTx } from "./addListTxs"
import { addBluemoveKioskUnlistTx, addHyperspaceUnlistTx, addOriginByteUnlistTx, addTradePortKioskUnlistTx } from "./addUnlistTxs"

export const addRelistTxs = async ({
  txBlock,
  connectedWalletId,
  nft,
  nftContract,
  price,
  sharedObjects
}) => {

  const listPrice = parseCrypto(price, "sui")
  const marketFeePrice = getSuiMarketFeePrice({price: listPrice, collectionId: nft?.collection?.id})

  switch(nft?.listings?.[0]?.market_name) {
    case "tradeport":
      if (sharedObjects?.orderbook && sharedObjects?.collection) {
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
        if (collectionIdsToUseKioskListingContract?.includes(nft?.collection?.id) && nft?.chain_state?.kiosk_id) {
          await addTradePortKioskUnlistTx({
            txBlock,
            nft,
            nftContract,
          })
          await addTradePortKioskListTx({
            txBlock,
            nft,
            nftContract,
            price
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
      if (collectionIdsToUseKioskListingContract?.includes(nft?.collection?.id) && nft?.chain_state?.kiosk_id) {
        await addTradePortKioskListTx({
          txBlock,
          nft,
          nftContract,
          price
        })
      } else {
        await addOriginByteListTx({
          txBlock,
          seller: connectedWalletId,
          nft,
          nftContract,
          price,
          sharedObjects
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
      await addOriginByteListTx({
        txBlock,
        seller: connectedWalletId,
        nft,
        nftContract,
        price,
        sharedObjects
      })
      break;
    case "somis":
      if (sharedObjects?.marketplace) {
        // somis own contract doesn't allow for relisting, so just showing unlist as option on UI
      } else {
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
      }
      break;
    case "souffl3":
      // souffl3's own contract doesn't allow for relisting, so just showing unlist as option on UI
      break;
    case "bluemove":
      if (nft?.collection?.id === "de36d429-35aa-412f-9762-ceea83ae320a") {
        await addBluemoveKioskUnlistTx({
          txBlock,
          connectedWalletId,
          nft,
          nftContract,
        })
        await addOriginByteListTx({
          txBlock,
          seller: connectedWalletId,
          nft,
          nftContract,
          price,
          sharedObjects
        })
      } else if (sharedObjects?.orderbook) {
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
              index: txBlock.getTotalTxsCount() - 1
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
            index: txBlock.getTotalTxsCount() - 1
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
}