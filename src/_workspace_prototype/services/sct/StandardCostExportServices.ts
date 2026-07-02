import StandardCostExportAPI from '@/_workspace/api/standard-cost/StandardCostExportAPI'
import AxiosRequest from '@/libs/axios/axiosRequest'

import AxiosRequestForExport from '@/_workspace/axios/sct-export/axiosRequest_ForExport'

export default class StandardCostExportServices {
  static getByLikeSctPatternName(property: any) {
    return AxiosRequest({
      url: `${StandardCostExportAPI.API_ROOT_URL}/getByLikeSctPatternName`,
      data: property,
      method: 'POST'
    })
  }
  static searchSctExport(property: any) {
    return AxiosRequest({
      url: `${StandardCostExportAPI.API_ROOT_URL}/searchSctExport`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }

  static searchSctCodeForSelection(params: any) {
    return AxiosRequest({
      url: `${StandardCostExportAPI.API_ROOT_URL}/searchSctCodeForSelection`,
      params,
      method: 'GET'
    })
  }

  static searchSctByItemCode(property: any) {
    return AxiosRequest({
      url: `${StandardCostExportAPI.API_ROOT_URL}/searchSctByItemCode`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }

  static searchSctBySctSelectedWithCondition(property: any) {
    return AxiosRequest({
      url: `${StandardCostExportAPI.API_ROOT_URL}/searchSctBySctSelectedWithCondition`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }

  static createSctExport(property: any) {
    return AxiosRequestForExport({
      url: `${StandardCostExportAPI.API_ROOT_URL}/sct-export`,
      data: JSON.stringify(property),
      method: 'POST',
      responseType: 'blob'
    })
  }

  static createSctFormulaExport(property: any) {
    return AxiosRequestForExport({
      url: `${StandardCostExportAPI.API_ROOT_URL}/sct-export-formula`,
      data: JSON.stringify(property),
      method: 'POST',
      responseType: 'blob'
    })
  }

  static getSubAssyBySctId(property: any) {
    return AxiosRequest({
      url: `${StandardCostExportAPI.API_ROOT_URL}/getSubAssyBySctId`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }
}
