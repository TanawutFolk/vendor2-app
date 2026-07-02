import YieldRateGoStraightRateTotalForSctAPI from '@/_workspace/api/yield-rate/YieldRateGoStraightRateTotalForSctAPI'
import { YieldRateGoStraightRateTotalForSctI } from '@/_workspace/types/yield-rate/YieldRateGoStraightRateTotalForSctType'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'
import { GenericAbortSignal } from 'axios'

export default class YieldRateGoStraightRateTotalForSctServices {
  static search(dataItem: { FISCAL_YEAR: number; PRODUCT_TYPE_ID: number }) {
    return axiosRequest({
      url: `${YieldRateGoStraightRateTotalForSctAPI.API_ROOT_URL}/search`,
      data: dataItem,
      method: 'POST'
    })
  }

  static getByProductTypeIdAndFiscalYear_MasterDataLatest(data: {
    FISCAL_YEAR: number
    PRODUCT_TYPE_ID: number
    signal: GenericAbortSignal
  }) {
    return axiosRequest<ResultDataResponseI<YieldRateGoStraightRateTotalForSctI>>({
      url: `${YieldRateGoStraightRateTotalForSctAPI.API_ROOT_URL}/getByProductTypeIdAndFiscalYear_MasterDataLatest`,
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
    return axiosRequest<ResultDataResponseI<YieldRateGoStraightRateTotalForSctI>>({
      url: `${YieldRateGoStraightRateTotalForSctAPI.API_ROOT_URL}/getByProductTypeIdAndFiscalYearAndRevisionNo`,
      data,
      method: 'POST',
      signal: data.signal
    })
  }
}
