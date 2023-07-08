import { gql } from "graphql-request"

interface ChainQuery {
  chain: string
  query: string
}

export function createChainGQLQuery({chain, query}: ChainQuery) {
  const regex = /query\s+(\w+)\s*\((.*?)\)\s*{([\s\S]*)}/
  const matches = regex.exec(query)

  if (!matches || matches.length !== 4) {
    throw new Error('Invalid query string format')
  }

  const [, queryName, argsString, bodyString] = matches
  const args = argsString.trim().length ? `(${argsString.trim()})` : ''
  const body = bodyString.trim()
  const wrappedBody = `${chain} {\n${body}\n}`

  return gql`query ${queryName}${args} {\n${wrappedBody}\n}`
}
