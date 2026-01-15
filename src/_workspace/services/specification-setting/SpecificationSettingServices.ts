import SpecificationSettingAPI from '@/_workspace/api/specification-setting/SpecificationSettingAPI '
import { ReturnApiSearchSpecificationI } from '@/app/[lang]/(_workspace)/specification-setting/SpecificationSettingTableData'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class SpecificationSettingServices {
  static create(ProductMainProperty: string) {
    return axiosRequest({
      url: `${SpecificationSettingAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: ProductMainProperty
    })
  }

  static searchForCopy() {
    return axiosRequest({
      url: `${SpecificationSettingAPI.API_ROOT_URL}/getBySpecificationSettingForCopy`,
      // data: params,
      method: 'POST'
    })
  }

  // static search(params: string) {
  //   return axiosRequest({
  //     url: `${SpecificationSettingAPI.API_ROOT_URL}/search`,
  //     params: { data: params },
  //     method: 'GET'
  //   })
  // }
  // static search(params: ReturnApiSearchSpecificationI) {
  //   return axiosRequest({
  //     url: `${SpecificationSettingAPI.API_ROOT_URL}/search`,
  //     // data: params,
  //     params,
  //     method: 'GET'
  //   })
  // }

  static search(params: Object) {
    return axiosRequest({
      url: `${SpecificationSettingAPI.API_ROOT_URL}/search`,
      // data: params,
      data: params,
      method: 'POST'
    })
  }

  static update(ProductMainProperty: string) {
    return axiosRequest({
      url: `${SpecificationSettingAPI.API_ROOT_URL}/update`,
      method: 'POST',
      data: ProductMainProperty
    })
  }

  static delete(ProductMainProperty: string) {
    return axiosRequest({
      url: `${SpecificationSettingAPI.API_ROOT_URL}/delete`,
      data: ProductMainProperty,
      method: 'DELETE'
    })
  }

  static getByLikeSpecificationSettingAndInuse(params: object) {
    return axiosRequest({
      url: `${SpecificationSettingAPI.API_ROOT_URL}/getByLikeSpecificationSettingAndInuse`,
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
