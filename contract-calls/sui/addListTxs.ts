import { parseCrypto } from "../utils/parseCrypto"
import { tradeportBeneficiaryAddress, tradeportKioskListingStore, tradeportListingStore } from "../constants"
import {gqlChainRequest} from "../utils/gqlChainRequest";
import {fetchWalletKiosks} from "../queries/fetchWalletKiosks";
import { getSuiMarketFeePrice } from "../utils/getSuiMarketFeePrice";
import { getSuiOwnerCapByKiosk } from "../utils/getSuiOwnerCapByKiosk";

export async function addOriginByteListTx({
  txBlock,
  seller,
  nft,
  nftContract,
  price,
  sharedObjects
}) {
  const { orderbook } = sharedObjects

  let sellerKiosk = nft?.chain_state?.kiosk_id

  if (!sellerKiosk) {
    const sellerKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: seller}})
    sellerKiosk = sellerKioskRes?.kiosks?.filter(kiosk => kiosk?.is_origin_byte)?.[0]?.id

    if (!sellerKiosk) {
      txBlock.moveCall({
        target: "0x787afe0cb02641274667b31235d3d0e1a2d1c43cf984d08007268b9928528493::ob_kiosk::new",
        arguments: [],
        typeArguments: []
      })
      txBlock.incrementTotalTxsCount()

      txBlock.moveCall({
        target: "0x787afe0cb02641274667b31235d3d0e1a2d1c43cf984d08007268b9928528493::ob_kiosk::deposit",
        arguments: [
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 1,
            resultIndex: 0
          },
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 1,
            resultIndex: 1
          }
        ],
        typeArguments: [
          nftContract.properties.nft_type
        ]
      })
      txBlock.incrementTotalTxsCount()
    }
  }

  const listPrice = parseCrypto(price, "sui")
  const marketFeePrice = getSuiMarketFeePrice({price: listPrice, collectionId: nft?.collection?.id})

  txBlock.moveCall({
    target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::orderbook::create_ask_with_commission",
    arguments: [
      txBlock.object(orderbook),
      !sellerKiosk ?
        {
          kind: "NestedResult",
          index: txBlock.getTotalTxsCount() - 2,
          resultIndex: 0
        }
        : txBlock.object(sellerKiosk),
      txBlock.pure(listPrice),
      txBlock.pure(nft?.token_id),
      txBlock.pure(tradeportBeneficiaryAddress),
      txBlock.pure(marketFeePrice)
    ],
    typeArguments: [
      nftContract.properties.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

  if (!sellerKiosk) {
    txBlock.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [
        {
          kind: "NestedResult",
          index:  txBlock.getTotalTxsCount() - 3,
          resultIndex: 0
        }
      ],
      typeArguments: [
        "0x2::kiosk::Kiosk"
      ]
    })
    txBlock.incrementTotalTxsCount()
  }
}

export function addTradePortListTx({txBlock, nft, nftContract, price}) {
  const listPrice = parseCrypto(price, "sui")
  const marketFeePrice = getSuiMarketFeePrice({price: listPrice, collectionId: nft?.collection?.id})

  txBlock.moveCall({
    target: "0xb42dbb7413b79394e1a0175af6ae22b69a5c7cc5df259cd78072b6818217c027::listings::list",
    arguments: [
      txBlock.object(tradeportListingStore),
      txBlock.object(nft?.token_id),
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

export async function addTradePortKioskListTx({txBlock, nft, nftContract, price}) {
  const listPrice = parseCrypto(price, "sui")
  const marketFeePrice = getSuiMarketFeePrice({price: listPrice, collectionId: nft?.collection?.id})
  const sellerKiosk = nft?.chain_state?.kiosk_id
  const sellerKioskOwnerCap = await getSuiOwnerCapByKiosk(sellerKiosk)

  txBlock.moveCall({
    target: "0x33a9e4a3089d911c2a2bf16157a1d6a4a8cbd9a2106a98ecbaefe6ed370d7a25::kiosk_listings::list",
    arguments: [
      txBlock.object(tradeportKioskListingStore),
      txBlock.object(sellerKiosk),
      txBlock.object(sellerKioskOwnerCap),
      txBlock.object(nft?.token_id),
      txBlock.pure(Number(listPrice) + marketFeePrice),
      txBlock.pure(marketFeePrice),
      txBlock.pure(tradeportBeneficiaryAddress)
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()
}