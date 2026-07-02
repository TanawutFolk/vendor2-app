import SctTotalCostAPI from '@/_workspace/api/standard-cost/SctTotalCostAPI'
import { SctTotalCostI } from '@/_workspace/types/sct/SctTotalCostI'
import AxiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class SctTotalCostService {
  static getBySctId(dataItem: { SCT_ID: string }) {
    return AxiosRequest<ResultDataResponseI<SctTotalCostI>>({
      url: `${SctTotalCostAPI.API_ROOT_URL}/getBySctId`,
      data: dataItem,
      method: 'POST'
    })
  }
}
