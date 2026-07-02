import ItemServices from '@/_workspace/services/item-master/ItemServices'
import { ItemI } from '@/_workspace/types/item-master/Item'

export interface ItemOption extends ItemI {}

export interface ItemOptionForStandardPrice extends ItemI {
  USAGE_UNIT: string
  USAGE_UNIT_ID: string
  PURCHASE_UNIT: string
  PURCHASE_UNIT_ID: string
  USAGE_UNIT_RATIO: number
  PURCHASE_UNIT_RATIO: number
  ITEM_INTERNAL_SHORT_NAME: string
}

const fetchItemPrice = (data: any) => {
  return new Promise<Blob | null>(resolve => {
    ItemServices.downloadFileForExportItem(data)
      .then(responseJson => {
        resolve(responseJson.data)
      })
      .catch(error => {
        console.log(error)
        resolve(null)
      })
  })
}

const fetchItemCodeByItemCodeNameAndInuse = (itemCode: string) =>
  new Promise<ItemOption[]>(resolve => {
    const param = {
      ITEM_CODE: itemCode,
      INUSE: 1
    }

    ItemServices.getByLikeItemCodeNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchItemCodeByItemCodeNameAndInuse_NotFG = (itemCode: string) =>
  new Promise<ItemOption[]>(resolve => {
    const param = {
      ITEM_CODE: itemCode,
      INUSE: 1
    }

    ItemServices.getByLikeItemCodeNameAndInuse_NotFG(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchItemCodeByLikeItemCodeAndInuseAndNotFGSemiFGSubAs = (itemCode: string) =>
  new Promise<ItemOptionForStandardPrice[]>(resolve => {
    const param = {
      ITEM_CODE: itemCode,
      INUSE: 1
    }

    ItemServices.getByLikeItemCodeAndInuseAndNotFGSemiFGSubAs(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export {
  fetchItemCodeByItemCodeNameAndInuse,
  fetchItemCodeByItemCodeNameAndInuse_NotFG,
  fetchItemCodeByLikeItemCodeAndInuseAndNotFGSemiFGSubAs,
  fetchItemPrice
}
