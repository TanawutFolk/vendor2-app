import ItemCategoryServices from '@/_workspace/services/item-master/ItemCategoryServices'
import { ItemCategoryI } from '@/_workspace/types/item-master/ItemCategory'

export interface ItemCategoryOption extends ItemCategoryI {}

const fetchItemCategoryByItemCategoryNameAndInuse = (itemCategoryName: string) =>
  new Promise<ItemCategoryOption[]>(resolve => {
    const param = {
      ITEM_CATEGORY_NAME: itemCategoryName,
      INUSE: 1
    }

    ItemCategoryServices.getByLikeItemCategoryNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse = ({
  itemCategoryName,
  inuse = ''
}: {
  itemCategoryName: string
  inuse: number | ''
}) =>
  new Promise<ItemCategoryOption[]>(resolve => {
    const param = {
      ITEM_CATEGORY_NAME: itemCategoryName,
      INUSE: inuse
    }

    ItemCategoryServices.getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse = (itemCategoryName: string) =>
  new Promise<ItemCategoryOption[]>(resolve => {
    const param = {
      ITEM_CATEGORY_NAME: itemCategoryName,
      INUSE: 1
    }

    ItemCategoryServices.getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchItemCategoryForBomByLikeItemCategoryNameAndInuse = (itemCategory: string, inuse = '') =>
  new Promise<ItemCategoryOption[]>(resolve => {
    const param = {
      ITEM_CATEGORY_NAME: `${itemCategory}`,
      INUSE: `${inuse}`
    }
    ItemCategoryServices.getForBomByLikeItemCategoryNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export {
  fetchItemCategoryByItemCategoryNameAndInuse,
  fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse,
  fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse,
  fetchItemCategoryForBomByLikeItemCategoryNameAndInuse
}
