import AxiosRequest from '@/libs/axios/axiosRequest'
import ClearTimeTotalForSctAPI from '@/_workspace/api/_ClearTimeSystem/ClearTimeTotalForSctAPI'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'
import { ClearTimeTotalForSctI } from '@/_workspace/types/_ClearTimeSystem/ClearTimeTotalForSctType'
import { GenericAbortSignal } from 'axios'

export default class ClearTimeTotalForSctServices {
  static search(dataItem: { FISCAL_YEAR: number; PRODUCT_TYPE_ID: number }) {
    return AxiosRequest({
      url: `${ClearTimeTotalForSctAPI.API_ROOT_URL}/search`,
      data: dataItem,
      method: 'POST'
    })
  }

  static getByProductTypeIdAndFiscalYear_MasterDataLatest(data: {
    FISCAL_YEAR: number
    PRODUCT_TYPE_ID: number
    signal: GenericAbortSignal
  }) {
    return AxiosRequest<ResultDataResponseI<ClearTimeTotalForSctI>>({
      url: `${ClearTimeTotalForSctAPI.API_ROOT_URL}/getByProductTypeIdAndFiscalYear_MasterDataLatest`,
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
    return AxiosRequest<ResultDataResponseI<ClearTimeTotalForSctI>>({
      url: `${ClearTimeTotalForSctAPI.API_ROOT_URL}/getByProductTypeIdAndFiscalYearAndRevisionNo`,
      data,
      method: 'POST',
      signal: data.signal
    })
  }
}
