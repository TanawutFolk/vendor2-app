import BoiNameForMaterialConsumableAPI from '@/_workspace/api/boi/BoiNameForMaterialConsumableAPI'
import AxiosRequest from '@/libs/axios/axiosRequest'

export default class BoiNameForMaterialConsumableServices {
  static create(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: ProductMainProperty
    })
  }

  static search(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: ProductMainProperty
    })
  }

  static get(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/get`,
      params: { data: JSON.stringify(ProductMainProperty) },
      method: 'GET'
    })
  }

  static update(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/update`,
      method: 'PATCH',
      data: ProductMainProperty
    })
  }

  static delete(ProductMainProperty: string) {
    return AxiosRequest({
      url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/delete`,
      data: ProductMainProperty,
      method: 'DELETE'
    })
  }

  static getByLikeBoiGroupNoAndInuse(params: object) {
    return AxiosRequest({
      url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/getByLikeBoiGroupNoAndInuse`,
      params,
      method: 'GET'
    })
  }

  static fetchBoiGroupNoByBoiGroupNoAndProjectId(params: object) {
    console.log('fetch', params)

    return AxiosRequest({
      url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/getBoiGroupNoByBoiGroupNoAndProjectId`,
      params,
      method: 'GET'
    })
  }
  static fetchBoiSearchDescriptionSubName(params: object) {
    return AxiosRequest({
      url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/SearchDescriptionSubNameForFetch`,
      params,
      method: 'POST'
    })
  }
  static fetchBoiDescriptionMainNameByDescriptionManNameBoiGroupNoAndProjectId(params: object) {
    console.log('FetchGroup', params)
    return AxiosRequest({
      url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/getBoiDescriptionMainNameByDescriptionManNameBoiGroupNoAndProjectId`,
      params,
      method: 'GET'
    })
  }
  // static getByLikeBoiUnitNameAndInuse(params: object) {
  //   return AxiosRequest({
  //     url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/getByLikeBoiUnitNameAndInuse`,
  //     params,
  //     method: 'GET'
  //   })
  // }
  // static getByLikeBoiSymbolAndInuse(params: object) {
  //   return AxiosRequest({
  //     url: `${BoiNameForMaterialConsumableAPI.API_ROOT_URL}/getByLikeBoiSymbolAndInuse`,
  //     params,
  //     method: 'GET'
  //   })
  // }

  // static getByLikeProductMainNameAndProductCategoryIdAndInuse(params: object) {
  //   return AxiosRequest({
  //     url: `${ProductMainAPI.API_ROOT_URL}/getByLikeProductMainNameAndProductCategoryIdAndInuse`,
  //     params,
  //     method: 'GET'
  //   })
  // }
}
