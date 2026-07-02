import ItemPurposeServices from '@/_workspace/services/item-purpose/ItemPurposeServices'
import { ItemPurposeI } from '@/_workspace/types/item-purpose/ItemPurpose'

export interface ItemPurposeOption extends ItemPurposeI {}

const fetchItemPurposeByItemPurposeNameAndInuse = (itemCode: string) =>
  new Promise<ItemPurposeOption[]>(resolve => {
    const param = {
      ITEM_PURPOSE_NAME: itemCode,
      INUSE: 1
    }

    ItemPurposeServices.getByLikeItemPurposeNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchItemPurposeByItemPurposeNameAndInuse }
