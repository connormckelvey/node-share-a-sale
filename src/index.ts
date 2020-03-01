import * as crypto from 'crypto'
import axios from 'axios'
import * as camelCase from 'camelcase'
import * as csv from 'csv'
import * as parse from 'csv-parse'
import * as actions from './actions'
import * as currency from 'currency.js'

export interface Config {
  affiliateId: number
  apiToken: string
  apiSecretKey: string
  apiVersion: number
}

export interface Auth {
  'x-ShareASale-Date': string
  'x-ShareASale-Authentication': string
}

export type BaseQuery = {
  affiliateId: number
  token: string
  version: number,
  format: 'csv'
}

export type Params<T> = BaseQuery & T

export class ShareASale {
  baseUrl: string
  config: Config

  constructor(config: Config) {
    this.baseUrl = 'https://shareasale.com/x.cfm'
    this.config = config
  }

  private getAuth(action: actions.Action, timestamp: string): Auth {
    const { apiToken, apiSecretKey } = this.config
    var sig = `${apiToken}:${timestamp}:${action}:${apiSecretKey}`
    var sig_hash = crypto.createHash('sha256').update(sig).digest('hex')
    return {
      'x-ShareASale-Date': timestamp,
      'x-ShareASale-Authentication': sig_hash,
    }
  }

  private getBaseQuery(): BaseQuery {
    return {
      affiliateId: this.config.affiliateId,
      token: this.config.apiToken,
      version: this.config.apiVersion,
      format: 'csv',
    }
  }

  private async parseResponse<T>(data: string, castFunc?: parse.CastingFunction): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      csv.parse(data, { 
        cast: castFunc,
        columns: (header: string[]) => header.map(col => camelCase(col))
      }, (err, d) => {
        if (err) {
          return reject(err)
        }
        resolve(d)
      })
    })
  }

  private async doRequest<I extends actions.ActionQuery, O extends {}>(args: I, castFunc?: parse.CastingFunction): Promise<O[]> {
    const params: Params<I> = {
      ...this.getBaseQuery(),
      ...args,
    }
    const res = await axios.get(this.baseUrl, {
      headers: this.getAuth(params.action, new Date().toUTCString()),
      params
    })
    return this.parseResponse<O>(res.data, castFunc)
  }

  async getTraffic(options: actions.TrafficInput) {
    const action = actions.createTrafficAction(options)
    return this.doRequest<typeof action, actions.TrafficOutput>(action, (value, context) => {
      if (context.header) {
        return value
      }

      switch(context.column) {
        case 'merchantId':
          return parseInt(value, 10)
        case 'organization':
          return value
        case 'website':
          return value
        case 'uniqueHits':
          return parseInt(value, 10)
        case 'commissions':
          return currency(value)
        case 'netSales':
          return currency(value)
        case 'numberOfVoids':
          return parseInt(value, 10)
        case 'numberOfSales':
          return parseInt(value, 10)
        case 'conversion':
          return parseFloat(value.replace('%', '')) / 100
        case 'epc':
          return currency(value)
        default:
          return value
      }
    })
  }

  async getActivity(dateStart, dateEnd) {
    return this.doRequest({
      action: actions.Action.ACTIVITY,
      dateStart,
      dateEnd,
    })
  }

  async getActivitySummary(filterSpan) {
    return this.doRequest({
      action: actions.Action.ACTIVITY_SUMMARY,
      filterSpan,
    })
  }

  async getMerchantDataFeeds() {
    return this.doRequest({
      action: actions.Action.MERCHANT_DATA_FEEDS,
    })
  }

  async getInvalidLinks() {
    return this.doRequest({
      action: actions.Action.INVALID_LINKS,
    })
  }

  async getMerchantSearch() {
    return this.doRequest({
      action: actions.Action.MERCHANT_SEARCH,
      category: 'bus',
      sortCol: 'hitcommission',
      sortDir: 'asc'
    })
  }
}
