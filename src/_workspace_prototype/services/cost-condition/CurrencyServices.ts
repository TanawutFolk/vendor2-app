import axiosRequest from '@/libs/axios/axiosRequest'
import CurrencyAPI from '@/_workspace/api/cost-condition/CurrencyAPI'

export default class ExchangeRateServices {
  static getByInuse(dataItem: object) {
    return axiosRequest({
      url: `${CurrencyAPI.API_ROOT_URL}/getByInuse`,
      data: dataItem,
      method: 'post'
    })
  }
}
