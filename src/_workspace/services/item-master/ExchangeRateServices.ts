import ExchangeRateAPI from '@/_workspace/api/cost-condition/ExchangeRateAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

import { ReturnApiSearchExchangeRateI } from '@/app/[lang]/(_workspace)/cost-condition/exchange-rate/ExchangeRateTableData'

export default class ExchangeRateServices {
  static getCurrency(params: any) {
    return axiosRequest({
      url: `${ExchangeRateAPI.API_ROOT_URL}/getCurrency`,
      params,
      method: 'get'
    })
  }

  static search(params: ReturnApiSearchExchangeRateI) {
    return axiosRequest({
      url: `${ExchangeRateAPI.API_ROOT_URL}/search`,
      params,
      method: 'get'
    })
  }

  static create(property: any) {
    return axiosRequest({
      url: `${ExchangeRateAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }
}
