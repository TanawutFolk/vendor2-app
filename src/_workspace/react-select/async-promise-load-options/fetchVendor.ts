import VendorServices from '@/_workspace/services/item-master/VendorServices'
import { VendorI } from '@/_workspace/types/item-master/Vendor'

export interface VendorOption extends VendorI {}

const fetchVendorByVendorNameAndInuse = (vendor: string) =>
  new Promise<VendorOption[]>(resolve => {
    const param = {
      VENDOR_ALPHABET: vendor,
      INUSE: 1
    }

    VendorServices.getByLikeVendorNameAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchVendorByVendorName = (vendor: string) =>
  new Promise<VendorOption[]>(resolve => {
    const param = {
      VENDOR_NAME: vendor,
      INUSE: 1
    }

    VendorServices.getByLikeVendorName(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
const fetchVendorByLikeVendorNameAndImportType = (vendor: string) =>
  new Promise<VendorOption[]>(resolve => {
    const param = {
      VENDOR_NAME: vendor,
      INUSE: 1
    }

    VendorServices.getByLikeVendorNameAndImportType(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchVendorByLikeVendorNameAndImportType, fetchVendorByVendorName, fetchVendorByVendorNameAndInuse }
