import type { AxiosResponse } from 'axios'

import axiosRequest from '@/libs/axios/axiosRequest'
import ReRegisterAPI from '@/_workspace/api/_Re-register/ReRegisterAPI'
import type {
  ReRegisterApiResponseI,
  ReRegisterVendorDetailI,
  VendorRow
} from '@/_workspace/types/_Re-register/ReRegisterTypes'
import type { BusinessCategoryI, CountryI, ProductGroupI, ProvinceI } from '@/_workspace/types/vendor/VendorTypes'

export default class ReRegisterServices {
  static search(data: Record<string, unknown>): Promise<AxiosResponse<ReRegisterApiResponseI<VendorRow[]>>> {
    return axiosRequest<ReRegisterApiResponseI<VendorRow[]>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/search`,
      data,
      method: 'POST'
    })
  }

  static getVendorDetail(
    data: { VENDORS_ID: number }
  ): Promise<AxiosResponse<ReRegisterApiResponseI<ReRegisterVendorDetailI>>> {
    return axiosRequest<ReRegisterApiResponseI<ReRegisterVendorDetailI>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/getVendorDetail`,
      data,
      method: 'POST'
    })
  }

  static updateComprehensive(data: Record<string, unknown>): Promise<AxiosResponse<ReRegisterApiResponseI<unknown>>> {
    return axiosRequest<ReRegisterApiResponseI<unknown>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/update-comprehensive`,
      data,
      method: 'POST'
    })
  }

  static deleteVendor(data: Record<string, unknown>): Promise<AxiosResponse<ReRegisterApiResponseI<boolean>>> {
    return axiosRequest<ReRegisterApiResponseI<boolean>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/delete-vendor`,
      data,
      method: 'POST'
    })
  }

  static downloadFileForExport(data: Record<string, unknown>): Promise<AxiosResponse<Blob>> {
    return axiosRequest({
      url: `${ReRegisterAPI.API_ROOT_URL}/download-file-for-export`,
      data,
      method: 'POST',
      responseType: 'blob'
    })
  }

  static getVendorTypes(
    data: Record<string, unknown> = {}
  ): Promise<AxiosResponse<ReRegisterApiResponseI<BusinessCategoryI[]>>> {
    return axiosRequest<ReRegisterApiResponseI<BusinessCategoryI[]>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/dropdown/vendor-types`,
      data,
      method: 'POST'
    })
  }

  static getProvinces(data: Record<string, unknown> = {}): Promise<AxiosResponse<ReRegisterApiResponseI<ProvinceI[]>>> {
    return axiosRequest<ReRegisterApiResponseI<ProvinceI[]>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/dropdown/provinces`,
      data,
      method: 'POST'
    })
  }

  static getCountries(data: Record<string, unknown> = {}): Promise<AxiosResponse<ReRegisterApiResponseI<CountryI[]>>> {
    return axiosRequest<ReRegisterApiResponseI<CountryI[]>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/dropdown/countries`,
      data,
      method: 'POST'
    })
  }

  static getProductGroups(
    data: Record<string, unknown> = {}
  ): Promise<AxiosResponse<ReRegisterApiResponseI<ProductGroupI[]>>> {
    return axiosRequest<ReRegisterApiResponseI<ProductGroupI[]>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/dropdown/product-groups`,
      data,
      method: 'POST'
    })
  }
}
