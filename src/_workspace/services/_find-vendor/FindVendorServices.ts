import FindVendorAPI from '@_workspace/api/_find-vendor/FindVendorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import type {
    FindVendorSearchRequestI,
    FindVendorApiResponseI,
    VendorResultI,
    VendorUpdateRequestI
} from '@_workspace/types/_find-vendor/FindVendorTypes'

export default class FindVendorServices {
    // Search vendors
    static search(params: FindVendorSearchRequestI): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>> {
        return axiosRequest<FindVendorApiResponseI<VendorResultI[]>>({
            url: `${FindVendorAPI.API_ROOT_URL}/search`,
            data: params,
            method: 'POST'
        })
    }

    // Get vendor by ID
    static getById(vendor_id: number): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI>>> {
        return axiosRequest<FindVendorApiResponseI<VendorResultI>>({
            url: `${FindVendorAPI.API_ROOT_URL}/getById`,
            data: { vendor_id },
            method: 'POST'
        })
    }

    // Update vendor
    static update(vendor_id: number, data: VendorUpdateRequestI): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI>>> {
        return axiosRequest<FindVendorApiResponseI<VendorResultI>>({
            url: `${FindVendorAPI.API_ROOT_URL}/update`,
            data: data,
            method: 'POST'
        })
    }

    // Get vendor types for dropdown
    static getVendorTypes(): Promise<AxiosResponse<FindVendorApiResponseI<any[]>>> {
        return axiosRequest<FindVendorApiResponseI<any[]>>({
            url: `${FindVendorAPI.API_ROOT_URL}/dropdown/vendor-types`,
            method: 'POST'
        })
    }

    // Get provinces for dropdown
    static getProvinces(): Promise<AxiosResponse<FindVendorApiResponseI<any[]>>> {
        return axiosRequest<FindVendorApiResponseI<any[]>>({
            url: `${FindVendorAPI.API_ROOT_URL}/dropdown/provinces`,
            method: 'POST'
        })
    }

    // Get product groups for dropdown
    static getProductGroups(): Promise<AxiosResponse<FindVendorApiResponseI<any[]>>> {
        return axiosRequest<FindVendorApiResponseI<any[]>>({
            url: `${FindVendorAPI.API_ROOT_URL}/dropdown/product-groups`,
            method: 'POST'
        })
    }
}
