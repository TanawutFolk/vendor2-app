import ItemPurposeAPI from '@/_workspace/api/item-purpose/ItemPurposeAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class ItemPurposeServices {
  static getByLikeItemPurposeNameAndInuse(params: any) {
    return axiosRequest({
      url: `${ItemPurposeAPI.API_ROOT_URL}/getByLikeItemPurposeNameAndInuse`,
      params,
      method: 'GET'
    })
  }
}
