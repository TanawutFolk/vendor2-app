import AxiosRequest from '@/libs/axios/axiosRequest'

import ManufacturingItemAPI from '@/_workspace/api/manufacturing-item/ManufacturingItemAPI'

export default class ManufacturingItemServices {
  // Main Services
  static getViewItemDataByItemId(params: Object) {
    return AxiosRequest({
      url: `${ManufacturingItemAPI.API_ROOT_URL}/getViewItemDataByItemId`,
      method: 'POST',
      data: params
    })
  }

  static search(params: Object) {
    return AxiosRequest({
      url: `${ManufacturingItemAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: params
    })
  }

  static create(dataItem: Record<string, any>) {
    return AxiosRequest({
      url: `${ManufacturingItemAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: dataItem
    })
  }

  static update(dataItem: Record<string, any>) {
    return AxiosRequest({
      url: `${ManufacturingItemAPI.API_ROOT_URL}/update`,
      method: 'POST',
      data: dataItem
    })
  }

  static delete(dataItem: Record<string, any>) {
    return AxiosRequest({
      url: `${ManufacturingItemAPI.API_ROOT_URL}/delete`,
      method: 'POST',
      data: dataItem
    })
  }
  static getImageFromUrl(dataItem: object) {
    return AxiosRequest({
      url: `${ManufacturingItemAPI.API_ROOT_URL}/getImageFromUrl`,
      data: dataItem,
      method: 'POST',
      responseType: 'blob'
    })
  }

  static createItemForm(property: any) {
    return AxiosRequest({
      url: `${ManufacturingItemAPI.API_ROOT_URL}/download-item-template`,
      data: JSON.stringify(property),
      method: 'POST',
      responseType: 'blob'
    })
  }

  static createImportList(dataItem: object) {
    return AxiosRequest({
      url: `${ManufacturingItemAPI.API_ROOT_URL}/importItemList`,
      method: 'POST',
      data: dataItem
    })
  }
}
