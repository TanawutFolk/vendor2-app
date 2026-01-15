import VendorAPI from '@/_workspace/api/item-master/VendorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

import { ReturnApiSearchVendorI } from '@/app/[lang]/(_workspace)/item-master/vendor/VendorTableData'

export default class VendorServices {
  static getItemImportType(params: { ITEM_IMPORT_TYPE_NAME: string; INUSE: number }) {
    return axiosRequest({
      url: `${VendorAPI.API_ROOT_URL}/getItemImportType`,
      params,
      method: 'get'
    })
  }

  static search(property: ReturnApiSearchVendorI) {
    return axiosRequest({
      url: `${VendorAPI.API_ROOT_URL}/search`,
      data: property,
      method: 'POST'
    })
  }

  static create(property: any) {
    return axiosRequest({
      url: `${VendorAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return axiosRequest({
      url: `${VendorAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: any) {
    return axiosRequest({
      url: `${VendorAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }

  static getByLikeVendorNameAndInuse(property: any) {
    return axiosRequest({
      url: `${VendorAPI.API_ROOT_URL}/getByLikeVendorNameAndInuse`,
      params: property,
      method: 'GET'
    })
  }
  static getByLikeVendorName(property: any) {
    return axiosRequest({
      url: `${VendorAPI.API_ROOT_URL}/getByLikeVendorName`,
      params: property,
      method: 'GET'
    })
  }

  static getByLikeVendorNameAndImportType(property: any) {
    return axiosRequest({
      url: `${VendorAPI.API_ROOT_URL}/getByLikeVendorNameAndImportType`,
      params: property,
      method: 'GET'
    })
  }
}
