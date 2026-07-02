import AxiosRequest from '@/libs/axios/axiosRequest'

import ProductMainAPI from '@/_workspace/api/product-group/ProductMainAPI'

export default class ProductMainServices {
  // Main Services
  static search(params: Object) {
    return AxiosRequest({
      url: `${ProductMainAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: params
    })
  }

  static create(dataItem: Record<string, any>) {
    return AxiosRequest({
      url: `${ProductMainAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: dataItem
    })
  }

  static update(dataItem: Record<string, any>) {
    return AxiosRequest({
      url: `${ProductMainAPI.API_ROOT_URL}/update`,
      method: 'POST',
      data: dataItem
    })
  }

  static delete(dataItem: Record<string, any>) {
    return AxiosRequest({
      url: `${ProductMainAPI.API_ROOT_URL}/delete`,
      method: 'POST',
      data: dataItem
    })
  }

  // Other Services
  static get(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${ProductMainAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(ProductMainProperty) },
      method: 'GET'
    })
  }

  static getProductMainByLikeProductMainNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductMainAPI.API_ROOT_URL}/getProductMainByLikeProductMainNameAndInuse`,
      params,
      method: 'GET'
    })
  }
  static getByLikeProductMainNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductMainAPI.API_ROOT_URL}/getByLikeProductMainNameAndInuse`,
      params,
      method: 'GET'
    })
  }

  static getByLikeProductMainNameAndProductCategoryIdAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductMainAPI.API_ROOT_URL}/getByLikeProductMainNameAndProductCategoryIdAndInuse`,
      data: params,
      method: 'POST'
    })
  }
}
