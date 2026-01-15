import ExchangeRateAPI from '@/_workspace/api/cost-condition/ExchangeRateAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class ExchangeRateServices {
  static getCurrency(params: object) {
    return axiosRequest({
      url: `${ExchangeRateAPI.API_ROOT_URL}/getCurrency`,
      params,
      method: 'get'
    })
  }

  static search(params: object) {
    return axiosRequest({
      url: `${ExchangeRateAPI.API_ROOT_URL}/search`,
      data: params,
      method: 'POST'
    })
  }

  static create(property: object) {
    return axiosRequest({
      url: `${ExchangeRateAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }
}
