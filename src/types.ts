export type CCY = 'EUR' | 'CHF' | 'USD' | 'GBP'

export type Transaction = {
  value: number,
  ccy: CCY,
  rate: number,
  date: Date
}

export type RawTransaction = {
  value: number,
  ccy: CCY,
  rate: number,
  date: string
}