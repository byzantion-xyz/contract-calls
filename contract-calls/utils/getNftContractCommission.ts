import { gqlChainRequest } from "./gqlChainRequest"
import { fetchNftContractCommission } from "../queries/fetchNftContractCommission"

export const getNftContractCommission = async ({chain, nftContractId}) => {
  const response = await gqlChainRequest({
    chain,
    query: fetchNftContractCommission,
    variables: {
      contract_id: nftContractId,
    }
  })

  if (response?.commissions?.[0]) {
    return response?.commissions?.[0]
  }
}