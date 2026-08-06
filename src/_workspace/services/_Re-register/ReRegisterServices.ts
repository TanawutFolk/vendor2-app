import type { AxiosResponse } from 'axios'

import axiosRequest from '@/libs/axios/axiosRequest'
import ReRegisterAPI from '@/_workspace/api/_Re-register/ReRegisterAPI'
import type {
  ReRegisterApiResponseI,
  ReRegisterVendorDetailI,
  VendorRow
} from '@/_workspace/types/_Re-register/ReRegisterTypes'
import type { DropdownItemI } from '@/_workspace/types/vendor/VendorTypes'

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

  static getVendorTypes(): Promise<AxiosResponse<ReRegisterApiResponseI<DropdownItemI[]>>> {
    return axiosRequest<ReRegisterApiResponseI<DropdownItemI[]>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/dropdown/vendor-types`,
      method: 'POST'
    })
  }

  static getProvinces(): Promise<AxiosResponse<ReRegisterApiResponseI<DropdownItemI[]>>> {
    return axiosRequest<ReRegisterApiResponseI<DropdownItemI[]>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/dropdown/provinces`,
      method: 'POST'
    })
  }

  static getCountries(): Promise<AxiosResponse<ReRegisterApiResponseI<DropdownItemI[]>>> {
    return axiosRequest<ReRegisterApiResponseI<DropdownItemI[]>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/dropdown/countries`,
      method: 'POST'
    })
  }

  static getProductGroups(): Promise<AxiosResponse<ReRegisterApiResponseI<DropdownItemI[]>>> {
    return axiosRequest<ReRegisterApiResponseI<DropdownItemI[]>>({
      url: `${ReRegisterAPI.API_ROOT_URL}/dropdown/product-groups`,
      method: 'POST'
    })
  }
}
