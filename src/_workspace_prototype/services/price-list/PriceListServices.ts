import PriceListAPI from '@/_workspace/api/price-list/PriceListAPI'

import axiosRequest_MasterDataSystem from '@/_workspace/axios/master-data-system/axiosRequest_MasterDataSystem'
import AxiosRequestForExport from '@/_workspace/axios/sct-export/axiosRequest_ForExport'
export default class PriceListServices {
  // static search(params: ReturnApiSearchMaterialListI) {
  //   return axiosRequest({
  //     url: `${PriceListAPI.API_ROOT_URL}/search`,
  //     params,
  //     method: 'get'
  //   })
  // }
  // static searchExport(params: any) {
  //   return axiosRequest_MasterDataSystem({
  //     url: `${PriceListAPI.API_ROOT_URL}/searchExport`,
  //     params,
  //     method: 'get',
  //     responseType: 'blob'
  //   })
  // }

  static exportToFile(params: any) {
    return axiosRequest_MasterDataSystem({
      url: `${PriceListAPI.API_ROOT_URL}/exportToFile-new-template`,
      // params: { data: params },
      params: { data: JSON.stringify(params) },
      // data: params,
      // data: JSON.stringify(params),
      method: 'GET',
      responseType: 'blob'
    })
  }

  static exportToFileNewApi(params: any) {
    return AxiosRequestForExport({
      url: `${PriceListAPI.API_ROOT_URL}/exportToFile-new-template`,
      data: JSON.stringify(params),
      method: 'POST',
      responseType: 'blob'
    })
  }
}
