import FindVendorAPI from '@/_workspace/api/_find-vendor/FindVendorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import type {
  DropdownItemI,
  FindVendorApiResponseI,
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
  static getVendorBusinessCategoryName(): Promise<AxiosResponse<FindVendorApiResponseI<DropdownItemI[]>>> {
    return axiosRequest<FindVendorApiResponseI<DropdownItemI[]>>({
      url: `${FindVendorAPI.API_ROOT_URL}/dropdown/vendor-business-category-name`,
      method: 'POST'
    })
  }

  static getVendorTypes(): Promise<AxiosResponse<FindVendorApiResponseI<DropdownItemI[]>>> {
    return FindVendorServices.getVendorBusinessCategoryName()
  }

  // Get provinces for dropdown
  static getProvinces(): Promise<AxiosResponse<FindVendorApiResponseI<DropdownItemI[]>>> {
    return axiosRequest<FindVendorApiResponseI<DropdownItemI[]>>({
      url: `${FindVendorAPI.API_ROOT_URL}/dropdown/provinces`,
      method: 'POST'
    })
  }
  // Get countries for dropdown
  static getCountries(): Promise<AxiosResponse<FindVendorApiResponseI<DropdownItemI[]>>> {
    return axiosRequest<FindVendorApiResponseI<DropdownItemI[]>>({
      url: `${FindVendorAPI.API_ROOT_URL}/dropdown/countries`,
      method: 'POST'
    })
  }

  // Get product groups for dropdown
  static getProductGroups(): Promise<AxiosResponse<FindVendorApiResponseI<DropdownItemI[]>>> {
    return axiosRequest<FindVendorApiResponseI<DropdownItemI[]>>({
      url: `${FindVendorAPI.API_ROOT_URL}/dropdown/product-groups`,
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
