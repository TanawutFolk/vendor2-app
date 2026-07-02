import ItemCategoryAPI from '@/_workspace/api/item-master/ItemCategoryAPI'
import axiosRequest from '@/libs/axios/axiosRequest'

import { ReturnApiSearchItemCategoryI } from '@/app/[lang]/(_workspace)/item-master/item-category/ItemCategoryTableData'

export default class ItemCategoryServices {
  static search(property: ReturnApiSearchItemCategoryI) {
    return axiosRequest({
      url: `${ItemCategoryAPI.API_ROOT_URL}/search`,
      data: property,
      method: 'POST'
    })
  }

  static create(property: any) {
    return axiosRequest({
      url: `${ItemCategoryAPI.API_ROOT_URL}/create`,
      data: property,
      method: 'POST'
    })
  }

  static update(property: any) {
    return axiosRequest({
      url: `${ItemCategoryAPI.API_ROOT_URL}/update`,
      data: property,
      method: 'PATCH'
    })
  }

  static Delete(property: any) {
    return axiosRequest({
      url: `${ItemCategoryAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'DELETE'
    })
  }

  static getByLikeItemCategoryNameAndInuse(params: any) {
    return axiosRequest({
      url: `${ItemCategoryAPI.API_ROOT_URL}/getByLikeItemCategoryNameAndInuse`,
      params,
      method: 'GET'
    })
  }

  static getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse(params: any) {
    return axiosRequest({
      url: `${ItemCategoryAPI.API_ROOT_URL}/getItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse`,
      params,
      method: 'GET'
    })
  }

  static getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse(params: any) {
    return axiosRequest({
      url: `${ItemCategoryAPI.API_ROOT_URL}/getRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse`,
      params,
      method: 'GET'
    })
  }

  static getForBomByLikeItemCategoryNameAndInuse(params: any) {
    return axiosRequest({
      url: `${ItemCategoryAPI.API_ROOT_URL}/getForBomByLikeItemCategoryNameAndInuse`,
      params: params,
      method: 'GET'
    })
  }
}
