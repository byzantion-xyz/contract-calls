import { parseCrypto } from "..utils/parseCrypto"
import moment from "moment"

export const listAptos = async ({
  nft, 
  nftContract,
  price, 
  market, 
  aptosSignAndSendTransaction
}) => {
  const createPayload = () => {
    switch(market) {
      case "tradeport":
      default:
        return {
          function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::listings::list_token",
          type_arguments: [],
          arguments: [
            nftContract?.key?.split('::')?.[0], // creator
            nft?.collection?.title,
            decodeURIComponent(nft?.token_id),
            nft?.version,
            parseCrypto(price, "aptos").toString()
          ],
          type: "entry_function_payload"
        }
      case "topaz":
        return {
          function: "0x2c7bccf7b31baf770fdbcc768d9e9cb3d87805e255355df5db32ac9a669010a2::marketplace_v2::list",
          type_arguments: [
            "0x1::aptos_coin::AptosCoin"
          ],
          arguments: [
            parseCrypto(price, "aptos").toString(),
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
          function: "0xf6994988bd40261af9431cd6dd3fcf765569719e66322c7a05cc78a89cd366d4::FixedPriceMarket::batch_list_script",
          type_arguments: [
            "0x1::aptos_coin::AptosCoin"
          ],
          arguments: [
            [
              nftContract?.key?.split('::')?.[0] // creator 
            ],
            [
              nft?.collection?.title,
            ],
            [
              decodeURIComponent(nft?.token_id),
            ],
            [
              nft?.version
            ],
            [
              "1" // token_amount
            ],
            [
              parseCrypto(price, "aptos").toString()
            ],
            [
              "0" // locked_until_secs from 0xf6994988bd40261af9431cd6dd3fcf765569719e66322c7a05cc78a89cd366d4::token_coin_swap::TokenListingEvent
            ],
            [
              "0xf6994988bd40261af9431cd6dd3fcf765569719e66322c7a05cc78a89cd366d4" // marketplace address
            ],
            [
              "souffle"
            ]
          ],
          type: "entry_function_payload"
        }
      case "bluemove":
        return {
          function: "0xd1fd99c1944b84d1670a2536417e997864ad12303d19eac725891691b04d614e::marketplaceV2::batch_list_script",
          type_arguments: [],
          arguments: [
            [
              nftContract?.key?.split('::')?.[0] // creator 
            ],
            [
              nft?.collection?.title,
            ],
            [
              decodeURIComponent(nft?.token_id),
            ],
            [
              parseCrypto(price, "aptos").toString()
            ],
            [
              nft?.version
            ]
          ],
          type: "entry_function_payload"
        }
      case "seashrine":
        return {
          function: "0xd5431191333a6185105c172e65f9fcd945ae92159ab648e1a9ea88c71e275548::listing::create_listing",
          type_arguments: [
            "0x1::aptos_coin::AptosCoin"
          ],
          arguments: [
            nftContract?.key?.split('::')?.[0], // creator
            nft?.collection?.title,
            decodeURIComponent(nft?.token_id),
            nft?.version,
            "1", // token amount
            parseCrypto(price, "aptos").toString(),
            true, // instant_sale boolean
            moment().unix(), // start_sec
            moment().add(10, "years").valueOf() // end_sec (default expire 10 years from now until we handle expirations)
          ],
          type: "entry_function_payload"
        }
      case "okx":
        return {
          function: "0x1e6009ce9d288f3d5031c06ca0b19a334214ead798a0cb38808485bd6d997a43::okx_fixed_price::create_direct_listing",
          type_arguments: [
            "0x1::aptos_coin::AptosCoin"
          ],
          arguments: [
            nftContract?.key?.split('::')?.[0], // creator
            nft?.collection?.title,
            decodeURIComponent(nft?.token_id),
            nft?.version,
            "1", // token amount
            parseCrypto(price, "aptos").toString(),
            moment().unix(), // start_sec
            moment().add(10, "years").valueOf(), // end_sec (default expire 10 years from now until we handle expirations)
            moment().add(10, "years").add(1, "second").valueOf() // withdraw_expiration_sec (default expire 10 years + 1 sec since the withdraw_expiration_sec needs to be longer than the end_sec expiration -- until we handle withdraw expirations)
          ],
          type: "entry_function_payload"
        }
      case "ozozoz":
        return {
          function: "0xded0c1249b522cecb11276d2fad03e6635507438fef042abeea3097846090bcd::OzozozMarketplace::list",
          type_arguments: [],
          arguments: [
            [nft?.collection?.title],
            [decodeURIComponent(nft?.token_id)],
            [nftContract?.key?.split('::')?.[0]], // creator
            [nft?.version],
            ["1"], // token amount
            [parseCrypto(price, "aptos").toString()],
          ],
          type: "entry_function_payload"
        }
    }
  }

  return await aptosSignAndSendTransaction(createPayload())
}


