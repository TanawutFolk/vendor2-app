import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'
import type { CurrencyI } from '@/_workspace/types/_request-register/RequestRegisterTypes'

export interface CurrencyOption extends CurrencyI {}

const fetchCurrencies = (inputValue: string) =>
  new Promise<CurrencyOption[]>(resolve => {
    const param = {
      CURRENCY_NAME: inputValue
    }

    RegisterRequestServices.getCurrencies(param)
      .then(responseJson => {
        resolve(responseJson.data.Status ? responseJson.data.ResultOnDb : [])
      })
      .catch(error => {
        console.log(error)
        resolve([])
      })
  })

export { fetchCurrencies }
