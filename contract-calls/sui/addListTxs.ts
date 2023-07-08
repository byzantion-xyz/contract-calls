import { parseCrypto } from "../utils/parseCrypto"
import {
tradeportBeneficiaryAddress,
  tradeportDefaultFeeBps, tradeportDefaultFeeDenominator, tradeportListingStore
} from "../constants"
import {gqlChainRequest} from "../utils/gqlChainRequest";
import {fetchWalletKiosks} from "../queries/fetchWalletKiosks";

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
        target: "0x083b02db943238dcea0ff0938a54a17d7575f5b48034506446e501e963391480::ob_kiosk::create_for_sender",
        arguments: [],
        typeArguments: []
      })
      txBlock.incrementTotalTxsCount()
    }

    txBlock.moveCall({
      target: "0x083b02db943238dcea0ff0938a54a17d7575f5b48034506446e501e963391480::ob_kiosk::deposit",
      arguments: [
        !sellerKiosk ?
            {
              kind: "NestedResult",
              index: txBlock.getTotalTxsCount() - 1,
              resultIndex: 0
            }
            : txBlock.object(sellerKiosk),
        txBlock.object(nft?.token_id)
      ],
      typeArguments: [
        nftContract.properties.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()
  }

  txBlock.moveCall({
    target: "0xa0bab69d913e5a0ce8b448235a08bcf4c42da45c50622743dc9cab2dc0dff30f::orderbook::create_ask_with_commission",
    arguments: [
      txBlock.object(orderbook),
      !sellerKiosk ?
          {
            kind: "NestedResult",
            index: txBlock.getTotalTxsCount() - 2,
            resultIndex: 0
          }
          : txBlock.object(sellerKiosk),
      txBlock.pure(parseCrypto(price, "sui")),
      txBlock.pure(nft?.token_id),
      txBlock.pure(tradeportBeneficiaryAddress),
      txBlock.pure(Number(parseCrypto(price, "sui")) * tradeportDefaultFeeBps / tradeportDefaultFeeDenominator)
    ],
    typeArguments: [
      nftContract.properties.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()
}

export function addTradePortListTx({txBlock, nft, nftContract, price}) {
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