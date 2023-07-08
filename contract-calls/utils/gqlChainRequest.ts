import { GraphQLClient } from "graphql-request"
import { createChainGQLQuery } from "./createChainGQLQuery"

const client = new GraphQLClient(process.env.NEXT_PUBLIC_INDEXER_API_URL, {
  headers: { 'x-api-user': process.env.NEXT_PUBLIC_INDEXER_API_USER, 'x-api-key': process.env.NEXT_PUBLIC_INDEXER_API_KEY}
})

export const gqlChainRequest = async ({chain, query, variables}) => {
  const response = await client.request(createChainGQLQuery({chain, query}), variables)
  return response?.[chain]
}