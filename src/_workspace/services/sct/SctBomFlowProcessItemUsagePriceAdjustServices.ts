import SctBomFlowProcessItemUsagePriceAdjustAPI from '@/_workspace/api/standard-cost/SctBomFlowProcessItemUsagePriceAdjustAPI'
import { SctBomFlowProcessItemUsagePriceAdjustI } from '@/_workspace/types/sct/SctBomFlowProcessItemUsagePriceAdjustI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class SctBomFlowProcessItemUsagePriceAdjustServices {
  static getBySctId(data: { SCT_ID: string }) {
    return axiosRequest<ResultDataResponseI<SctBomFlowProcessItemUsagePriceAdjustI>>({
      url: `${SctBomFlowProcessItemUsagePriceAdjustAPI.API_ROOT_URL}/getBySctId`,
      data,
      method: 'POST'
    })
  }
}
