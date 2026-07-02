import VendorServices from '@/_workspace/services/item-master/VendorServices'
import { ItemImportTypeI } from '@/_workspace/types/item-master/Vendor'

export interface ItemImportTypeOption extends ItemImportTypeI {
  IMPORT_FEE_RATE?: string
}

const fetchItemImportTypeByItemImportTypeNameAndInuse = (itemImportTypeName: string) =>
  new Promise<ItemImportTypeOption[]>(resolve => {
    const param = {
      ITEM_IMPORT_TYPE_NAME: itemImportTypeName,
      INUSE: 1
    }

    VendorServices.getItemImportType(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchItemImportTypeByItemImportTypeNameAndInuse }
