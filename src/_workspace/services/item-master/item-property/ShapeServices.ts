import ShapeAPI from '@/_workspace/api/item-master/item-property/ShapeAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

import { ReturnApiSearchShapeI } from '@/app/[lang]/(_workspace)/item-master/item-property/shape/ShapeTableData'

export default class ShapeServices {
  static getByLikeShapeNameAndInuse(params: any) {
    return axiosRequest({
      url: `${ShapeAPI.API_ROOT_URL}/getByLikeShapeNameAndInuse`,
      params,
      method: 'get'
    })
  }

  static search(property: ReturnApiSearchShapeI) {
    return axiosRequest({
      url: `${ShapeAPI.API_ROOT_URL}/search`,
      data: property,
      method: 'POST'
    })
  }

  static create(property: any) {
    return axiosRequest({
      url: `${ShapeAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return axiosRequest({
      url: `${ShapeAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: any) {
    return axiosRequest({
      url: `${ShapeAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }
}
