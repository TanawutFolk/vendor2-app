import DirectCostConditionAPI from '@/_workspace/api/cost-condition/DirectCostConditionAPI'
import { DirectCostConditionI } from '@/_workspace/types/cost-condition/DirectCostCondition'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'
import { GenericAbortSignal } from 'axios'

export default class DirectCostConditionServices {
  static search(params: object) {
    return axiosRequest({
      url: `${DirectCostConditionAPI.API_ROOT_URL}/search`,
      data: params,
      method: 'POST'
    })
  }

  static create(property: object) {
    return axiosRequest({
      url: `${DirectCostConditionAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(data: {
    FISCAL_YEAR: number
    PRODUCT_MAIN_ID: number
    ITEM_CATEGORY_ID: number
    signal: GenericAbortSignal
  }) {
    return axiosRequest<ResultDataResponseI<DirectCostConditionI>>({
      url: `${DirectCostConditionAPI.API_ROOT_URL}/getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest`,
      data,
      method: 'POST',
      signal: data.signal
    })
  }

  static getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(data: {
    FISCAL_YEAR: number
    PRODUCT_MAIN_ID: number
    ITEM_CATEGORY_ID: number
    VERSION: number
    signal: GenericAbortSignal
  }) {
    return axiosRequest<ResultDataResponseI<DirectCostConditionI>>({
      url: `${DirectCostConditionAPI.API_ROOT_URL}/getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo`,
      data,
      method: 'POST',
      signal: data.signal
    })
  }
}
