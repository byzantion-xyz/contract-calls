export const transferAptos = async ({
  nft,
  nftContract,
  connectedWalletId,
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

  const createPayload = () => {
      return {
        function: "0xe11c12ec495f3989c35e1c6a0af414451223305b579291fc8f3d9d0575a23c26::transfers_v2::transfer_token_v2",
        type_arguments: [],
        arguments: [
          receiverAddress,
          nft?.collection?.slug.startsWith("0x") ? 2 : 1,
          nftContract?.key?.split('::')?.[0],
          nft?.collection?.title,
          decodeURIComponent(nft?.token_id),
          nft?.version,
          "1",
          nft?.collection?.slug.startsWith("0x") ? nft?.token_id : "0x0"
        ],
        type: "entry_function_payload"
      }
  }

  return await aptosSignAndSendTransaction(createPayload())
}