import axiosRequest from '@/libs/axios/axiosRequest'
import AxiosRequestForExport from '@/_workspace/axios/sct-export/axiosRequest_ForExport'
import YieldAccumulationOfItemForSctAPI from '@/_workspace/api/yield-accumulation-of-item-for-sct/YieldAccumulationOfItemForSctAPI'

export default class YieldAccumulationOfItemForSctServices {
  static search(params: object) {
    return axiosRequest({
      url: `${YieldAccumulationOfItemForSctAPI.API_ROOT_URL}/search`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }
  static create(property: object) {
    return axiosRequest({
      url: `${YieldAccumulationOfItemForSctAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: object) {
    return axiosRequest({
      url: `${YieldAccumulationOfItemForSctAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: object) {
    return axiosRequest({
      url: `${YieldAccumulationOfItemForSctAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }

  static getBomByLikeProductTypeIdAndCondition(params: object) {
    return axiosRequest({
      url: `${YieldAccumulationOfItemForSctAPI.API_ROOT_URL}/getBomByLikeProductTypeIdAndCondition`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }

  static createYieldRateMaterialExport(property: object) {
    return AxiosRequestForExport({
      url: `${YieldAccumulationOfItemForSctAPI.API_ROOT_URL}/yield-rate-material-export`,
      data: JSON.stringify(property),
      method: 'POST',
      responseType: 'blob'
    })
  }

  static createYieldRateMaterialImport(property: object) {
    return AxiosRequestForExport({
      url: `${YieldAccumulationOfItemForSctAPI.API_ROOT_URL}/yield-rate-material-import`,
      data: property,
      method: 'POST'
    })
  }

  static getByFiscalYearAndProductTypeIdAndItemId_MasterDataLatest(params: {
    FISCAL_YEAR: number
    PRODUCT_TYPE_ID: number
    ITEM_ID: number
  }) {
    return axiosRequest({
      url: `${YieldAccumulationOfItemForSctAPI.API_ROOT_URL}/getByFiscalYearAndProductTypeIdAndItemId_MasterDataLatest`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }

  static getByFiscalYearAndProductTypeIdAndItemIdAndRevisionNo(params: {
    FISCAL_YEAR: number
    PRODUCT_TYPE_ID: number
    ITEM_ID: number
    REVISION_NO: number
  }) {
    return axiosRequest({
      url: `${YieldAccumulationOfItemForSctAPI.API_ROOT_URL}/getByFiscalYearAndProductTypeIdAndItemIdAndRevisionNo`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }
}
