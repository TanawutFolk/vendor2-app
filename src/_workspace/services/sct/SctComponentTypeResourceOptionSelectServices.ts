import SctComponentTypeResourceOptionSelectAPI from '@/_workspace/api/standard-cost/SctComponentTypeResourceOptionSelectAPI'
import { SctComponentTypeResourceOptionSelectI } from '@/_workspace/types/sct/SctComponentTypeResourceOptionSelectI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class SctComponentTypeResourceOptionSelectServices {
  static getBySctId(dataItem: { SCT_ID: string }) {
    return axiosRequest<ResultDataResponseI<SctComponentTypeResourceOptionSelectI>>({
      url: `${SctComponentTypeResourceOptionSelectAPI.API_ROOT_URL}/getBySctId`,
      data: dataItem,
      method: 'POST'
    })
  }
}
