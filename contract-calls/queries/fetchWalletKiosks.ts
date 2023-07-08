import { gql } from "graphql-request"

export const fetchWalletKiosks = gql`
  query fetchWalletKiosks($wallet: String!) {
    kiosks: kiosks_by_owner_address(owner_address: $wallet) {
      id
      is_origin_byte
      owner_address
    }
  }
`
