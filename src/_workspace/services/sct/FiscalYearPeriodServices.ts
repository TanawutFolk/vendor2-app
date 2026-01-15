import FiscalYearPeriodAPI from '@/_workspace/api/standard-cost/FiscalYearPeriodAPI'

import AxiosRequest from '@/libs/axios/axiosRequest'

export default class FiscalYearPeriodServices {
  static getByLikeSctPatternName(property: any) {
    return AxiosRequest({
      url: `${FiscalYearPeriodAPI.API_ROOT_URL}/search`,
      data: property,
      method: 'POST'
    })
  }

  static create(property: any) {
    return AxiosRequest({
      url: `${FiscalYearPeriodAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return AxiosRequest({
      url: `${FiscalYearPeriodAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'POST'
    })
  }

  static delete(property: any) {
    return AxiosRequest({
      url: `${FiscalYearPeriodAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'POST'
    })
  }

  static search(property: any) {
    return AxiosRequest({
      url: `${FiscalYearPeriodAPI.API_ROOT_URL}/search`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }

  static searchSctCodeForSelection(params: any) {
    return AxiosRequest({
      url: `${FiscalYearPeriodAPI.API_ROOT_URL}/searchSctCodeForSelection`,
      params,
      method: 'GET'
    })
  }

  static searchSctByItemCode(property: any) {
    return AxiosRequest({
      url: `${FiscalYearPeriodAPI.API_ROOT_URL}/searchSctByItemCode`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }

  static getByCustomerInvoiceToIdAndInuse(property: any) {
    return AxiosRequest({
      url: `${FiscalYearPeriodAPI.API_ROOT_URL}/getByCustomerInvoiceToIdAndInuse`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }
}
