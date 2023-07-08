import { getAptosContractCallMarketParamName } from "../utils/getAptosContractCallMarketParamName"

export const acceptCollectionBidAptos = async ({
  nft,
  nftContract, 
  bid, 
  aptosSignAndSendTransaction
}) => {
  const createPayload = () => {
    switch(bid?.market_contract?.name) {
      case "tradeport":
      default:
        if (nft?.listings?.[0]?.price) {
          return {
            function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::biddings::unlist_and_accept_collection_bid_v2",
            type_arguments: [],
            arguments: [
              bid?.nonce,
              getAptosContractCallMarketParamName(bid?.market_contract?.name),
              nftContract?.key?.split('::')?.[0],
              nft?.collection?.title,
              decodeURIComponent(nft?.token_id),
              nft?.version,
              nft?.listings?.[0]?.price,
              nft?.listings?.[0]?.nonce
            ]
          }
        } else {
          return {
            function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::biddings::accept_collection_bid",
            type_arguments: [],
            arguments: [
              bid?.nonce,
              nftContract?.key?.split('::')?.[0], // creator
              nft?.collection?.title,
              decodeURIComponent(nft?.token_id),
              nft?.version
            ]
          }
        }
      case "topaz":
        return {
          function: "0x2c7bccf7b31baf770fdbcc768d9e9cb3d87805e255355df5db32ac9a669010a2::collection_marketplace::fill",
          type_arguments: [
            "0x1::aptos_coin::AptosCoin"
          ],
          arguments: [
            bid?.nonce,
            "1",
            nftContract?.key?.split('::')?.[0], // creator
            nft?.collection?.title,
            decodeURIComponent(nft?.token_id),
            nft?.version
          ],
          type: "entry_function_payload"
        }
      case "souffl3":
        return {
          function: "0x7ee5b48b8b7413d062331f6728652cd9e371f3a173379e5ee30870e8875d2784::offer::accept_collection_offer_with_listing_market",
          type_arguments: [
            "0x1::aptos_coin::AptosCoin"
          ],
          arguments: [
            "0x7ee5b48b8b7413d062331f6728652cd9e371f3a173379e5ee30870e8875d2784",
            bid?.buyer,
            nftContract?.key?.split('::')?.[0], // creator
            nft?.collection?.title,
            [
              decodeURIComponent(nft?.token_id),
            ],
            [
              nft?.version
            ],
            [
              ""
            ]
          ],
          type: "entry_function_payload"
        }
      case "bluemove":
        return {
          function: "0xd1fd99c1944b84d1670a2536417e997864ad12303d19eac725891691b04d614e::marketplaceV2::accept_offer_collection",
          type_arguments: [],
          arguments: [
            bid?.nonce,
            nftContract?.key?.split('::')?.[0], // creator
            nft?.collection?.title,
            decodeURIComponent(nft?.token_id),
            nft?.version
          ],
          type: "entry_function_payload"
        }
    }
  }

  return await aptosSignAndSendTransaction(createPayload())
}


