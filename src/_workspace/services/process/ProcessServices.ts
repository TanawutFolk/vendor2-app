import ProcessAPI from '@/_workspace/api/process/ProcessAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

import { ReturnApiSearchProcessI } from '@/app/[lang]/(_workspace)/process/ProcessTableData'

export default class ProcessServices {
  static search(params: ReturnApiSearchProcessI) {
    return axiosRequest({
      url: `${ProcessAPI.API_ROOT_URL}/search`,
      params,
      method: 'get'
    })
  }

  static create(property: any) {
    return axiosRequest({
      url: `${ProcessAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return axiosRequest({
      url: `${ProcessAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: any) {
    return axiosRequest({
      url: `${ProcessAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }
}
