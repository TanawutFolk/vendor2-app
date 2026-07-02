import ItemGroupAPI from '@/_workspace/api/item-group/ItemGroupAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

export default class ItemGroupServices {
  static getByLikeItemGroupName(params: any) {
    return axiosRequest({
      url: `${ItemGroupAPI.API_ROOT_URL}/getByLikeItemGroupName`,
      params,
      method: 'GET'
    })
  }
}
