import FindVendorAPI from '@/_workspace/api/_find-vendor/FindVendorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import type {
  BusinessCategoryI,
  CountryI,
  FindVendorApiResponseI,
  ProductGroupI,
  ProvinceI,
  VendorComprehensiveI,
  VendorResultI
} from '@/_workspace/types/vendor/VendorTypes'

// Pass-through transport layer (company pattern): callers build the UPPER_CASE
// DB payload; the service only owns endpoint + method.
export default class FindVendorServices {
  // Search vendors
  static search(data: Record<string, unknown>): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>> {
    return axiosRequest<FindVendorApiResponseI<VendorResultI[]>>({
      url: `${FindVendorAPI.API_ROOT_URL}/SearchVendor`,
      data,
      method: 'POST'
    })
  }

  static getVendorDetail(
    data: { VENDORS_ID: number }
  ): Promise<AxiosResponse<FindVendorApiResponseI<VendorComprehensiveI>>> {
    return axiosRequest<FindVendorApiResponseI<VendorComprehensiveI>>({
      url: `${FindVendorAPI.API_ROOT_URL}/getVendorDetail`,
      data,
      method: 'POST'
    })
  }

  // Update vendor
  static update(data: Record<string, unknown>): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI>>> {
    return axiosRequest<FindVendorApiResponseI<VendorResultI>>({
      url: `${FindVendorAPI.API_ROOT_URL}/update`,
      data,
      method: 'POST'
    })
  }

  static updateComprehensive(data: Record<string, unknown>): Promise<AxiosResponse<FindVendorApiResponseI<unknown>>> {
    return axiosRequest<FindVendorApiResponseI<unknown>>({
      url: `${FindVendorAPI.API_ROOT_URL}/update-comprehensive`,
      data,
      method: 'POST'
    })
  }

  static deleteVendor(data: Record<string, unknown>): Promise<AxiosResponse<FindVendorApiResponseI<boolean>>> {
    return axiosRequest<FindVendorApiResponseI<boolean>>({
      url: `${FindVendorAPI.API_ROOT_URL}/deleteVendor`,
      data,
      method: 'POST'
    })
  }

  // Get vendor business category names for dropdown
  static getVendorBusinessCategoryName(
    data: Record<string, unknown> = {}
  ): Promise<AxiosResponse<FindVendorApiResponseI<BusinessCategoryI[]>>> {
    return axiosRequest<FindVendorApiResponseI<BusinessCategoryI[]>>({
      url: `${FindVendorAPI.API_ROOT_URL}/dropdown/vendor-business-category-name`,
      data,
      method: 'POST'
    })
  }

  static getVendorTypes(
    data: Record<string, unknown> = {}
  ): Promise<AxiosResponse<FindVendorApiResponseI<BusinessCategoryI[]>>> {
    return FindVendorServices.getVendorBusinessCategoryName(data)
  }

  // Get provinces for dropdown
  static getProvinces(data: Record<string, unknown> = {}): Promise<AxiosResponse<FindVendorApiResponseI<ProvinceI[]>>> {
    return axiosRequest<FindVendorApiResponseI<ProvinceI[]>>({
      url: `${FindVendorAPI.API_ROOT_URL}/dropdown/provinces`,
      data,
      method: 'POST'
    })
  }
  // Get countries for dropdown
  static getCountries(data: Record<string, unknown> = {}): Promise<AxiosResponse<FindVendorApiResponseI<CountryI[]>>> {
    return axiosRequest<FindVendorApiResponseI<CountryI[]>>({
      url: `${FindVendorAPI.API_ROOT_URL}/dropdown/countries`,
      data,
      method: 'POST'
    })
  }

  // Get product groups for dropdown
  static getProductGroups(
    data: Record<string, unknown> = {}
  ): Promise<AxiosResponse<FindVendorApiResponseI<ProductGroupI[]>>> {
    return axiosRequest<FindVendorApiResponseI<ProductGroupI[]>>({
      url: `${FindVendorAPI.API_ROOT_URL}/dropdown/product-groups`,
      data,
      method: 'POST'
    })
  }

  // Download file for export (Excel)
  static downloadFileForExport(data: Record<string, unknown>): Promise<AxiosResponse<Blob>> {
    return axiosRequest({
      url: `${FindVendorAPI.API_ROOT_URL}/downloadFileForExport`,
      method: 'POST',
      data,
      responseType: 'blob'
    })
  }

  // Delete contact
  static deleteContact(data: Record<string, unknown>): Promise<AxiosResponse<FindVendorApiResponseI<boolean>>> {
    return axiosRequest<FindVendorApiResponseI<boolean>>({
      url: `${FindVendorAPI.API_ROOT_URL}/deleteContact`,
      data,
      method: 'POST'
    })
  }

  // Delete product
  static deleteProduct(data: Record<string, unknown>): Promise<AxiosResponse<FindVendorApiResponseI<boolean>>> {
    return axiosRequest<FindVendorApiResponseI<boolean>>({
      url: `${FindVendorAPI.API_ROOT_URL}/deleteProduct`,
      data,
      method: 'POST'
    })
  }
}
