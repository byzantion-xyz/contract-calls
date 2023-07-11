import { parseCrypto } from "../utils/parseCrypto"
import { tradeportBeneficiaryAddress, tradeportListingStore } from "../constants"
import {gqlChainRequest} from "../utils/gqlChainRequest";
import {fetchWalletKiosks} from "../queries/fetchWalletKiosks";
import { getSuiMarketFeePrice } from "../utils/getSuiMarketFeePrice";

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
        target: "0x083b02db943238dcea0ff0938a54a17d7575f5b48034506446e501e963391480::ob_kiosk::new",
        arguments: [],
        typeArguments: []
      })
      txBlock.incrementTotalTxsCount()

      txBlock.moveCall({
        target: "0x2::transfer::public_share_object",
        arguments: [
          {
            kind: "NestedResult",
            index:  txBlock.getTotalTxsCount() - 1,
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

  const listPrice = parseCrypto(price, "sui")
  const marketFeePrice = getSuiMarketFeePrice({price: listPrice, nftType: nftContract?.properties?.nft_type})

  txBlock.moveCall({
    target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::orderbook::create_ask_with_commission",
    arguments: [
      txBlock.object(orderbook),
      !sellerKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 1,
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
}

export function addTradePortListTx({txBlock, nft, nftContract, price}) {
  const listPrice = parseCrypto(price, "sui")
  const marketFeePrice = getSuiMarketFeePrice({price: listPrice, nftType: nftContract?.properties?.nft_type})

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