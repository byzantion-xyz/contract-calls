import { gql } from "graphql-request"

export const fetchNftContractCommission = gql`
  query fetchNftContractCommission($contract_id: uuid!) {
    commissions(
      where: {
        contract_id: {_eq: $contract_id}
      }
    ) {
      is_custodial
      key
      market_fee
      market_name
      royalty
    }
  }
`
