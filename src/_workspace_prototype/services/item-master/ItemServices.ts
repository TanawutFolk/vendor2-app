import ItemAPI from '@/_workspace/api/item-master/ItemAPI'

import axiosRequest from '@/libs/axios/axiosRequest'

export default class ItemCategoryServices {
  static search(params: any) {
    return axiosRequest({
      url: `item/search`,
      data: params,
      method: 'POST'
    })
  }

  static create(property: any) {
    return axiosRequest({
      url: `${ItemAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return axiosRequest({
      url: `${ItemAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: any) {
    return axiosRequest({
      url: `${ItemAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }

  static getByLikeItemCodeNameAndInuse(params: any) {
    return axiosRequest({
      url: `${ItemAPI.API_ROOT_URL}/getByLikeItemCodeNameAndInuse`,
      params,
      method: 'GET'
    })
  }
  static getByLikeItemCodeNameAndInuse_NotFG(params: any) {
    return axiosRequest({
      url: `${ItemAPI.API_ROOT_URL}/getByLikeItemCodeNameAndInuse_NotFG`,
      params,
      method: 'GET'
    })
  }
  static getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs(params: any) {
    return axiosRequest({
      url: `${ItemAPI.API_ROOT_URL}/getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs`,
      params,
      method: 'GET'
    })
  }

  static getByLikeItemCodeForSupportMesAndInuse(property: any) {
    return axiosRequest({
      url: `${ItemAPI.API_ROOT_URL}/getByLikeItemCodeForSupportMesAndInuse`,
      data: property,
      method: 'POST'
    })
  }
  static downloadFileForExportItem(data: any) {
    return axiosRequest({
      url: `${ItemAPI.API_ROOT_URL}/downloadFileForExportItem`,
      method: 'POST',
      data: data,
      responseType: 'blob'
    })
  }
}
