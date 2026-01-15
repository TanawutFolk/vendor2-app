import PurchaseModuleAPI from '@/_workspace/api/purchase-module/PurchaseModuleAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class PurchaseModuleServices {
  static getByLikePurchaseModuleNameAndInuse(params: object) {
    return axiosRequest({
      url: `${PurchaseModuleAPI.API_ROOT_URL}/getByLikePurchaseModuleNameAndInuse`,
      params,
      method: 'GET'
    })
  }
}
