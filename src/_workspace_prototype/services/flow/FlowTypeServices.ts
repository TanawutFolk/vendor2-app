import FlowTypeAPI from '@/_workspace/api/flow/FlowTypeAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

import { ReturnApiSearchFlowTypeI } from '@/app/[lang]/(_workspace)/flow/flow-type/FlowTypeTableData'

export default class FlowTypeServices {
  static search(params: ReturnApiSearchFlowTypeI) {
    return axiosRequest({
      url: `${FlowTypeAPI.API_ROOT_URL}/search`,
      params,
      method: 'get'
    })
  }

  static create(property: any) {
    return axiosRequest({
      url: `${FlowTypeAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return axiosRequest({
      url: `${FlowTypeAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: any) {
    return axiosRequest({
      url: `${FlowTypeAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }
}
