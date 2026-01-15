export interface ExchangeRateI {
  CURRENCY_ID: number
  CURRENCY_NAME: string
  CURRENCY_SYMBOL: string
  CURRENCY_AMOUNT: number
  FROM_CURRENCY: string
  FROM_AMOUNT: number
  FROM_CURRENCY_IMAGE: string
  TO_CURRENCY_IMAGE: string
  FISCAL_YEAR: number
  VERSION: number
  MODIFIED_DATE: string
  UPDATE_BY: string
}

export interface CurrencyI {
  CURRENCY_ID: number
  CURRENCY_SYMBOL: string
  CURRENCY_NAME: string
}
