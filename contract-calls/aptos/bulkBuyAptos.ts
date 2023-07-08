import { getAptosContractCallMarketParamName } from "../utils/getAptosContractCallMarketParamName"

export const bulkBuyAptos = async ({
  nfts, 
  nftContractsById,
  aptosSignAndSendTransaction
}) => {
  let payloadArguments = [[], [], [], [], [], [], [], [], []]

  for (let nft of nfts) {
    const listing = nft?.listings[0]
    const nftContract = nftContractsById?.[nft?.id]
  
    payloadArguments?.[0]?.push(getAptosContractCallMarketParamName(listing?.market_name))
    payloadArguments?.[1]?.push(listing?.seller)
    payloadArguments?.[2]?.push(listing?.price_str)
    payloadArguments?.[3]?.push(nftContract?.key?.split('::')?.[0]) // creator
    payloadArguments?.[4]?.push(nft?.collection?.title)
    payloadArguments?.[5]?.push(decodeURIComponent(nft?.token_id))
    payloadArguments?.[6]?.push(nft?.version)
    payloadArguments?.[7]?.push(listing?.nonce ? listing?.nonce : "")
    payloadArguments?.[8]?.push([])
  }

  const payload = {
    function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::markets::buy_tokens_v2",
    type_arguments: [],
    arguments: payloadArguments,
    type: "entry_function_payload"
  }

  return await aptosSignAndSendTransaction(payload)
}


