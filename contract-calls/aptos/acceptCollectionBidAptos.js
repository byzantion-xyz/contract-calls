import { parseCrypto } from "../utils/parseCrypto"

export const bidAptos = async ({
  nft,
  nftContract,
  bidAmount,
  aptosSignAndSendTransaction
}) => {
  const createPayload = () => {
    if (nft?.collection?.slug.startsWith("0x")) {
      return {
        function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::biddings_v2::token_bid",
        type_arguments: [],
        arguments: [
          nft?.token_id,
          parseCrypto(bidAmount, "aptos").toString()
        ],
        type: "entry_function_payload"
      }
    } else {
      return {
        function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::biddings::token_bid",
        type_arguments: [],
        arguments: [
          nftContract?.key?.split('::')?.[0], // creator
          nft?.collection?.title,
          decodeURIComponent(nft?.token_id),
          nft?.version,
          parseCrypto(bidAmount, "aptos").toString()
        ],
        type: "entry_function_payload"
      }
    }
  }

  return await aptosSignAndSendTransaction(createPayload())
}