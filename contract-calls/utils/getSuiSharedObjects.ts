import { gqlChainRequest } from "./gqlChainRequest"
import { fuddiesOriginByteAllowListObject, originByteAllowListObject, suishiOriginByteAllowListObject } from "../constants"
import { fetchSharedObjectsByType } from "../queries/fetchSharedObjectsByType"
import { addLeadingZerosAfter0x } from "./addLeadingZerosAfter0x"

export const getSuiSharedObjects = async (nftContract) => {
  const sharedObjectsRes = await gqlChainRequest({
    chain: "sui",
    query: fetchSharedObjectsByType,
    variables: {nftType: addLeadingZerosAfter0x(nftContract?.properties?.nft_type)}
  })

  let allowList = sharedObjectsRes?.sharedObjects?.filter(object => object?.module == "allowlist")?.[0]?.id
  if (!allowList) allowList = originByteAllowListObject
  if (nftContract?.properties?.nft_type == "0xf1681f601a1c021a0b4c8c8859d50917308fcbebfd19364c4e856ac670bb8496::suishi::Suishi") {
    allowList = suishiOriginByteAllowListObject
  }
  if (nftContract?.properties?.nft_type == "0xac176715abe5bcdaae627c5048958bbe320a8474f524674f3278e31af3c8b86b::fuddies::Fuddies") {
    allowList = fuddiesOriginByteAllowListObject
  }

  return {
    orderbook: sharedObjectsRes?.sharedObjects?.filter(object => object?.module == "orderbook")?.[0]?.id,
    collection: sharedObjectsRes?.sharedObjects?.filter(object => object?.module == "collection")?.[0]?.id,
    royaltyStrategy: sharedObjectsRes?.sharedObjects?.filter(object => object?.module == "royalty_strategy_bps")?.[0]?.id,
    transferPolicy: sharedObjectsRes?.sharedObjects?.filter(object => object?.module == "transfer_policy")?.[0]?.id,
    marketplace: sharedObjectsRes?.sharedObjects?.filter(object => object?.module == "marketplace")?.[0]?.id,
    allowList
  }
}