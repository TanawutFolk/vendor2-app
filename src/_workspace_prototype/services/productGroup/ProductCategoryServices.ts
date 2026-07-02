import ProductCategoryAPI from '@/_workspace/api/product-group/ProductCategoryAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class ProductCategoryServices {
  static create(ProductCategoryProperty: Object) {
    return axiosRequest({
      url: `${ProductCategoryAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: ProductCategoryProperty
    })
  }

  // static search(params: string) {
  //   console.log(params)

  //   return axiosRequest({
  //     url: `${ProductCategoryAPI.API_ROOT_URL}/search`,
  //     params,
  //     method: 'GET'
  //   })
  // }

  // static search(ProductCategoryProperty: string) {
  //   return axiosRequest({
  //     url: `${ProductCategoryAPI.API_ROOT_URL}/search`,
  //     method: 'POST',
  //     data: ProductCategoryProperty
  //   })
  // }

  // Main Services
  static search(params: Object) {
    return axiosRequest({
      url: `${ProductCategoryAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: params
    })
  }

  // static search(params: Object) {
  //   return axiosRequest({
  //     url: `${ProductCategoryAPI.API_ROOT_URL}/search`,
  //     // data: params,
  //     data: params,
  //     method: 'POST'
  //   })
  // }

  static get(ProductCategoryProperty: string) {
    return axiosRequest({
      url: `${ProductCategoryAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(ProductCategoryProperty) },
      method: 'GET'
    })
  }

  static update(ProductCategoryProperty: string) {
    return axiosRequest({
      url: `${ProductCategoryAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: ProductCategoryProperty
    })
  }

  static delete(ProductCategoryProperty: string) {
    return axiosRequest({
      url: `${ProductCategoryAPI.API_ROOT_URL}/delete`,
      data: ProductCategoryProperty,
      method: 'DELETE'
    })
  }

  static getByLikeProductMainNameAndInuse(params: object) {
    return axiosRequest({
      url: `${ProductCategoryAPI.API_ROOT_URL}/getByLikeProductMainNameAndInuse`,
      params: { data: JSON.stringify(params) },
      method: 'GET'
    })
  }
  static getByLikeProductCategoryNameAndInuse(params: object) {
    return axiosRequest({
      url: `${ProductCategoryAPI.API_ROOT_URL}/getByLikeProductCategoryNameAndInuse`,
      params,
      method: 'GET'
    })
  }
}
