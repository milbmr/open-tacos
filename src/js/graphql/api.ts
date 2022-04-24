import { gql } from '@apollo/client'

import { AreaType } from '../types'
import { graphqlClient } from './Client'
import { CORE_CRAG_FIELDS } from './fragments'
interface CragsDetailsNearType {
  data: Array<Partial<AreaType>>
  placeId: string
  error?: string | undefined
}

export const getCragDetailsNear = async (
  placeId: string = 'unspecified',
  lnglat: [number, number],
  range: number[],
  includeCrags: boolean = false
): Promise<CragsDetailsNearType> => {
  try {
    const rs = await graphqlClient.query({
      query: CRAGS_NEAR,
      fetchPolicy: 'cache-first',
      variables: {
        lng: lnglat[0],
        lat: lnglat[1],
        placeId,
        minDistance: range[0],
        maxDistance: range[1],
        includeCrags
      }
    })

    const { cragsNear } = rs.data
    const groups = cragsNear.map(entry => entry.crags).flat()
    return { data: groups, placeId }
  } catch (e) {
    console.log(e)
  }
  return {
    data: [],
    error: 'API error',
    placeId: undefined
  }
}

const CRAGS_NEAR = gql`
  ${CORE_CRAG_FIELDS}
  query CragsNear($placeId: String, $lng: Float, $lat: Float, $minDistance: Int, $maxDistance: Int, $includeCrags: Boolean) {
  cragsNear(placeId: $placeId, lnglat: {lat: $lat, lng: $lng}, minDistance: $minDistance, maxDistance: $maxDistance, includeCrags: $includeCrags) {
      count
      _id 
      placeId
      crags {
        ...CoreCragFields
      }
  }
}`

/**
 * Fetch an area by uuid from the cache
 * @param uuid
 * @returns Area or null if not found
 */
export const getAreaByUUID = (uuid: string): AreaType | null => {
  try {
    const queryId = `Area:{"uuid":"${uuid}"}` // Very strange looking id, but this is how Apollo works
    const query = graphqlClient.readFragment({
      id: queryId,
      fragment: CORE_CRAG_FIELDS
    }
    )
    if (query !== null) {
      return query
    }
  } catch (e) {
    console.log(e)
    return null
  }
  return null
}