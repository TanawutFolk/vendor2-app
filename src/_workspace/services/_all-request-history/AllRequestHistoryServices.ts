import type { AxiosResponse } from 'axios'

import axiosRequest from '@/libs/axios/axiosRequest'
import AllRequestHistoryAPI from '@/_workspace/api/_all-request-history/AllRequestHistoryAPI'
import type { RegisterRequestResponseI } from '@/_workspace/services/_register-request/RegisterRequestServices'
import type {
  AllRequestHistoryDetail,
  AllRequestHistoryFilterOptionRow,
  AllRequestHistoryRow,
  AllRequestHistorySearchRequest
} from '@/_workspace/types/_all-request-history/AllRequestHistoryTypes'

export default class AllRequestHistoryServices {
  static search(
    data: AllRequestHistorySearchRequest
  ): Promise<AxiosResponse<RegisterRequestResponseI<AllRequestHistoryRow[]>>> {
    return axiosRequest<RegisterRequestResponseI<AllRequestHistoryRow[]>>({
      url: `${AllRequestHistoryAPI.API_ROOT_URL}/${AllRequestHistoryAPI.SEARCH}`,
      data,
      method: 'POST'
    })
  }

  static getFilterOptions(): Promise<AxiosResponse<RegisterRequestResponseI<AllRequestHistoryFilterOptionRow[]>>> {
    return axiosRequest<RegisterRequestResponseI<AllRequestHistoryFilterOptionRow[]>>({
      url: `${AllRequestHistoryAPI.API_ROOT_URL}/${AllRequestHistoryAPI.FILTER_OPTIONS}`,
      method: 'POST'
    })
  }

  static getById(requestId: number): Promise<AxiosResponse<RegisterRequestResponseI<AllRequestHistoryDetail | null>>> {
    return axiosRequest<RegisterRequestResponseI<AllRequestHistoryDetail | null>>({
      url: `${AllRequestHistoryAPI.API_ROOT_URL}/${AllRequestHistoryAPI.DETAILS}`,
      data: { REQUEST_REGISTER_VENDOR_ID: requestId },
      method: 'POST'
    })
  }
}
