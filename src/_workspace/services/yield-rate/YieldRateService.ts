import axiosRequest from '@/libs/axios/axiosRequest'
import AxiosRequestForExport from '@/_workspace/axios/sct-export/axiosRequest_ForExport'
import YieldRateAPI from '@/_workspace/api/yield-rate/YieldRateAPI'

export default class YieldRateServices {
  static search(params: any) {
    return axiosRequest({
      url: `${YieldRateAPI.API_ROOT_URL}/search`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }
  static create(property: any) {
    return axiosRequest({
      url: `${YieldRateAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return axiosRequest({
      url: `${YieldRateAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: any) {
    return axiosRequest({
      url: `${YieldRateAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }

  static getBomByLikeProductTypeIdAndCondition(params: any) {
    return axiosRequest({
      url: `${YieldRateAPI.API_ROOT_URL}/getBomByLikeProductTypeIdAndCondition`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }

  static createYieldRateExport(property: any) {
    return AxiosRequestForExport({
      url: `${YieldRateAPI.API_ROOT_URL}/yield-rate-export`,
      data: JSON.stringify(property),
      method: 'POST',
      responseType: 'blob'
    })
  }

  static createYieldRateImport(property: any) {
    return AxiosRequestForExport({
      url: `${YieldRateAPI.API_ROOT_URL}/yield-rate-import`,
      data: property,
      method: 'POST'
    })
  }
}
