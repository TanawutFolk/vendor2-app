import SctCompareAPI from '@/_workspace/api/standard-cost/SctCompareAPI'
import { SctCompareI } from '@/_workspace/types/sct/SctCompareI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class SctCompareServices {
  static getBySctId(data: { SCT_ID: string }) {
    return axiosRequest<ResultDataResponseI<SctCompareI>>({
      url: `${SctCompareAPI.API_ROOT_URL}/getBySctId`,
      data,
      method: 'POST'
    })
  }
}
