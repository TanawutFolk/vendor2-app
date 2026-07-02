import ProductionPurposeAPI from '@/_workspace/api/production-purpose/ProductionPurposeAPI'

import AxiosRequest from '@/libs/axios/axiosRequest'

export default class ProductionPurposeServices {
  static create(ProductionPurposeProperty: string) {
    return AxiosRequest({
      url: `${ProductionPurposeAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: ProductionPurposeProperty
    })
  }

  static search(params: string) {
    return AxiosRequest({
      url: `${ProductionPurposeAPI.API_ROOT_URL}/search`,
      params,
      method: 'GET'
    })
  }

  static get(ProductionPurposeProperty: string) {
    return AxiosRequest({
      url: `${ProductionPurposeAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(ProductionPurposeProperty) },
      method: 'GET'
    })
  }

  static update(ProductionPurposeProperty: string) {
    return AxiosRequest({
      url: `${ProductionPurposeAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: ProductionPurposeProperty
    })
  }

  static delete(ProductionPurposeProperty: string) {
    return AxiosRequest({
      url: `${ProductionPurposeAPI.API_ROOT_URL}/delete`,
      data: ProductionPurposeProperty,
      method: 'DELETE'
    })
  }

  static getByLikeProductionPurposeNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductionPurposeAPI.API_ROOT_URL}/getByLikeProductionPurposeNameAndInuse`,
      params,
      method: 'GET'
    })
  }
}
