import ProductSubAPI from '@/_workspace/api/product-group/ProductSubAPI '
import AxiosRequest from '@/libs/axios/axiosRequest'

export default class ProductSubServices {
  static create(ProductSubProperty: string) {
    return AxiosRequest({
      url: `${ProductSubAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: ProductSubProperty
    })
  }

  // static search(params: string) {
  //   return AxiosRequest({
  //     url: `${ProductSubAPI.API_ROOT_URL}/search`,
  //     params,
  //     method: 'GET'
  //   })

  static search(ProductSubProperty: string) {
    return AxiosRequest({
      url: `${ProductSubAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: ProductSubProperty
    })
  }

  static get(ProductSubProperty: string) {
    return AxiosRequest({
      url: `${ProductSubAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(ProductSubProperty) },
      method: 'GET'
    })
  }

  static update(ProductSubProperty: string) {
    return AxiosRequest({
      url: `${ProductSubAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: ProductSubProperty
    })
  }

  static delete(ProductSubProperty: string) {
    return AxiosRequest({
      url: `${ProductSubAPI.API_ROOT_URL}/delete`,
      data: ProductSubProperty,
      method: 'DELETE'
    })
  }

  static getByLikeProductSubNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductSubAPI.API_ROOT_URL}/getByLikeProductSubNameAndInuse`,
      // data: JSON.stringify(params),
      params,
      method: 'GET'
    })
  }
  static getByLikeProductSubNameAndProductMainIdAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductSubAPI.API_ROOT_URL}/getByLikeProductSubNameAndProductMainIdAndInuse`,
      params,
      // data: params,
      method: 'GET'
    })
  }
  static getByLikeProductSubNameAndProductCategoryIdAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductSubAPI.API_ROOT_URL}/getByLikeProductSubNameAndProductCategoryIdAndInuse`,
      params,
      method: 'GET'
    })
  }
}
