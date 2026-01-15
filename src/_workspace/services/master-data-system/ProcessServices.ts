import ProcessAPI from '@/_workspace/api/master-data-system/ProcessAPI'

// import AxiosRequest from '@/libs/axios/axiosRequest'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class ProcessServices {
  static getByLikeProcessName(params: object) {
    return axiosRequest({
      url: `${ProcessAPI.API_ROOT_URL}/getByLikeProcessName`,
      // params: { data: params },
      params: { data: JSON.stringify(params) },

      method: 'GET'
    })
  }

  static getByLikeProcessAndInuse(params: object) {
    return axiosRequest({
      url: `${ProcessAPI.API_ROOT_URL}/getByLikeProcessNameAndInuse`,
      // params: { data: params },
      // params: { data: JSON.stringify(params) },
      data: JSON.stringify(params),
      method: 'POST'
    })
  }
  static getByLikeProcessNameAndProductMainIdAndInuse(params: object) {
    return axiosRequest({
      url: `${ProcessAPI.API_ROOT_URL}/getByLikeProcessNameAndProductMainIdAndInuse`,
      // params: { data: params },
      params,

      method: 'GET'
    })
  }
}
