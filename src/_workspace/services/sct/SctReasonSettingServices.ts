import StandardCostAPI from '@/_workspace/api/standard-cost/StandardCostAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class SctReasonSettingServices {
  static getByLikeSctReasonSettingNameAndInuse(property: object) {
    return axiosRequest({
      url: `${StandardCostAPI.API_ROOT_URL}/getByLikeSctReasonSettingNameAndInuse`,
      data: property,
      method: 'POST'
    })
  }
}
