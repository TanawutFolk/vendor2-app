import SctStatusProgressAPI from '@/_workspace/api/standard-cost/SctStatusProgressAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class SctStatusProgressServices {
  static getByLikeSctStatusProgressNameAndInuse(dataItem: { SCT_STATUS_PROGRESS_NAME: string; INUSE: number | '' }) {
    return axiosRequest({
      url: `${SctStatusProgressAPI.API_ROOT_URL}/getByLikeSctStatusProgressNameAndInuse`,
      data: dataItem,
      method: 'POST'
    })
  }

  static getBySctStatusProgressNameAndInuse_withDisabledOption(dataItem: object) {
    return axiosRequest({
      url: `${SctStatusProgressAPI.API_ROOT_URL}/getBySctStatusProgressNameAndInuse_withDisabledOption`,
      data: dataItem,
      method: 'POST'
    })
  }
}
