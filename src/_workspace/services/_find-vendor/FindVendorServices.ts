import FindVendorAPI from '@_workspace/api/_find-vendor/FindVendorAPI'
import axiosRequest from '@/libs/axios/axiosRequest'
import { AxiosResponse } from 'axios'
import type {
    FindVendorSearchRequestI,
    FindVendorApiResponseI,
    VendorResultI,
    VendorUpdateRequestI,
    VendorComprehensiveI
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

    // Get all contacts of a vendor
    static getVendorContacts(vendor_id: number): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>> {
        return axiosRequest<FindVendorApiResponseI<VendorResultI[]>>({
            url: `${FindVendorAPI.API_ROOT_URL}/getVendorContacts`,
            data: { vendor_id },
            method: 'POST'
        })
    }

    // Get all products of a vendor
    static getVendorProducts(vendor_id: number): Promise<AxiosResponse<FindVendorApiResponseI<VendorResultI[]>>> {
        return axiosRequest<FindVendorApiResponseI<VendorResultI[]>>({
            url: `${FindVendorAPI.API_ROOT_URL}/getVendorProducts`,
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

    // Get comprehensive vendor data by searching all records of a company
    static async getComprehensiveByVendorId(vendor_id: number): Promise<{
        vendor: VendorResultI,
        contacts: VendorResultI[],
        products: VendorResultI[]
    }> {
        // Get basic vendor info first
        const vendorResponse = await this.getById(vendor_id)
        if (!vendorResponse.data.Status) {
            throw new Error('Vendor not found')
        }

        const vendorData = vendorResponse.data.ResultOnDb

        // Search for all records with the same company name to get all contacts and products
        const searchResponse = await this.search({
            SearchFilters: [
                { id: 'company_name', value: vendorData.company_name },
                { id: 'vendor_type_id', value: null },
                { id: 'province', value: '' },
                { id: 'group_name', value: '' },
                { id: 'status', value: '' },
                { id: 'product_name', value: '' },
                { id: 'maker_name', value: '' },
                { id: 'model_list', value: '' },
                { id: 'inuseForSearch', value: '' }
            ],
            ColumnFilters: [],
            Limit: 1000, // Get all records
            Order: [{ id: 'company_name', desc: false }],
            Start: 0
        })

        if (!searchResponse.data.Status) {
            throw new Error('Failed to search comprehensive data')
        }

        const allRecords = searchResponse.data.ResultOnDb

        // Extract unique contacts (by contact info)
        const contactsMap = new Map<string, VendorResultI>()
        allRecords.forEach(record => {
            if (record.seller_name || record.tel_phone || record.email) {
                const contactKey = `${record.seller_name || ''}_${record.tel_phone || ''}_${record.email || ''}`
                if (!contactsMap.has(contactKey)) {
                    contactsMap.set(contactKey, record)
                }
            }
        })

        // Extract unique products (by product info)
        const productsMap = new Map<string, VendorResultI>()
        allRecords.forEach(record => {
            if (record.product_name || record.maker_name) {
                const productKey = `${record.product_name || ''}_${record.maker_name || ''}`
                if (!productsMap.has(productKey)) {
                    productsMap.set(productKey, record)
                }
            }
        })

        return {
            vendor: vendorData,
            contacts: Array.from(contactsMap.values()),
            products: Array.from(productsMap.values())
        }
    }
}
