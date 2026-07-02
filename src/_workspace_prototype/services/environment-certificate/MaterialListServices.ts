import axiosRequest from '@/libs/axios/axiosRequest'
import MaterialListAPI from '@/_workspace/api/environment-certificate/MaterialListAPI'

import { ReturnApiSearchMaterialListI } from '@/app/[lang]/(_workspace)/environment-certification/material-list/MaterialListTableData'

export default class MaterialListServices {
  static search(params: ReturnApiSearchMaterialListI) {
    return axiosRequest({
      url: `${MaterialListAPI.API_ROOT_URL}/search`,
      params,
      method: 'get'
    })
  }
  static searchExport(params: ReturnApiSearchMaterialListI) {
    return axiosRequest({
      url: `${MaterialListAPI.API_ROOT_URL}/searchExport`,
      params,
      method: 'get',
      responseType: 'blob'
    })
  }
}
