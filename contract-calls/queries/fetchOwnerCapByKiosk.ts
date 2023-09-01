import { gql } from "graphql-request"

export const fetchOwnerCapByKiosk = gql`
  query fetchOwnerCapByKiosk($kioskId: String!) {
    ownerCap: kiosk_owner_cap_by_kiosk(kiosk_id: $kioskId) {
      id
      kiosk_id
    }
  }
`
