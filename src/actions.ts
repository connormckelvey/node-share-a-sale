export * from './actions/types'
import * as traffic from './actions/traffic'

export type TrafficSortCols = traffic.SortCols
export type TrafficInput = traffic.Input
export type TrafficOutput = traffic.Output
export const createTrafficAction = traffic.createAction