import axios from "axios"

export const getAptosWalletSequenceNumber = async ({accountId}) => {
  try {
    const res = await axios.get(`https://fullnode.mainnet.aptoslabs.com/v1/accounts/${accountId}`)
    return res?.data?.sequence_number
  } catch(err) {
    return null
  }
}