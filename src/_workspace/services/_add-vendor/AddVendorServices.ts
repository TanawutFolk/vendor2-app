import AddVendorAPI from '@_workspace/api/_add-vendor/AddVendorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import type {
    CheckDuplicateResponseI,
    CreateVendorResponseI,
    AddVendorApiResponseI,
    VendorTypeI,
    ProductGroupI
} from '@_workspace/types/_add-vendor/AddVendorTypes'

// Pass-through transport layer (company pattern): callers/hooks build the
// UPPER_CASE DB payload; the service only owns endpoint + method.
export default class AddVendorServices {
    // Check if vendor already exists
    static checkDuplicate(data: Record<string, unknown>): Promise<AxiosResponse<CheckDuplicateResponseI>> {
        return axiosRequest<CheckDuplicateResponseI>({
            url: `${AddVendorAPI.API_ROOT_URL}/check-duplicate`,
            data,
            method: 'POST'
        })
    }

    static checkBlacklist(data: Record<string, unknown>): Promise<AxiosResponse<CheckDuplicateResponseI>> {
        return axiosRequest<CheckDuplicateResponseI>({
            url: `${AddVendorAPI.API_ROOT_URL}/check-blacklist`,
            data,
            method: 'POST'
        })
    }

    // Create new vendor with contacts and products
    static create(data: Record<string, unknown>): Promise<AxiosResponse<CreateVendorResponseI>> {
        return axiosRequest<CreateVendorResponseI>({
            url: `${AddVendorAPI.API_ROOT_URL}/CreateVendor`,
            data,
            method: 'POST'
        })
    }

    // Get vendor types for dropdown
    static getVendorTypes(): Promise<AxiosResponse<AddVendorApiResponseI<VendorTypeI[]>>> {
        return axiosRequest<AddVendorApiResponseI<VendorTypeI[]>>({
            url: `${AddVendorAPI.API_ROOT_URL}/vendor-types`,
            method: 'POST'
        })
    }

    // Get product groups for dropdown
    static getProductGroups(): Promise<AxiosResponse<AddVendorApiResponseI<ProductGroupI[]>>> {
        return axiosRequest<AddVendorApiResponseI<ProductGroupI[]>>({
            url: `${AddVendorAPI.API_ROOT_URL}/product-groups`,
            method: 'POST'
        })
    }

    // Create new product group
    static createProductGroup(data: Record<string, unknown>): Promise<AxiosResponse<AddVendorApiResponseI<{ product_group_id: number }>>> {
        return axiosRequest<AddVendorApiResponseI<{ product_group_id: number }>>({
            url: `${AddVendorAPI.API_ROOT_URL}/create-product-group`,
            data,
            method: 'POST'
        })
    }
}
