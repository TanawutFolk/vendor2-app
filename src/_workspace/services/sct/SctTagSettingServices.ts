import StandardCostAPI from '@/_workspace/api/standard-cost/StandardCostAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class SctTagSettingServices {
  static getByLikeSctTagSettingNameAndInuse(property: object) {
    return axiosRequest({
      url: `${StandardCostAPI.API_ROOT_URL}/getByLikeSctTagSettingNameAndInuse`,
      data: property,
      method: 'POST'
    })
  }
}
