import ProductSpecificationTypeAPI from '@/_workspace/api/specification-setting/ProductSpecificationTypeAPI '
import axiosRequest from '@/libs/axios/axiosRequest'

export default class ProductSpecificationTypeServices {
  // static create(ProductMainProperty: string) {
  //   return axiosRequest({
  //     url: `${SpecificationSettingAPI.API_ROOT_URL}/create`,
  //     method: 'POST',
  //     data: ProductMainProperty
  //   })
  // }

  // static search(params: string) {
  //   return axiosRequest({
  //     url: `${SpecificationSettingAPI.API_ROOT_URL}/search`,
  //     data: params,
  //     method: 'POST'
  //   })
  // }

  // static update(ProductMainProperty: string) {
  //   return axiosRequest({
  //     url: `${SpecificationSettingAPI.API_ROOT_URL}/update`,
  //     method: 'PATCH',
  //     data: ProductMainProperty
  //   })
  // }

  // static delete(ProductMainProperty: string) {
  //   return axiosRequest({
  //     url: `${SpecificationSettingAPI.API_ROOT_URL}/delete`,
  //     data: ProductMainProperty,
  //     method: 'DELETE'
  //   })
  // }

  static getByLikeProductSpecificationTypeAndInuse(params: object) {
    return axiosRequest({
      url: `${ProductSpecificationTypeAPI.API_ROOT_URL}/getByLikeProductSpecificationTypeAndInuse`,
      params,
      method: 'GET'
    })
  }

  // static getByLikeProductMainNameAndProductCategoryIdAndInuse(params: object) {
  //   return axiosRequest({
  //     url: `${SpecificationSettingAPI.API_ROOT_URL}/getByLikeProductMainNameAndProductCategoryIdAndInuse`,
  //     params,
  //     method: 'GET'
  //   })
  // }
}
