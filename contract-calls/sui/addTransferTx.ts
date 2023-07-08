import {gqlChainRequest} from "../utils/gqlChainRequest";
import {fetchWalletKiosks} from "../queries/fetchWalletKiosks";

export async function addTransferTx({txBlock, nft, nftContract, senderId, receiverId}) {
  const senderKiosk = nft?.chain_state?.kiosk_id

  if (!senderKiosk) {
    txBlock.transferObjects(
      [
        txBlock.object(nft?.token_id)
      ],
      txBlock.pure(receiverId)
    )
    txBlock.incrementTotalTxsCount()
    return
  }

  const senderKiosksRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: senderId}})
  const isSenderKioskOriginByte = senderKiosksRes?.kiosks?.filter(kiosk => kiosk?.id == senderKiosk)?.[0]?.is_origin_byte
  
  if (!isSenderKioskOriginByte) {
    return {error: `Operation not supported for this nft`}
  }

  const receieverKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: receiverId}})
  const receieverKiosk = receieverKioskRes?.kiosks?.filter(kiosk => kiosk?.is_origin_byte)?.[0]?.id

  if (receieverKiosk) {
    txBlock.moveCall({
      target: "0x083b02db943238dcea0ff0938a54a17d7575f5b48034506446e501e963391480::ob_kiosk::p2p_transfer",
      arguments: [
        txBlock.object(senderKiosk),
        txBlock.object(receieverKiosk),
        txBlock.pure(nft?.token_id),
      ],
      typeArguments: [
        nftContract?.properties?.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()
  } else {
    txBlock.moveCall({
      target: "0x083b02db943238dcea0ff0938a54a17d7575f5b48034506446e501e963391480::ob_kiosk::p2p_transfer_and_create_target_kiosk",
      arguments: [
        txBlock.object(senderKiosk),
        txBlock.pure(receiverId),
        txBlock.pure(nft?.token_id),
      ],
      typeArguments: [
        nftContract?.properties?.nft_type
      ]
    })
    txBlock.incrementTotalTxsCount()
  }

  console.log("txBlock", txBlock)

}