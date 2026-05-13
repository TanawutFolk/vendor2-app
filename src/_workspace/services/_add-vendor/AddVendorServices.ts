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
        const data = {
            COMPANY_NAME: params.company_name,
            PROVINCE: params.province,
            POSTAL_CODE: params.postal_code
        }

        return axiosRequest<CheckDuplicateResponseI>({
            url: `${AddVendorAPI.API_ROOT_URL}/check-duplicate`,
            data,
            method: 'POST'
        })
    }

    static checkBlacklist(params: Pick<CheckDuplicateRequestI, 'company_name'>): Promise<AxiosResponse<CheckDuplicateResponseI>> {
        const data = {
            COMPANY_NAME: params.company_name
        }

        return axiosRequest<CheckDuplicateResponseI>({
            url: `${AddVendorAPI.API_ROOT_URL}/check-blacklist`,
            data,
            method: 'POST'
        })
    }

    // Create new vendor with contacts and products
    static create(data: CreateVendorRequestI): Promise<AxiosResponse<CreateVendorResponseI>> {
        const payload = {
            COMPANY_NAME: data.company_name,
            PROVINCE: data.province,
            POSTAL_CODE: data.postal_code,
            VENDOR_TYPE_ID: data.vendor_type_id,
            VENDOR_REGION: data.vendor_region,
            WEBSITE: data.website,
            TEL_CENTER: data.tel_center,
            ADDRESS: data.address,
            EMAILMAIN: data.emailmain,
            NOTE: data.note,
            CREATE_BY: data.CREATE_BY,
            CONTACTS: (data.contacts || []).map(contact => ({
                VENDOR_CONTACT_ID: contact.vendor_contact_id,
                VENDOR_ID: contact.vendor_id,
                CONTACT_NAME: contact.contact_name,
                TEL_PHONE: contact.tel_phone,
                EMAIL: contact.email,
                POSITION: contact.position
            })),
            PRODUCTS: (data.products || []).map(product => ({
                VENDOR_PRODUCT_ID: product.vendor_product_id,
                VENDOR_ID: product.vendor_id,
                PRODUCT_GROUP_ID: product.product_group_id,
                MAKER_NAME: product.maker_name,
                PRODUCT_NAME: product.product_name,
                MODEL_LIST: product.model_list
            }))
        }

        return axiosRequest<CreateVendorResponseI>({
            url: `${AddVendorAPI.API_ROOT_URL}/CreateVendor`,
            data: payload,
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
        const payload = {
            GROUP_NAME: data.group_name,
            CREATE_BY: data.CREATE_BY
        }

        return axiosRequest<AddVendorApiResponseI<{ product_group_id: number }>>({
            url: `${AddVendorAPI.API_ROOT_URL}/create-product-group`,
            data: payload,
            method: 'POST'
        })
    }
}
