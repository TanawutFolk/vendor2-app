import CurrencyServices from '@/_workspace/services/cost-condition/CurrencyServices'
import { CurrencyI } from '@/_workspace/types/cost-condition/ExchangeRate'

export interface CurrencyOption extends CurrencyI {
  CURRENCY_VALUE?: string
  CURRENCY_IMAGE: string
  EXCHANGE_RATE_VALUE?: number
}

const fetchCurrencySymbolByCurrencySymbolAndInuse = (currencySymbol: string) =>
  new Promise<CurrencyOption[]>(resolve => {
    const param = {
      CURRENCY_SYMBOL: currencySymbol,
      INUSE: 1
    }

    CurrencyServices.getByInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchCurrencySymbolByCurrencySymbolAndInuse }
