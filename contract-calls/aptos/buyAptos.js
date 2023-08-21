import { getNftTradingPool } from "../utils/getNftTradingPool"
import { getNftContractCommission } from "../utils/getNftContractCommission"
import { getAptosContractCallMarketParamName } from "../utils/getAptosContractCallMarketParamName"

export const buyAptos = async ({
  nft,
  nftContract,
  listing,
  aptosSignAndSendTransaction
}) => {
  const formatLargeNum = (num) => parseInt(num?.toFixed(0))

  const createPayload = async () => {
    switch(listing?.market_name) {
      case "portals":
        const commission = await getNftContractCommission({chain: "aptos", nftContractId: nftContract?.id})
        const portal = await getNftTradingPool({chain: "aptos", nftId: nft?.id})
        let newSpotPrice = portal?.spot_price + portal?.delta
        if (portal?.type == "exponential") {
          newSpotPrice =  portal?.spot_price + formatLargeNum((portal?.spot_price * (portal?.delta / 10000)))
        }
        let buyPrice = newSpotPrice + formatLargeNum((newSpotPrice * (portal?.creator_fee_pct / 100))) + formatLargeNum((newSpotPrice * (commission?.market_fee / 100))) + formatLargeNum((newSpotPrice * commission?.royalty) )
        if (portal?.type == "exponential") {
          buyPrice += formatLargeNum((newSpotPrice * (portal?.delta / 10000)))
        }
        if (portal?.type == "linear") {
          buyPrice += portal?.delta
        }

        return {
          function: "0xb5a3d63d4b76e6088db9c674c478eac7433ad1136d82a411b1d7822a51bb8950::portals_v1::swap_buy_token_v2",
          type_arguments: [],
          arguments: [
            portal?.nonce,
            nftContract?.key?.split('::')?.[0], // creator
            nft?.collection?.title,
            decodeURIComponent(nft?.token_id),
            nft?.version,
            buyPrice
          ],
          type: "entry_function_payload"
        }
      case "mobius":
        const pool = await getNftTradingPool({chain: "aptos", nftId: nft?.id})
        
        return {
          function: "0xf6994988bd40261af9431cd6dd3fcf765569719e66322c7a05cc78a89cd366d4::Aggregator::batch_buy_script_V3",
          type_arguments: [],
          arguments: [
            [
              "Mobius"
            ],
            [],
            [],
            [],
            [
              nftContract?.key?.split('::')?.[0], // creator
            ],
            [
              nft?.collection?.title,
            ],
            [
              decodeURIComponent(nft?.token_id),
            ],
            [
              nft?.version,
            ],
            [],
            [],
            [
              pool?.nonce
            ],
            []
          ],
          type: "entry_function_payload"
        }
      default:

        if (nft?.collection?.slug.startsWith("0x")) {
          return {
            function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::listings_v2::buy_token",
            type_arguments: [],
            arguments: [
              nft?.listings?.[0]?.nonce
            ],
            type: "entry_function_payload"
          }
        }

        let payloadArguments = [[], [], [], [], [], [], [], [], []]  
        payloadArguments?.[0]?.push(getAptosContractCallMarketParamName(listing?.market_name))
        payloadArguments?.[1]?.push(listing?.seller)
        payloadArguments?.[2]?.push(listing?.price_str)
        payloadArguments?.[3]?.push(nftContract?.key?.split('::')?.[0])
        payloadArguments?.[4]?.push(nft?.collection?.title)
        payloadArguments?.[5]?.push(decodeURIComponent(nft?.token_id))
        payloadArguments?.[6]?.push(nft?.version)
        payloadArguments?.[7]?.push(listing?.nonce ? listing?.nonce : "")
        payloadArguments?.[8]?.push([])

        return {
          function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::markets::buy_tokens_v2",
          type_arguments: [],
          arguments: payloadArguments,
          type: "entry_function_payload"
        }
    }
  }

  return await aptosSignAndSendTransaction(await createPayload())
}


