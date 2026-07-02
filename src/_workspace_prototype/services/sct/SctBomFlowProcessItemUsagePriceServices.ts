import SctBomFlowProcessItemUsagePriceAPI from '@/_workspace/api/standard-cost/SctBomFlowProcessItemUsagePriceAPI'
import { SctBomFlowProcessItemUsagePriceI } from '@/_workspace/types/sct/SctBomFlowProcessItemUsagePriceI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class SctBomFlowProcessItemUsagePriceServices {
  static getBySctId(data: { SCT_ID: string }) {
    return axiosRequest<ResultDataResponseI<SctBomFlowProcessItemUsagePriceI>>({
      url: `${SctBomFlowProcessItemUsagePriceAPI.API_ROOT_URL}/getBySctId`,
      data,
      method: 'POST'
    })
  }
}
