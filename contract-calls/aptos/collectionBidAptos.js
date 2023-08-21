import { parseCrypto } from "..utils/parseCrypto"

export const collectionBidAptos = async ({
  collectionTitle,
  collectionSlug,
  collectionContract,
  bidAmount,
  numOfBids,
  aptosSignAndSendTransaction
}) => {
  const createPayload = () => {
    if (collectionSlug.startsWith("0x")) {
      return {
        function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::biddings_v2::collection_bids",
        type_arguments: [],
        arguments: [
          collectionSlug,
          parseCrypto(bidAmount, "aptos").toString(),
          numOfBids
        ],
        type: "entry_function_payload"
      }
    } else {
      return {
        function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::biddings::collection_bid",
        type_arguments: [],
        arguments: [
          collectionContract?.key?.split('::')?.[0], // creator
          collectionTitle,
          parseCrypto(bidAmount, "aptos").toString(),
          numOfBids
        ],
        type: "entry_function_payload"
      }
    }
  }

  return await aptosSignAndSendTransaction(createPayload())
}


