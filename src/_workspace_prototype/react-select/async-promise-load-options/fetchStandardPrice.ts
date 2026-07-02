import StandardPriceServices from '@/_workspace/services/item-manufacturing-standard-price/ItemManufacturingStandardPriceServices'

interface ViewStandardPrice {
  ITEM_CODE_FOR_SUPPORT_MES: string
  ITEM_INTERNAL_SHORT_NAME: string
  VENDOR_NAME: string
  ITEM_IMPORT_TYPE_NAME: string
  EXCHANGE_RATE: number
  PURCHASE_PRICE_CURRENCY_SYMBOL: string
  IMPORT_FEE_RATE: number
  PURCHASE_PRICE: number
  STANDARD_PRICE: number
}

const fetchStandardPrice = () => {
  return new Promise<Blob | null>(resolve => {
    StandardPriceServices.downloadFileForExport()
      .then(responseJson => {
        resolve(responseJson.data)
      })
      .catch(error => {
        console.log(error)
        resolve(null)
      })
  })
}
const fetchExportStandardPrice = (data: any) => {
  return new Promise<Blob | null>(resolve => {
    StandardPriceServices.downloadFileForExportStandardPrice(data)
      .then(responseJson => {
        resolve(responseJson.data)
      })
      .catch(error => {
        console.log(error)
        resolve(null)
      })
  })
}

const fetchStandardPriceDetail = (itemId: number | undefined) =>
  new Promise<ViewStandardPrice[]>(resolve => {
    const param = {
      ITEM_ID: itemId
    }

    StandardPriceServices.getStandardPriceDetail(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchExportStandardPrice, fetchStandardPrice, fetchStandardPriceDetail }
