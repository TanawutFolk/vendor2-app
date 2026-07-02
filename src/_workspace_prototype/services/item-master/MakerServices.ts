import MakerAPI from '@/_workspace/api/item-master/MakerAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

import { ReturnApiSearchMakerI } from '@/app/[lang]/(_workspace)/item-master/maker/MakerTableData'

export default class ShapeServices {
  static search(property: ReturnApiSearchMakerI) {
    return axiosRequest({
      url: `${MakerAPI.API_ROOT_URL}/search`,
      data: property,
      method: 'POST'
    })
  }

  static create(property: any) {
    return axiosRequest({
      url: `${MakerAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return axiosRequest({
      url: `${MakerAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: any) {
    return axiosRequest({
      url: `${MakerAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }

  static getByLikeMakerNameAndInuse(property: any) {
    return axiosRequest({
      url: `${MakerAPI.API_ROOT_URL}/getByLikeMakerNameAndInuse`,
      params: property,
      method: 'GET'
    })
  }
}
