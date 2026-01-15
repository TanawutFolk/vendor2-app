import ItemManufacturingStandardPriceAPI from '@/_workspace/api/item-manufacturing-standard-price/ItemManufacturingStandardPriceAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class ItemManufacturingStandardPriceServices {
  static search(params: object) {
    return axiosRequest({
      url: `${ItemManufacturingStandardPriceAPI.API_ROOT_URL}/search`,
      data: params,
      method: 'POST'
    })
  }

  static create(property: object) {
    return axiosRequest({
      url: `${ItemManufacturingStandardPriceAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static downloadFileForExport() {
    return axiosRequest({
      url: `${ItemManufacturingStandardPriceAPI.API_ROOT_URL}/downloadFileForExport`,
      method: 'GET',
      responseType: 'blob'
    })
  }
  static downloadFileForExportStandardPrice(data: any) {
    return axiosRequest({
      url: `${ItemManufacturingStandardPriceAPI.API_ROOT_URL}/downloadFileForExportStandardPrice`,
      method: 'POST',
      data: data,
      responseType: 'blob'
    })
  }

  static getStandardPriceDetail(params: { ITEM_ID: number | undefined }) {
    return axiosRequest({
      url: `${ItemManufacturingStandardPriceAPI.API_ROOT_URL}/getStandardPriceDetail`,
      params,
      method: 'GET'
    })
  }

  static getByFiscalYearAndSctPatternIdAndItemId_MasterDataLatest(data: {
    FISCAL_YEAR: number
    SCT_PATTERN_ID: number
    ITEM_ID: number
  }) {
    return axiosRequest({
      url: `${ItemManufacturingStandardPriceAPI.API_ROOT_URL}/getByFiscalYearAndSctPatternIdAndItemId_MasterDataLatest`,
      data,
      method: 'POST'
    })
  }

  static delete(data: { ITEM_M_S_PRICE_ID: string }) {
    return axiosRequest({
      url: `${ItemManufacturingStandardPriceAPI.API_ROOT_URL}/delete`,
      data,
      method: 'POST'
    })
  }
}
