import { parseCrypto } from "..utils/parseCrypto"
import { getAptosContractCallMarketParamName } from "../utils/getAptosContractCallMarketParamName"

export const relistAptos = async ({
  nft,
  nftContract,
  price,
  aptosSignAndSendTransaction
}) => {
  let payloadArguments = [[], [], [], [], [], [], []]
  payloadArguments?.[0]?.push(getAptosContractCallMarketParamName(nft?.listings?.[0]?.market_name))
  payloadArguments?.[1]?.push(nftContract?.key?.split('::')?.[0]) // creator
  payloadArguments?.[2]?.push(nft?.collection?.title)
  payloadArguments?.[3]?.push(decodeURIComponent(nft?.token_id))
  payloadArguments?.[4]?.push(nft?.version)
  payloadArguments?.[5]?.push(parseCrypto(price, "aptos").toString())
  payloadArguments?.[6]?.push(nft?.listings?.[0]?.nonce ? nft?.listings?.[0]?.nonce : "")

  const payload = {
    function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::markets::list_tokens_v2",
    type_arguments: [],
    arguments: payloadArguments,
    type: "entry_function_payload"
  }

  return await aptosSignAndSendTransaction(payload)
}


