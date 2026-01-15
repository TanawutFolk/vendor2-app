import FlowProcessAPI from '@/_workspace/api/flow/FlowProcessAPI'
import FlowAPI from '@/_workspace/api/flow/FlowAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { FlowProcessI } from '@/_workspace/types/flow/FlowProcess'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class FlowProcessServices {
  static search(params: object) {
    return axiosRequest({
      url: `${FlowAPI.API_ROOT_URL}/search`,
      params,
      method: 'get'
    })
  }

  static searchProcessByFlowProcessId(params: object) {
    return axiosRequest({
      url: `${FlowProcessAPI.API_ROOT_URL}/searchProcessByFlowProcessId`,
      params,
      method: 'get'
    })
  }

  static create(property: object) {
    return axiosRequest({
      url: `${FlowProcessAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: object) {
    return axiosRequest({
      url: `${FlowProcessAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: object) {
    return axiosRequest({
      url: `${FlowProcessAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }

  static getByLikeFlowNameAndInuse(params: object) {
    return axiosRequest({
      url: `${FlowProcessAPI.API_ROOT_URL}/getByLikeFlowNameAndInuse`,
      params,
      method: 'get'
    })
  }

  static getByLikeFlowNameAndProductMainIdAndInuse(params: object) {
    return axiosRequest({
      url: `${FlowProcessAPI.API_ROOT_URL}/getByFlowNameAndProductMainIdAndInuse`,
      params,
      method: 'GET'
    })
  }

  static getByFlowId(data: { FLOW_ID: number }) {
    return axiosRequest<ResultDataResponseI<FlowProcessI>>({
      url: `${FlowProcessAPI.API_ROOT_URL}/getByFlowId`,
      data,
      method: 'POST'
    })
  }

  static getByLikeFlowCodeAndInuse(data: object) {
    return axiosRequest({
      url: `${FlowAPI.API_ROOT_URL}/getByLikeFlowCodeAndInuse`,
      data,
      method: 'POST'
    })
  }
}
