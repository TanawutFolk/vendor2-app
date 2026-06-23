import FindVendorAPI from '@_workspace/api/_find-vendor/FindVendorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import type {
    FindVendorSearchRequestI,
    FindVendorApiResponseI,
    VendorResultI,
    VendorUpdateRequestI,
    VendorComprehensiveI,
    VendorContactI,
    VendorProductI
} from '@_workspace/types/_find-vendor/FindVendorTypes'

export default class FindVendorServices {
    // Search vendors
    static search(params: FindVendorSearchRequestI): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>> {
        const data = {
            SEARCHFILTERS: params.SearchFilters,
            COLUMNFILTERS: params.ColumnFilters,
            LIMIT: params.Limit,
            ORDER: params.Order,
            START: params.Start
        }

        return axiosRequest<FindVendorApiResponseI<VendorResultI[]>>({
            url: `${FindVendorAPI.API_ROOT_URL}/search`,
            data,
            method: 'POST'
        })
    }

    // Get vendor by ID
    static getById(vendor_id: number): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI>>> {
        return axiosRequest<FindVendorApiResponseI<VendorResultI>>({
            url: `${FindVendorAPI.API_ROOT_URL}/getById`,
            data: { VENDORS_ID: vendor_id },
            method: 'POST'
        })
    }

    // Get all contacts of a vendor
    static getVendorContacts(vendor_id: number): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>> {
        return axiosRequest<FindVendorApiResponseI<VendorResultI[]>>({
            url: `${FindVendorAPI.API_ROOT_URL}/getVendorContacts`,
            data: { VENDORS_ID: vendor_id },
            method: 'POST'
        })
    }

    // Get all products of a vendor
    static getVendorProducts(vendor_id: number): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>> {
        return axiosRequest<FindVendorApiResponseI<VendorResultI[]>>({
            url: `${FindVendorAPI.API_ROOT_URL}/getVendorProducts`,
            data: { VENDORS_ID: vendor_id },
            method: 'POST'
        })
    }

    // Update vendor
    static update(vendor_id: number, data: VendorUpdateRequestI): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI>>> {
        const payload = {
            VENDORS_ID: vendor_id,
            COMPANY_NAME: data.company_name,
            MASTER_VENDOR_TYPES_ID: data.vendor_type_id,
            PROVINCE: data.province,
            POSTAL_CODE: data.postal_code,
            WEBSITE: data.website,
            ADDRESS: data.address,
            TEL_CENTER: data.tel_center,
            GROUP_NAME: data.group_name,
            MAKER_NAME: data.maker_name,
            PRODUCT_NAME: data.product_name,
            MODEL_LIST: data.model_list,
            VENDOR_CONTACTS_ID: data.vendor_contact_id,
            VENDOR_PRODUCTS_ID: data.vendor_product_id,
            MASTER_PRODUCT_GROUPS_ID: data.product_group_id,
            CONTACT_NAME: data.contact_name,
            TEL_PHONE: data.tel_phone,
            EMAIL: data.email,
            POSITION: data.position,
            UPDATE_BY: data.UPDATE_BY,
            INUSE: data.INUSE
        }

        return axiosRequest<FindVendorApiResponseI<VendorResultI>>({
            url: `${FindVendorAPI.API_ROOT_URL}/update`,
            data: payload,
            method: 'POST'
        })
    }

    static updateComprehensive(data: {
        vendor_id: number
        vendor: Partial<VendorComprehensiveI>
        contacts: VendorContactI[]
        products: VendorProductI[]
        deleted_contact_ids: number[]
        deleted_product_ids: number[]
        vendor_changed?: boolean
        UPDATE_BY: string
    }): Promise<AxiosResponse<FindVendorApiResponseI<any>>> {
        const payload = {
            VENDORS_ID: data.vendor_id,
            VENDOR: {
                COMPANY_NAME: data.vendor.company_name,
                MASTER_VENDOR_TYPES_ID: data.vendor.vendor_type_id,
                VENDOR_REGION: data.vendor.vendor_region,
                PROVINCE: data.vendor.province,
                POSTAL_CODE: data.vendor.postal_code,
                WEBSITE: data.vendor.website,
                ADDRESS: data.vendor.address,
                TEL_CENTER: data.vendor.tel_center,
                EMAILMAIN: data.vendor.emailmain,
                INUSE: data.vendor.INUSE
            },
            CONTACTS: (data.contacts || []).map(contact => ({
                VENDOR_CONTACTS_ID: contact.vendor_contact_id,
                CONTACT_NAME: contact.contact_name,
                POSITION: contact.position,
                TEL_PHONE: contact.tel_phone,
                EMAIL: contact.email,
                CREATE_BY: contact.CREATE_BY,
                UPDATE_BY: contact.UPDATE_BY,
                CREATE_DATE: contact.CREATE_DATE,
                UPDATE_DATE: contact.UPDATE_DATE
            })),
            PRODUCTS: (data.products || []).map(product => ({
                VENDOR_PRODUCTS_ID: product.vendor_product_id,
                MASTER_PRODUCT_GROUPS_ID: product.product_group_id,
                GROUP_NAME: product.group_name,
                MAKER_NAME: product.maker_name,
                PRODUCT_NAME: product.product_name,
                MODEL_LIST: product.model_list,
                CREATE_BY: product.CREATE_BY,
                UPDATE_BY: product.UPDATE_BY,
                CREATE_DATE: product.CREATE_DATE,
                UPDATE_DATE: product.UPDATE_DATE
            })),
            DELETED_CONTACT_IDS: data.deleted_contact_ids,
            DELETED_PRODUCT_IDS: data.deleted_product_ids,
            VENDOR_CHANGED: data.vendor_changed,
            UPDATE_BY: data.UPDATE_BY
        }

        return axiosRequest<FindVendorApiResponseI<any>>({
            url: `${FindVendorAPI.API_ROOT_URL}/update-comprehensive`,
            data: payload,
            method: 'POST'
        })
    }

    static deleteVendor(vendor_id: number, UPDATE_BY: string): Promise<AxiosResponse<FindVendorApiResponseI<boolean>>> {
        return axiosRequest<FindVendorApiResponseI<boolean>>({
            url: `${FindVendorAPI.API_ROOT_URL}/deleteVendor`,
            data: { VENDORS_ID: vendor_id, UPDATE_BY },
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

    // Download file for export (Excel)
    static downloadFileForExport(data: any): Promise<AxiosResponse<Blob>> {
        const dataForFetch = data?.DataForFetch || data?.DATAFORFETCH || data || {}
        const payload = {
            DATAFORFETCH: {
                SEARCHFILTERS: dataForFetch.SearchFilters ?? dataForFetch.SEARCHFILTERS,
                COLUMNFILTERS: dataForFetch.ColumnFilters ?? dataForFetch.COLUMNFILTERS,
                ORDER: dataForFetch.Order ?? dataForFetch.ORDER,
                START: dataForFetch.Start ?? dataForFetch.START,
                LIMIT: dataForFetch.Limit ?? dataForFetch.LIMIT
            },
            TYPE: data?.TYPE
        }

        return axiosRequest({
            url: `${FindVendorAPI.API_ROOT_URL}/downloadFileForExport`,
            method: 'POST',
            data: payload,
            responseType: 'blob'
        })
    }

    // Delete contact
    static deleteContact(vendor_contact_id: number): Promise<AxiosResponse<FindVendorApiResponseI<boolean>>> {
        return axiosRequest<FindVendorApiResponseI<boolean>>({
            url: `${FindVendorAPI.API_ROOT_URL}/deleteContact`,
            data: { VENDOR_CONTACTS_ID: vendor_contact_id },
            method: 'POST'
        })
    }

    // Delete product
    static deleteProduct(vendor_product_id: number): Promise<AxiosResponse<FindVendorApiResponseI<boolean>>> {
        return axiosRequest<FindVendorApiResponseI<boolean>>({
            url: `${FindVendorAPI.API_ROOT_URL}/deleteProduct`,
            data: { VENDOR_PRODUCTS_ID: vendor_product_id },
            method: 'POST'
        })
    }


}
