export const bulkTransferAptos = async ({
  nfts,
  nftContractsById,
  componentName,
  connectedWalletId,
  connectedWalletChain,
  receiverId,
  aptosSignAndSendTransaction
}) => {
  if (receiverId === connectedWalletId) {
    throw new Error(`Cannot transfer to self`)
  }

  let receiverAddress = receiverId

  if (!receiverId?.includes("0x")) {
    receiverAddress = await getAptAddressFromName(receiverId)
    if (!receiverAddress) {
      throw new Error(`${receiverId}.apt is not linked to a target address`)
    }
  }
  const accountExists = await checkIfAptosAccountExists(receiverAddress)
  if (!accountExists) {
    throw new Error(`Account ${receiverAddress?.slice(0, 15)}...${receiverAddress?.slice(-15)} does not exist`)
  }

  trackSignTx({
    component: componentName,
    action: 'BULK TRANSFER',
    wallet: connectedWalletId,
    chain: connectedWalletChain,
    price: null,
    buyer: receiverAddress,
    seller: connectedWalletId,
    nft: nfts
  })

  let payloadArguments = [receiverAddress, [], [], [], [], [], [], []]
  for (let nft of nfts) {
    payloadArguments?.[1]?.push(nft?.collection?.slug.startsWith("0x") ? 2 : 1)
    payloadArguments?.[2]?.push(nftContractsById?.[nft.id]?.key?.split('::')?.[0]) // creator
    payloadArguments?.[3]?.push(nft?.collection?.title)
    payloadArguments?.[4]?.push(decodeURIComponent(nft?.token_id))
    payloadArguments?.[5]?.push(nft?.version)
    payloadArguments?.[6]?.push("1")
    payloadArguments?.[7]?.push(nft?.collection?.slug.startsWith("0x") ? nft?.token_id : "0x0")
  }

  const payload = {
    function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::transfers_v2::transfer_tokens_v2",
    type_arguments: [],
    arguments: payloadArguments,
    type: "entry_function_payload"
  }

  return await aptosSignAndSendTransaction(payload)
}