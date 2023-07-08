import {JsonRpcClient, SuiObjectResponse} from "@mysten/sui.js";

export const getSuiBidderKiosk = async (bidNonce) => {
  const jsonRpcClient = new JsonRpcClient('https://sui-rpc-mainnet.testnet-pride.com:443')
  const bidObject = await jsonRpcClient.requestWithType(
      'sui_getObject',
      [bidNonce, { showContent: true }],
      SuiObjectResponse,
  )
  return bidObject.data?.content?.['fields']?.['kiosk']
}