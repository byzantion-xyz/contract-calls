import { parseCrypto } from "..utils/parseCrypto"

export const listAptos = async ({
  nft, 
  nftContract,
  price,
  aptosSignAndSendTransaction
}) => {
  
  let payload = {}
  if (nft?.collection?.slug.startsWith("0x")) {
    payload = {
      function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::listings_v2::list_token",
      type_arguments: [],
      arguments: [
        nft?.token_id,
        parseCrypto(price, "aptos").toString(),
      ],
      type: "entry_function_payload"
    }
  } else {
    payload = {
      function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::listings::list_token",
      type_arguments: [],
      arguments: [
        nftContract?.key?.split('::')?.[0],
        nft?.collection?.title,
        decodeURIComponent(nft?.token_id),
        nft?.version,
        parseCrypto(price, "aptos").toString()
      ],
      type: "entry_function_payload"
    }
  }

  return await aptosSignAndSendTransaction(payload)
}


