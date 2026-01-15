import ItemManufacturingAPI from '@/_workspace/api/standard-cost/ItemManufacturingAPI'
import AxiosRequest from '@/libs/axios/axiosRequest'

export default class ItemManufacturingServices {
  static getByLikeItemCodeForSupportMesAndInuse(property: any) {
    return AxiosRequest({
      url: `${ItemManufacturingAPI.API_ROOT_URL}/getByLikeItemCodeForSupportMesAndInuse`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }

  static getItemCodeForSupportMesBySctId(property: any) {
    return AxiosRequest({
      url: `${ItemManufacturingAPI.API_ROOT_URL}/getItemCodeForSupportMesBySctId`,
      data: JSON.stringify(property),
      method: 'POST'
    })
  }
}
