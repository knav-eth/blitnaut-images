import { gql, GraphQLClient } from "graphql-request"

const client = new GraphQLClient("https://api.thegraph.com/subgraphs/name/knav-eth/blitnauts")

export type SubgraphBlitnaut = {
  id: string
  numericId: number
  owner: string
  name: string
  frameId: number
  base: string
  edition: string
  blitmapId: number
  colorIds: Array<number>
  colors: Array<string>
  backgroundColorId: number
  backgroundColor: string
}

type GetBlitnautResponse = {
  blitnaut: SubgraphBlitnaut
}

const BLITNAUT_FRAGMENT = `
  id
  numericId
  owner
  name
  frameId
  base
  edition
  blitmapId
  colorIds
  colors
  backgroundColorId
  backgroundColor
`

export async function getBlitnautById(blitnautId: number): Promise<SubgraphBlitnaut | undefined> {
  const query = gql`
      query getBlitnaut($blitnautId: Int!) {
          blitnaut(id: $blitnautId) {
              ${BLITNAUT_FRAGMENT}
          }
      }
  `
  const variables = {
    blitnautId,
  }

  const data = await client.request<GetBlitnautResponse>(query, variables)
  return data?.blitnaut
}

type ListBlitnautResponse = {
  blitnauts: Array<SubgraphBlitnaut>
}

export async function getBlitnautsAfterId(mostRecentBlitnautId: number): Promise<Array<SubgraphBlitnaut>> {
  const query = gql`
      query getBlitnautsAfterId($mostRecentBlitnautId: Int!) {
          blitnauts(
              where:{ numericId_gt: $mostRecentBlitnautId }
              orderBy: id
              orderDirection: asc
          ) {
              ${BLITNAUT_FRAGMENT}
          }
      }
  `
  const variables = {
    mostRecentBlitnautId,
  }
  const data = await client.request<ListBlitnautResponse>(query, variables)
  return data?.blitnauts
}

export async function getAllBlitnauts(): Promise<Array<SubgraphBlitnaut>> {
  const gaussians: Array<SubgraphBlitnaut> = []
  let skip = 0
  while (true) {
    const query = gql`
        query getAllBlitnauts($skip: Int!) {
            blitnauts(first: 1000, skip: $skip) {
                ${BLITNAUT_FRAGMENT}
            }
        }
    `
    const variables = {
      skip,
    }
    const data = await client.request<ListBlitnautResponse>(query, variables)
    gaussians.push(...data.blitnauts)
    if (data.blitnauts.length === 0) {
      return gaussians
    }
    skip += 1000
  }
}
