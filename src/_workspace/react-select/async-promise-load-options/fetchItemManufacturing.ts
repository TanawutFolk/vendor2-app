import ItemManufacturingServices from '@/_workspace/services/sct/ItemManufacturingServices'
import { ItemI } from '@/_workspace/types/item-master/Item'

export interface ItemOption extends ItemI {}

const fetchItemCodeForSupportMesAndInuse = (itemCode: string) =>
  new Promise<ItemOption[]>(resolve => {
    const param = {
      ITEM_CODE_FOR_SUPPORT_MES: itemCode,
      INUSE: 1
    }
    // console.log(param)

    ItemManufacturingServices.getByLikeItemCodeForSupportMesAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchItemCodeForSupportMesBySctId = (itemCode: string, listSct: object) =>
  new Promise<ItemOption[]>(resolve => {
    let dataItem = []

    for (let i = 0; i < listSct?.length; i++) {
      const ele = listSct[i]['SCT_ID']

      if (ele !== undefined) {
        dataItem.push({ SCT_ID: ele })
      }
    }

    const param = {
      ITEM_CODE_FOR_SUPPORT_MES: itemCode,
      INUSE: 1,
      LIST_SCT: dataItem
    }

    ItemManufacturingServices.getItemCodeForSupportMesBySctId(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
export { fetchItemCodeForSupportMesAndInuse, fetchItemCodeForSupportMesBySctId }
