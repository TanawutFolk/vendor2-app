import ColorAPI from '@/_workspace/api/item-master/item-property/ColorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

import { ReturnApiSearchColorI } from '@/app/[lang]/(_workspace)/item-master/item-property/color/ColorTableData'

export default class ColorServices {
  static getByLikeColorNameAndInuse(params: any) {
    return axiosRequest({
      url: `${ColorAPI.API_ROOT_URL}/getByLikeColorNameAndInuse`,
      params,
      method: 'get'
    })
  }

  static search(property: ReturnApiSearchColorI) {
    return axiosRequest({
      url: `${ColorAPI.API_ROOT_URL}/search`,
      data: property,
      method: 'POST'
    })
  }

  static create(property: any) {
    return axiosRequest({
      url: `${ColorAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return axiosRequest({
      url: `${ColorAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: any) {
    return axiosRequest({
      url: `${ColorAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }
}
