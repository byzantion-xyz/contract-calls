import {gqlChainRequest} from "../utils/gqlChainRequest";

export const getSuiOwnerCapByKiosk = async (kioskId) => {
  if (!kioskId) return null
  
  const res = await gqlChainRequest({
    chain: "sui",
    query: fetchOwnerCapByKiosk,
    variables: {kioskId}
  })
  
  return res?.ownerCap?.id
}