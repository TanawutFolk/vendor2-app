import LocProjectAPI from '../api/LocAPI'
import AxiosRequest from '@/libs/axios/axiosRequest'

export default class LocProjectServices {
  static getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType(params: object) {
    return AxiosRequest({
      url: `${LocProjectAPI.API_ROOT_URL}/getLocTypeByLikeLocTypeNameAndInuseOnlyProductionType`,
      params,
      method: 'GET'
    })
  }
}
