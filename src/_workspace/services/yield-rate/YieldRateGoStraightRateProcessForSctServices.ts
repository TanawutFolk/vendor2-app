import YieldRateGoStraightRateProcessForSctAPI from '@/_workspace/api/yield-rate/YieldRateGoStraightRateProcessForSctAPI'
import { YieldRateGoStraightRateProcessForSctI } from '@/_workspace/types/yield-rate/YieldRateGoStraightRateProcessForSct'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'
import { GenericAbortSignal } from 'axios'

export default class YieldRateGoStraightRateProcessForSctServices {
  static getByProductTypeIdAndFiscalYear_MasterDataLatest(data: {
    FISCAL_YEAR: number
    PRODUCT_TYPE_ID: number
    signal: GenericAbortSignal
  }) {
    return axiosRequest<ResultDataResponseI<YieldRateGoStraightRateProcessForSctI>>({
      url: `${YieldRateGoStraightRateProcessForSctAPI.API_ROOT_URL}/getByProductTypeIdAndFiscalYear_MasterDataLatest`,
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
    return axiosRequest<ResultDataResponseI<YieldRateGoStraightRateProcessForSctI>>({
      url: `${YieldRateGoStraightRateProcessForSctAPI.API_ROOT_URL}/getByProductTypeIdAndFiscalYearAndRevisionNo`,
      data,
      method: 'POST',
      signal: data.signal
    })
  }
}
