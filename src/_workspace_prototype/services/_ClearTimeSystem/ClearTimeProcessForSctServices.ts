import AxiosRequest from '@/libs/axios/axiosRequest'

import ClearTimeProcessForSctAPI from '@/_workspace/api/_ClearTimeSystem/ClearTimeProcessForSctAPI'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'
import { ClearTimeForSctProcessI } from '@/_workspace/types/_ClearTimeSystem/ClearTimeForSctProcess'
import { GenericAbortSignal } from 'axios'

export default class ClearTimeProcessForSctServices {
  // static search(params: object) {
  //   return AxiosRequest({
  //     url: `${ClearTimeAPI.API_ROOT_URL}/search`,
  //     data: JSON.stringify(params),
  //     method: 'POST'
  //   })
  // }
  // static create(property: object) {
  //   return AxiosRequest({
  //     url: `${ClearTimeAPI.API_ROOT_URL}/create`,
  //     data: property,
  //     method: 'POST'
  //   })
  // }

  // static update(property: object) {
  //   return AxiosRequest({
  //     url: `${ClearTimeAPI.API_ROOT_URL}/update`,
  //     data: property,
  //     method: 'PATCH'
  //   })
  // }

  // static Delete(property: object) {
  //   return AxiosRequest({
  //     url: `${ClearTimeAPI.API_ROOT_URL}/delete`,
  //     data: property,
  //     method: 'DELETE'
  //   })
  // }

  // static getBomByLikeProductTypeIdAndCondition(params: object) {
  //   return AxiosRequest({
  //     url: `${ClearTimeAPI.API_ROOT_URL}/getBomByLikeProductTypeIdAndCondition`,
  //     data: JSON.stringify(params),
  //     method: 'POST'
  //   })
  // }

  static getByProductTypeIdAndFiscalYear_MasterDataLatest(data: {
    FISCAL_YEAR: number
    PRODUCT_TYPE_ID: number
    signal: GenericAbortSignal
  }) {
    return AxiosRequest<ResultDataResponseI<ClearTimeForSctProcessI>>({
      url: `${ClearTimeProcessForSctAPI.API_ROOT_URL}/getByProductTypeIdAndFiscalYear_MasterDataLatest`,
      data,
      method: 'POST',
      signal: data.signal
    })
  }

  static getByProductTypeIdAndFiscalYearAndRevisionNo(data: {
    FISCAL_YEAR: number
    PRODUCT_TYPE_ID: number
    REVISION_NO: number
    signal: GenericAbortSignal
  }) {
    return AxiosRequest<ResultDataResponseI<ClearTimeForSctProcessI>>({
      url: `${ClearTimeProcessForSctAPI.API_ROOT_URL}/getByProductTypeIdAndFiscalYearAndRevisionNo`,
      data,
      method: 'POST',
      signal: data.signal
    })
  }
}
