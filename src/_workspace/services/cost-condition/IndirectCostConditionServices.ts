import IndirectCostConditionAPI from '@/_workspace/api/cost-condition/IndirectCostConditionAPI'
import { ReturnApiSearchIndirectCostConditionI } from '@/_workspace/pages/cost-condition/indirect-cost-condition/IndirectCostConditionTableData'
import { IndirectCostConditionI } from '@/_workspace/types/cost-condition/IndirectCostCondition'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'
import { GenericAbortSignal } from 'axios'

export default class IndirectCostConditionServices {
  static search(params: ReturnApiSearchIndirectCostConditionI) {
    return axiosRequest({
      url: `${IndirectCostConditionAPI.API_ROOT_URL}/search`,
      data: params,
      method: 'POST'
    })
  }

  static create(property: object) {
    return axiosRequest({
      url: `${IndirectCostConditionAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(data: {
    FISCAL_YEAR: number
    PRODUCT_MAIN_ID: number
    ITEM_CATEGORY_ID: number
    signal?: GenericAbortSignal
  }) {
    return axiosRequest<ResultDataResponseI<IndirectCostConditionI>>({
      url: `${IndirectCostConditionAPI.API_ROOT_URL}/getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest`,
      data,
      method: 'POST',
      signal: data?.signal
    })
  }

  static getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo(data: {
    FISCAL_YEAR: number
    PRODUCT_MAIN_ID: number
    ITEM_CATEGORY_ID: number
    VERSION: number
    signal?: GenericAbortSignal
  }) {
    return axiosRequest<ResultDataResponseI<IndirectCostConditionI>>({
      url: `${IndirectCostConditionAPI.API_ROOT_URL}/getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo`,
      data,
      method: 'POST',
      signal: data?.signal
    })
  }
}
