import { getAptosContractCallMarketParamName } from "../utils/getAptosContractCallMarketParamName"

export const bulkBuyAptos = async ({
  nfts,
  nftContractsById,
  componentName,
  connectedWalletId,
  connectedWalletChain,
  aptosSignAndSendTransaction
}) => {
  let payloadArguments = [[], [], [], [], [], [], [], [], []]
  let payloadArgumentsV2 = [[]]

  for (let nft of nfts) {
    const nftContract = nftContractsById?.[nft?.id]
    const lowestListing = nft?.listings[0]

    if (nft?.collection?.slug.startsWith("0x")) {
      payloadArgumentsV2?.[0]?.push(lowestListing?.nonce)
    } else {
      payloadArguments?.[0]?.push(getAptosContractCallMarketParamName(lowestListing?.market_name))
      payloadArguments?.[1]?.push(lowestListing?.seller)
      payloadArguments?.[2]?.push(lowestListing?.price_str)
      payloadArguments?.[3]?.push(nftContract?.key?.split('::')?.[0]) // creator
      payloadArguments?.[4]?.push(nft?.collection?.title)
      payloadArguments?.[5]?.push(decodeURIComponent(nft?.token_id))
      payloadArguments?.[6]?.push(nft?.version)
      payloadArguments?.[7]?.push(lowestListing?.nonce ? lowestListing?.nonce : "")
      payloadArguments?.[8]?.push([])
    }

    trackSignTx({
      component: componentName,
      action: 'BULK BUY',
      wallet: connectedWalletId,
      chain: connectedWalletChain,
      price: lowestListing?.price,
      buyer: connectedWalletId,
      seller: lowestListing?.seller,
      market: lowestListing?.market_name,
      nft
    })
  }

  const payload = {
    function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::markets::buy_tokens_v2",
    type_arguments: [],
    arguments: nfts[0]?.collection?.slug.startsWith("0x") ? payloadArgumentsV2 : payloadArguments,
    type: "entry_function_payload"
  }

  return await aptosSignAndSendTransaction(payload)
}
