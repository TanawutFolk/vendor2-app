import SctMasterDataHistoryAPI from '@/_workspace/api/standard-cost/SctMasterDataHistoryAPI'
import { SctMasterDataHistoryI } from '@/_workspace/types/sct/SctMasterDataHistoryI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class SctMasterDataHistoryServices {
  static getBySctIdAndIsFromSctCopy(data: { SCT_ID: string; IS_FROM_SCT_COPY: 0 | 1 | '' }) {
    return axiosRequest<ResultDataResponseI<SctMasterDataHistoryI>>({
      url: `${SctMasterDataHistoryAPI.API_ROOT_URL}/getBySctIdAndIsFromSctCopy`,
      data,
      method: 'POST'
    })
  }
}
