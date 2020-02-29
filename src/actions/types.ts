export enum Action {
  TRAFFIC = 'traffic',
  ACTIVITY = 'activity',
  ACTIVITY_SUMMARY = 'activitySummary',
  MERCHANT_DATA_FEEDS = 'merchantDataFeeds',
  INVALID_LINKS = 'invalidLinks',
  MERCHANT_SEARCH = 'merchantSearch'
}

export type ActionQuery = {
  action: Action
}

export type SortDir = 'asc' | 'desc'

export type InputSafe<T> = {
  [P in keyof T]: string
}