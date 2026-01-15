import PurchaseModuleServices from '@/_workspace/services/purchase-module/PurchaseModuleServices'
import { PurchaseModuleI } from '@/_workspace/types/purchase-module/PurchaseModule'

export interface PurchaseModuleOption extends PurchaseModuleI {}

const fetchPurchaseModuleNameByPurchaseModuleNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<PurchaseModuleOption[]>(resolve => {
    const param = {
      PURCHASE_MODULE_NAME: `${inputValue}`,
      INUSE: 1
    }

    PurchaseModuleServices.getByLikePurchaseModuleNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchPurchaseModuleNameByPurchaseModuleNameAndInuse }
