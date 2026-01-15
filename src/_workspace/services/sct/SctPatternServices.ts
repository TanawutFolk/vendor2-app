import SctPatternAPI from '@/_workspace/api/standard-cost/SctPatternAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class SctPatternServices {
  static getByLikePatternNameAndInuse(SubProcessProperty: { SCT_PATTERN_NAME: string; INUSE: number | '' }) {
    return axiosRequest({
      url: `${SctPatternAPI.API_ROOT_URL}/getByLikePatternNameAndInuse`,
      data: SubProcessProperty,
      method: 'POST'
    })
  }
}
