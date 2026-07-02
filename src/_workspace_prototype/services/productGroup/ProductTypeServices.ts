import ProductTypeAPI from '@/_workspace/api/product-group/ProductTypeAPI'
import axiosRequest_MasterDataSystem from '@/_workspace/axios/master-data-system/axiosRequest_MasterDataSystem'
import { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import AxiosRequest from '@/libs/axios/axiosRequest'
import { ResultDataResponseI } from '@/libs/axios/types/AxiosResponseInterface'

export default class ProductTypeServices {
  static create(ProductTypeProperty: string) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: ProductTypeProperty
    })
  }

  static search(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/search`,
      data: params,
      method: 'POST'
    })
  }
  static searchProductType(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/searchProductType`,
      data: params,
      method: 'POST'
    })
  }
  static searchProductTypeList(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/searchProductTypeList`,
      // params: { data: params },
      // params: { data: JSON.stringify(params) },
      params,
      method: 'GET'
      // responseType: 'blob'
    })
  }
  static searchForCopy(params: string) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByProductTypeForCopy`,
      data: params,
      method: 'POST'
    })
  }
  static searchForEdit() {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByProductTypeStatusWorkingAndInuse`,

      // data: params,
      method: 'POST'
    })
  }
  static getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods`,

      //params: { data: JSON.stringify(params) },
      data: params,
      method: 'POST'
    })
  }
  static getByLikeProductTypeNameAndProductCategoryIdAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByLikeProductTypeNameAndProductCategoryIdAndInuse`,

      //params: { data: JSON.stringify(params) },
      data: params,
      method: 'POST'
    })
  }
  static getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods`,

      //params: { data: JSON.stringify(params) },
      data: params,
      method: 'POST'
    })
  }
  static getByLikeProductTypeNameAndProductSubIdAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByLikeProductTypeNameAndProductSubIdAndInuse`,

      //params: { data: JSON.stringify(params) },
      data: params,
      method: 'POST'
    })
  }
  static getByLikeProductTypeNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByLikeProductTypeNameAndInuse`,

      // params: { data: JSON.stringify(params) },
      data: params,
      method: 'POST'
    })
  }
  static getByLikeProductTypeNameAndInuseForPriceList(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByLikeProductTypeNameAndInuseForPriceList`,

      // params: { data: JSON.stringify(params) },
      data: params,
      method: 'POST'
    })
  }

  static getByLikeProductTypeCodeAndProductMainIdAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByLikeProductTypeCodeAndProductMainIdAndInuse`,

      // params: { data: JSON.stringify(params) },
      data: params,
      method: 'POST'
    })
  }

  static getByLikeProductTypeNameAndProductMainIdAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByLikeProductTypeNameAndProductMainIdAndInuse`,

      // params: { data: JSON.stringify(params) },
      data: params,
      method: 'POST'
    })
  }

  static createProductType(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/createProductType`,
      data: params,
      method: 'POST'
    })
  }
  static updateProductType(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/updateProductType`,
      data: params,
      method: 'PATCH'
    })
  }
  static getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods`,

      // params: { data: JSON.stringify(params) },
      data: params,
      method: 'POST'
    })
  }

  static getProductTypeForSctByLikeProductTypeNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getProductTypeByProductGroup`,
      params,
      method: 'GET'
    })
  }

  static getProductTypeForSctByLikeProductTypeCodeAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getProductTypeByProductGroup`,
      params,
      method: 'GET'
    })
  }

  static getProductTypeByProductGroup(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getProductTypeByProductGroup`,
      params,
      method: 'GET'
    })
  }

  static getByProductGroup(params: object) {
    return AxiosRequest<ResultDataResponseI<ProductTypeI>>({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByProductGroup`,
      params,
      method: 'GET'
    })
  }

  static getByLikeProductTypeStatusWorkingNameAndInuse(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getByLikeProductTypeStatusWorkingNameAndInuse`,
      params,
      method: 'GET'
    })
  }

  static getProductTypeByProductMainID(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/getProductTypeByProductMainID`,
      data: params,
      method: 'POST'
    })
  }
  static deleteProductTypeAndItem(params: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/deleteProductTypeAndItem`,
      data: params,
      method: 'DELETE'
    })
  }

  static downloadFileForExportProductType(data: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/downloadFileForExportProductType`,
      data,
      method: 'POST',
      responseType: 'blob'
    })
  }

  static downloadFileForExportProductTypeBOM(data: object) {
    return AxiosRequest({
      url: `${ProductTypeAPI.API_ROOT_URL}/downloadFileForExportProductTypeBOM`,
      data,
      method: 'POST',
      responseType: 'blob'
    })
  }
}
