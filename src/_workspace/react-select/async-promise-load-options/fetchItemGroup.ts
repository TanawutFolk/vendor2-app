import ItemGroupServices from '@/_workspace/services/item-group/ItemGroupServices'
import { ItemGroupI } from '@/_workspace/types/item-group/ItemGroup'

export interface ItemGroupOption extends ItemGroupI {}

const fetchGetByLikeItemGroupName = (itemGroupNamee: string) => {
  return new Promise<ItemGroupOption[]>(resolve => {
    const param = {
      ITEM_GROUP_NAME: itemGroupNamee,
      INUSE: 1
    }

    ItemGroupServices.getByLikeItemGroupName(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}

export { fetchGetByLikeItemGroupName }
