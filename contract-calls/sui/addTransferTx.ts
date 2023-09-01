import {gqlChainRequest} from "../utils/gqlChainRequest";
import {fetchWalletKiosks} from "../queries/fetchWalletKiosks";

export async function addTransferTx({txBlock, nft, nftContract, senderId, receiverId, sharedObjects}) {
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
    throw new Error("Operation not supported for this nft")
  } else {
    const receieverKioskRes = await gqlChainRequest({chain: "sui", query: fetchWalletKiosks, variables: {wallet: receiverId}})
    const receieverKiosk = receieverKioskRes?.kiosks?.filter(kiosk => kiosk?.is_origin_byte)?.[0]?.id
  
    if (receieverKiosk) {
      txBlock.moveCall({
        target: "0x787afe0cb02641274667b31235d3d0e1a2d1c43cf984d08007268b9928528493::ob_kiosk::p2p_transfer",
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
        target: "0x787afe0cb02641274667b31235d3d0e1a2d1c43cf984d08007268b9928528493::ob_kiosk::p2p_transfer_and_create_target_kiosk",
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
  }
}