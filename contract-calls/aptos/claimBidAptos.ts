export const claimBidNftAptos = async ({
  nft, 
  nftContract, 
  bid,
  claimableFromSouffl3Count,
  aptosSignAndSendTransaction
}) => {

  const claimableContractKey = nft?.chain_state?.claimable_contract_key
  const claimableReason = nft?.chain_state?.claimable_reason

  const createPayload = () => {
    switch(claimableContractKey) {
      case "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26": // tradeport
      default:
        return {
          function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::biddings::claim_token",
          type_arguments: [],
          arguments: [
            nftContract?.key?.split('::')?.[0], // creator 
            nft?.collection?.title,
            decodeURIComponent(nft?.token_id),
            nft?.version
          ],
          type: "entry_function_payload"
        }
      case "0x2c7bccf7b31baf770fdbcc768d9e9cb3d87805e255355df5db32ac9a669010a2": // topaz
        return {
          function: "0x2c7bccf7b31baf770fdbcc768d9e9cb3d87805e255355df5db32ac9a669010a2::inbox::claim_script",
          type_arguments: [],
          arguments: [
            nftContract?.key?.split('::')?.[0], // creator 
            nft?.collection?.title,
            decodeURIComponent(nft?.token_id),
            nft?.version
          ],
          type: "entry_function_payload"
        }
      case "0x7ee5b48b8b7413d062331f6728652cd9e371f3a173379e5ee30870e8875d2784": // souffl3
        return {
          function: "0x7ee5b48b8b7413d062331f6728652cd9e371f3a173379e5ee30870e8875d2784::offer::claim_tokens_from_escrow",
          type_arguments: [],
          arguments: [
            claimableFromSouffl3Count?.toString()
          ],
          type: "entry_function_payload",
        }
      case "0xd1fd99c1944b84d1670a2536417e997864ad12303d19eac725891691b04d614e": // bluemove
        if (claimableReason == "accept-collection-offer") {
          return {
            function: "0xd1fd99c1944b84d1670a2536417e997864ad12303d19eac725891691b04d614e::marketplaceV2::claim_offer_collection_item",
            type_arguments: [],
            arguments: [
              bid?.nonce,
              decodeURIComponent(nft?.token_id),
              nft?.version
            ],
            type: "entry_function_payload"
          }
        } else {
          return {
            function: "0xd1fd99c1944b84d1670a2536417e997864ad12303d19eac725891691b04d614e::marketplaceV2::claim_offer_token",
            type_arguments: [],
            arguments: [
              bid?.nonce,
            ],
            type: "entry_function_payload"
          }
        }
    }
  }

  return await aptosSignAndSendTransaction(createPayload())
}