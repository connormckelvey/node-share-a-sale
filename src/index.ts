import * as crypto from 'crypto'
import axios from 'axios'
import * as camelCase from 'camelcase'
import * as csv from 'csv'
import * as actions from './actions'

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

  private async parseResponse<T>(data: string): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      csv.parse(data, { 
        columns: (header: string[]) => header.map(col => camelCase(col))
      }, (err, d) => {
        if (err) {
          return reject(err)
        }
        resolve(d)
      })
    })
  }

  private async doRequest<I extends actions.ActionQuery, O extends {}>(args: I): Promise<O[]> {
    const params: Params<I> = {
      ...this.getBaseQuery(),
      ...args,
    }
    const res = await axios.get(this.baseUrl, {
      headers: this.getAuth(params.action, new Date().toUTCString()),
      params
    })
    return this.parseResponse<O>(res.data)
  }

  async getTraffic(options: actions.TrafficInput) {
    const action = actions.createTrafficAction(options)
    return this.doRequest<typeof action, actions.TrafficOutput>(action)
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
