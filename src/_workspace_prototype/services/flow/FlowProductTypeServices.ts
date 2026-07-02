import FlowProductTypeAPI from '@/_workspace/api/flow/FlowProductTypeAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class FlowProductTypeServices {
  static searchFlowProductTypeByFlowId(params: any) {
    return axiosRequest({
      url: `${FlowProductTypeAPI.API_ROOT_URL}/searchFlowProductTypeByFlowId`,
      params,
      method: 'get'
    })
  }
}
