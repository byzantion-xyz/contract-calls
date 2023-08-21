import { parseCrypto } from "..utils/parseCrypto"
import { getAptosContractCallMarketParamName } from "../utils/getAptosContractCallMarketParamName"

export const bulkListAptos = async ({
  componentName,
  connectedWalletId,
  connectedWalletChain,
  listingsToUpdate,
  aptosSignAndSendTransaction
}) => {
  let payloadArguments = [[], [], [], [], [], [], [], [], [], []]

  for (let listing of listingsToUpdate) {
    const {market, listAmount, nft, nftContract} = listing

    payloadArguments?.[0]?.push(nft?.collection?.slug.startsWith("0x") ? 2 : 1)
    payloadArguments?.[1]?.push(nft?.listings?.[0]?.price ? getAptosContractCallMarketParamName(nft?.listings?.[0]?.market_name) : '')
    payloadArguments?.[2]?.push(nftContract?.key?.split('::')?.[0])
    payloadArguments?.[3]?.push(nft?.collection?.title)
    payloadArguments?.[4]?.push(decodeURIComponent(nft?.token_id))
    payloadArguments?.[5]?.push(nft?.version)
    payloadArguments?.[6]?.push(parseCrypto(listAmount, "aptos").toString())
    payloadArguments?.[7]?.push(nft?.collection?.slug.startsWith("0x") ? "" : (nft?.listings?.[0]?.nonce ? nft?.listings?.[0]?.nonce : ""))
    payloadArguments?.[8]?.push(nft?.collection?.slug.startsWith("0x") ? (nft?.listings?.[0]?.nonce ? nft?.listings?.[0]?.nonce : "0x0") : "0x0")
    payloadArguments?.[9]?.push(nft?.collection?.slug.startsWith("0x") ? nft?.token_id : "0x0")

    trackSignTx({
      component: componentName,
      action: 'BULK LIST',
      wallet: connectedWalletId,
      chain: connectedWalletChain,
      price: parseCrypto(listAmount, "aptos").toString(),
      market,
      seller: connectedWalletId,
      nft
    })
  }

  const payload = {
    function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::markets_v2::list_tokens_v2",
    type_arguments: [],
    arguments: payloadArguments,
    type: "entry_function_payload"
  }

  return await aptosSignAndSendTransaction(payload)
}


