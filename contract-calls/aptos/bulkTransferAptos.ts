export const bulkTransferAptos = async ({
  nfts,
  nftContractsById,
  receiverId,
  aptosSignAndSendTransaction
}) => {
  let payloadArguments = [receiverId, [], [], [], [], []]

  for (let nft of nfts) {
    payloadArguments?.[1]?.push(nftContractsById?.[nft.id]?.key?.split('::')?.[0]) // creator
    payloadArguments?.[2]?.push(nft?.collection?.title)
    payloadArguments?.[3]?.push(decodeURIComponent(nft?.token_id))
    payloadArguments?.[4]?.push(nft?.version)
    payloadArguments?.[5]?.push("1")
  }

  const payload = {
    function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::transfers::transfer_tokens",
    type_arguments: [],
    arguments: payloadArguments,
    type: "entry_function_payload"
  }

  return await aptosSignAndSendTransaction(payload)
}