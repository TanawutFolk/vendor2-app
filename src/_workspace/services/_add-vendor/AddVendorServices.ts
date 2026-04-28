import AddVendorAPI from '@_workspace/api/_add-vendor/AddVendorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import type {
    CheckDuplicateRequestI,
    CreateVendorRequestI,
    CheckDuplicateResponseI,
    CreateVendorResponseI,
    AddVendorApiResponseI,
    VendorTypeI,
    ProductGroupI,
    CreateProductGroupRequestI
} from '@_workspace/types/_add-vendor/AddVendorTypes'

export default class AddVendorServices {
    // Check if vendor already exists
    static checkDuplicate(params: CheckDuplicateRequestI): Promise<AxiosResponse<CheckDuplicateResponseI>> {
        return axiosRequest<CheckDuplicateResponseI>({
            url: `${AddVendorAPI.API_ROOT_URL}/check-duplicate`,
            data: params,
            method: 'POST'
        })
    }

    static checkBlacklist(params: Pick<CheckDuplicateRequestI, 'company_name'>): Promise<AxiosResponse<CheckDuplicateResponseI>> {
        return axiosRequest<CheckDuplicateResponseI>({
            url: `${AddVendorAPI.API_ROOT_URL}/check-blacklist`,
            data: params,
            method: 'POST'
        })
    }

    // Create new vendor with contacts and products
    static create(data: CreateVendorRequestI): Promise<AxiosResponse<CreateVendorResponseI>> {
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
    static createProductGroup(data: CreateProductGroupRequestI): Promise<AxiosResponse<AddVendorApiResponseI<{ product_group_id: number }>>> {
        return axiosRequest<AddVendorApiResponseI<{ product_group_id: number }>>({
            url: `${AddVendorAPI.API_ROOT_URL}/create-product-group`,
            data,
            method: 'POST'
        })
    }
}
