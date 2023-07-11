import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter"

export const unlistAptos = async ({
  nft,
  nftContract,
  aptosSignAndSendTransaction
}) => {
  const createPayload = () => {
    switch(nft?.listings?.[0]?.market_name) {
      case "tradeport":
        default:
          return {
            function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::listings::unlist_token",
            type_arguments: [],
            arguments: [
              nftContract?.key?.split('::')?.[0], // creator
              nft?.collection?.title,
              decodeURIComponent(nft?.token_id),
              nft?.version
            ],
            type: "entry_function_payload"
          }
      case "topaz":
        return {
          function: "0x2c7bccf7b31baf770fdbcc768d9e9cb3d87805e255355df5db32ac9a669010a2::marketplace_v2::delist",
          type_arguments: [
            "0x1::aptos_coin::AptosCoin"
          ],
          arguments: [
            "1", // token amount
            nftContract?.key?.split('::')?.[0], // creator 
            nft?.collection?.title,
            decodeURIComponent(nft?.token_id),
            nft?.version
          ],
            type: "entry_function_payload"
        }
      case "souffl3":
        return {
          function: "0xf6994988bd40261af9431cd6dd3fcf765569719e66322c7a05cc78a89cd366d4::Aggregator::batch_delist_script_V1",
          type_arguments: [],
          arguments: [
            [
              capitalizeFirstLetter(nft?.listings?.[0]?.market_name) // market name
            ],
            [
              "1" // token_amount
            ],
            [
              nftContract?.key?.split('::')?.[0] // creator
            ],
            [
              nft?.collection?.title
            ],
            [
              decodeURIComponent(nft?.token_id)
            ],
            [
              nft?.version
            ],
            [
              "0xf6994988bd40261af9431cd6dd3fcf765569719e66322c7a05cc78a89cd366d4"
            ],
            [
              "" // not sure exactly, sometimes "souffle"
            ]
          ],
          type: "entry_function_payload"
        }
      case "bluemove":
        return {
          function: "0xd1fd99c1944b84d1670a2536417e997864ad12303d19eac725891691b04d614e::marketplaceV2::batch_delist_script",
          type_arguments: [],
          arguments: [
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
              nft?.version
            ]
          ],
          type: "entry_function_payload"
        }
      case "sea-shrine":
        return {
          function: "0xd5431191333a6185105c172e65f9fcd945ae92159ab648e1a9ea88c71e275548::listing::cancel_listing",
          type_arguments: [
            "0x1::aptos_coin::AptosCoin"
          ],
          arguments: [
            nft?.listings?.[0]?.nonce // listing id
          ],
          type: "entry_function_payload"
        }
      case "okx":
        return {
          function: "0x1e6009ce9d288f3d5031c06ca0b19a334214ead798a0cb38808485bd6d997a43::okx_fixed_price::cancel_direct_listing",
          type_arguments: [
            "0x1::aptos_coin::AptosCoin"
          ],
          arguments: [
            nft?.listings?.[0]?.nonce // listing id
          ],
          type: "entry_function_payload"
        }
      case "ozozoz":
        return {
          function: "0xded0c1249b522cecb11276d2fad03e6635507438fef042abeea3097846090bcd::OzozozMarketplace::delist",
          type_arguments: [],
          arguments: [
            [nft?.listings?.[0]?.nonce] // listing ids
          ],
          type: "entry_function_payload"
        }
    }
  }

  return await aptosSignAndSendTransaction(createPayload())
}