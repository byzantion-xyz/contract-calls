export const transferAptos = async ({
  nft, 
  nftContract, 
  receiverId,
  aptosSignAndSendTransaction
}) => {
  
  const payload = {
    function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::transfers::transfer_token",
    type_arguments: [],
    arguments: [
      receiverId,
      nftContract?.key?.split('::')?.[0], // creator
      nft?.collection?.title,
      decodeURIComponent(nft?.token_id),
      nft?.version,
      "1"
    ],
    type: "entry_function_payload"
  }

  return await aptosSignAndSendTransaction(payload)
}