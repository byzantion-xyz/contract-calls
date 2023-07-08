import { gqlChainRequest } from "./gqlChainRequest"
import { originByteAllowListObject } from "../constants"
import { fetchSharedObjectsByType } from "../queries/fetchSharedObjectsByType"

export const getSuiSharedObjects = async (nftContract) => {
  const sharedObjectsRes = await gqlChainRequest({
    chain: "sui",
    query: fetchSharedObjectsByType, 
    variables: {nftType: nftContract?.properties?.nft_type}
  })

  let allowList = nftContract?.properties?.shared_objects?.find(o => o.type?.includes("allowlist"))?.id
  if (!allowList) allowList = originByteAllowListObject

  return {
    orderbook: sharedObjectsRes?.sharedObjects?.filter(object => object?.module == "orderbook")?.[0]?.id,
    collection: sharedObjectsRes?.sharedObjects?.filter(object => object?.module == "collection")?.[0]?.id,
    royaltyStrategy: sharedObjectsRes?.sharedObjects?.filter(object => object?.module == "royalty_strategy_bps")?.[0]?.id,
    transferPolicy: sharedObjectsRes?.sharedObjects?.filter(object => object?.module == "transfer_policy")?.[0]?.id,
    allowList
  }
}