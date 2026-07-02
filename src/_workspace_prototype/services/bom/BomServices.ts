import axiosRequest from '@/libs/axios/axiosRequest'

import BomAPI from '@/_workspace/api/bom/BomApi'
import { ReturnApiSearchBomI } from '@/app/[lang]/(_workspace)/bill-of-material/BomTableData'

export default class BomServices {
  static getByLikeBomNameAndInuse(params: object) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/getByLikeBomNameAndInuse`,
      params,
      method: 'get'
    })
  }
  static search(params: ReturnApiSearchBomI) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/search`,
      params,
      method: 'get'
    })
  }
  static create(property: any) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static updateBomProductType(property: any) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/updateBomProductType`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: any) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }

  static searchBomDetailsByBomId(params: any) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/searchBomDetailsByBomId`,
      params,
      method: 'GET'
    })
  }
  static searchBomDetailsByBomIdAndProductTypeId(params: any) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/searchBomDetailsByBomIdAndProductTypeId`,
      params,
      method: 'GET'
    })
  }
  static getBomDetailByBomId(params: any) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/getBomDetailByBomId`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }

  static getByLikeBomCodeAndProductMainIdAndInuse(params: object) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/getByLikeBomCodeAndProductMainIdAndInuse`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }

  static getByBomNameAndProductMainIdAndInuse(params: object) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/getByBomNameAndProductMainIdAndInuse`,
      params,
      method: 'GET'
    })
  }
  static getByBomCodeAndProductMainIdAndInuse(params: object) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/getByBomCodeAndProductMainIdAndInuse`,
      params,
      method: 'GET'
    })
  }

  static getBomByLikeProductTypeIdAndCondition(params: any) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/getBomByLikeProductTypeIdAndCondition`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }
  static getBomByLikeProductTypeCodeAndCondition(params: any) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/getBomByLikeProductTypeCodeAndCondition`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }
  static getItemCodeForSupportMes(params: any) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/getItemCodeForSupportMes`,
      data: JSON.stringify(params),
      method: 'POST'
    })
  }

  static getByLikeBomCodeAndInuse(data: object) {
    return axiosRequest({
      url: `${BomAPI.API_ROOT_URL}/getByLikeBomCodeAndInuse`,
      data,
      method: 'POST'
    })
  }
}
