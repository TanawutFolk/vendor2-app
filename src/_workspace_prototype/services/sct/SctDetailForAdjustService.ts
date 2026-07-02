import SctDetailForAdjustAPI from '@/_workspace/api/standard-cost/SctDetailForAdjustAPI'
import { SctDetailForAdjustI } from '@/_workspace/types/sct/SctDetailForAdjustI'
import AxiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class SctDetailForAdjustService {
  static getBySctId(dataItem: { SCT_ID: string }) {
    return AxiosRequest<ResultDataResponseI<SctDetailForAdjustI>>({
      url: `${SctDetailForAdjustAPI.API_ROOT_URL}/getBySctId`,
      data: dataItem,
      method: 'POST'
    })
  }
}
