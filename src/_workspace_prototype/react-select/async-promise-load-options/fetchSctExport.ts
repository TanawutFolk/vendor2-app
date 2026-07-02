import StandardCostExportServices from '@/_workspace/services/sct/StandardCostExportServices'
import type { BomI } from '../../types/bom/Bom'

type Item = {
  ITEM_CATEGORY_NAME: string
  ITEM_CATEGORY_ID: number
  ITEM_CATEGORY_ALPHABET: string
  ITEM_CATEGORY_SHORT_NAME: string
  ITEM_CODE_FOR_SUPPORT_MES: string
  ITEM_ID: number
  ITEM_INTERNAL_FULL_NAME: string
  UNIT_OF_MEASUREMENT_NAME: string
}

type ItemCategory = {
  ITEM_CATEGORY_NAME: string
  ITEM_CATEGORY_ID: number
  ITEM_CATEGORY_ALPHABET: string
}

type Process = {
  value: number
  label: string
}

export interface BomOption extends BomI {
  ITEM: Item[]
  ITEM_CATEGORY: ItemCategory
  PROCESS: Process
  productMain: {
    PRODUCT_MAIN_ID: number
    PRODUCT_MAIN_NAME: string
    PRODUCT_MAIN_ALPHABET: string
  }
  bomName: string
  bomCode: string
  flowName: string
  flowCode: string
}

const fetchSubAssyByLikeSctId = (params: object) =>
  new Promise<BomOption>(resolve => {
    StandardCostExportServices.getSubAssyBySctId(params)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchSubAssyByLikeProductTypeID = (params: object) =>
  new Promise<BomOption>(resolve => {
    StandardCostExportServices.getSubAssyByProductTypeId(params)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchSubAssyByLikeProductTypeID, fetchSubAssyByLikeSctId }
