import * as types from './types'
import { formatDate } from '../utils'

export type SortCols = 'transdate' | 'transId' | 'commission' | 'merchantId' | 'status' | 'commission' | 'comment'

export type Input = {
  dateStart: Date
  dateEnd?: Date
  merchantId?: number
  lockDate?: Date
  paidDate?: Date
  sortCol?: SortCols
  sortDir?: types.SortDir
}

export type Output = {
    merchantID: string // number,
    organization: string,
    website: string,
    uniqueHits: string // number,
    Commissions: string // number / $,
    netSales: string // number / $,
    numberOfVoids: string // number,
    numberOfSales: string // number,
    conversion: string // number / %,
    epc: string // number / $
}

export const createAction = (input: Input): types.ActionQuery & types.InputSafe<Input> => {
  return {
    action: types.Action.TRAFFIC,
    dateStart: formatDate(input.dateStart),
    dateEnd: input.dateEnd ? formatDate(input.dateEnd) : undefined,
    merchantId: input.merchantId?.toString(),
    lockDate: input.lockDate ? formatDate(input.lockDate) : undefined,
    paidDate: input.paidDate ? formatDate(input.paidDate) : undefined,
    sortCol: input.sortCol,
    sortDir: input.sortDir
  }
}