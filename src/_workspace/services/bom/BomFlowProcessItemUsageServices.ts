import BomFlowProcessItemUsageAPI from '@/_workspace/api/bom/BomFlowProcessItemUsageAPI'
import { BomFlowProcessItemUsageI } from '@/_workspace/types/bom/BomFlowProcessItemUsage'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class BomFlowProcessItemUsageServices {
  static getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId(data: {
    BOM_ID: number
    FISCAL_YEAR: number
    SCT_PATTERN_ID: number
    PRODUCT_TYPE_ID: number
  }) {
    return axiosRequest<ResultDataResponseI<BomFlowProcessItemUsageI>>({
      url: `${BomFlowProcessItemUsageAPI.API_ROOT_URL}/getByBomIdAndFiscalYearAndSctPatternIdAndProductTypeId`,
      data,
      method: 'POST'
    })
  }
}
