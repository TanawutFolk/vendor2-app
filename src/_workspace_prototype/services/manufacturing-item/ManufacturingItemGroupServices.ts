import AxiosRequest from '@/libs/axios/axiosRequest'

import ManufacturingItemGroupAPI from '@/_workspace/api/manufacturing-item/ManufacturingItemGroupAPI'

export default class ManufacturingItemGroupServices {
  // Main Services
  static getViewItemDataByItemId(params: Object) {
    return AxiosRequest({
      url: `${ManufacturingItemGroupAPI.API_ROOT_URL}/getViewItemDataByItemId`,
      method: 'POST',
      data: params
    })
  }

  static search(params: Object) {
    return AxiosRequest({
      url: `${ManufacturingItemGroupAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: params
    })
  }

  static create(dataItem: Record<string, any>) {
    return AxiosRequest({
      url: `${ManufacturingItemGroupAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: dataItem
    })
  }

  static update(dataItem: Record<string, any>) {
    return AxiosRequest({
      url: `${ManufacturingItemGroupAPI.API_ROOT_URL}/update`,
      method: 'POST',
      data: dataItem
    })
  }

  static delete(dataItem: Record<string, any>) {
    return AxiosRequest({
      url: `${ManufacturingItemGroupAPI.API_ROOT_URL}/delete`,
      method: 'POST',
      data: dataItem
    })
  }
}
