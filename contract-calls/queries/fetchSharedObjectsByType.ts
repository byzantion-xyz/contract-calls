import { gql } from "graphql-request"

export const fetchSharedObjectsByType = gql`
  query fetchSharedObjectsByType($nftType: String!) {
    sharedObjects: shared_objects_by_type(type: $nftType) {
      id
      module
      pkg
      type
    }
  }
`
