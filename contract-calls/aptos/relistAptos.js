import { parseCrypto } from "..utils/parseCrypto"
import { getAptosContractCallMarketParamName } from "../utils/getAptosContractCallMarketParamName"

export const relistAptos = async ({
  nft,
  nftContract,
  price,
  aptosSignAndSendTransaction
}) => {

  const createPayload = () => {
    if (nft?.collection?.slug.startsWith("0x")) {
      return {
        function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::listings_v2::relist_token",
        type_arguments: [],
        arguments: [
          nft?.listings?.[0]?.nonce,
          parseCrypto(price, "aptos").toString()
        ],
        type: "entry_function_payload"
      }
    }

    let payloadArguments = [[], [], [], [], [], [], [], [], [], []]
    payloadArguments?.[0]?.push(nft?.collection?.slug.startsWith("0x") ? 2 : 1)
    payloadArguments?.[1]?.push(getAptosContractCallMarketParamName(nft?.listings?.[0]?.market_name))
    payloadArguments?.[2]?.push(nftContract?.key?.split('::')?.[0]) // creator
    payloadArguments?.[3]?.push(nft?.collection?.title)
    payloadArguments?.[4]?.push(decodeURIComponent(nft?.token_id))
    payloadArguments?.[5]?.push(nft?.version)
    payloadArguments?.[6]?.push(parseCrypto(price, "aptos").toString())
    payloadArguments?.[7]?.push(nft?.collection?.slug.startsWith("0x") ? "" : (nft?.listings?.[0]?.nonce ? nft?.listings?.[0]?.nonce : ""))
    payloadArguments?.[8]?.push(nft?.collection?.slug.startsWith("0x") ? (nft?.listings?.[0]?.nonce ? nft?.listings?.[0]?.nonce : "0x0") : "0x0")
    payloadArguments?.[9]?.push(nft?.collection?.slug.startsWith("0x") ? nft?.token_id : "0x0")

    return {
      function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::markets_v2::list_tokens_v2",
      type_arguments: [],
      arguments: payloadArguments,
      type: "entry_function_payload"
    }
  }

  return await aptosSignAndSendTransaction(createPayload())
}


