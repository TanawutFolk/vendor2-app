import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

import AddVendorServices from '@_workspace/services/_add-vendor/AddVendorServices'
import type {
    ProductGroupI,
    AddVendorApiResponseI,
    CheckDuplicateRequestI,
    CheckDuplicateResponseI,
    CreateProductGroupRequestI,
    CreateVendorRequestI,
} from '@_workspace/types/_add-vendor/AddVendorTypes'

export const PREFIX_QUERY_KEY = 'PRODUCT_GROUPS'

// ── Product groups dropdown ──────────────────────────────────────────────────
const useGetProductGroups = (isFetchData: boolean = true) => {
    return useQuery<AxiosResponse<AddVendorApiResponseI<ProductGroupI[]>>, Error>({
        queryKey: [PREFIX_QUERY_KEY],
        queryFn: () => AddVendorServices.getProductGroups(),
        placeholderData: keepPreviousData,
        enabled: isFetchData
    })
}

export { useGetProductGroups }

// ── Check duplicate vendor ───────────────────────────────────────────────────
// Thin wrappers (prototype pattern): the caller owns the result UX (modals /
// toast) via the onSuccess / onError callbacks it passes in.
const checkDuplicate = async (dataItem: CheckDuplicateRequestI): Promise<CheckDuplicateResponseI> => {
    const response = await AddVendorServices.checkDuplicate({
        COMPANY_NAME: dataItem.company_name,
        VENDOR_REGION: dataItem.vendor_region,
        PROVINCE: dataItem.province,
        POSTAL_CODE: dataItem.postal_code,
        COUNTRY: dataItem.country
    })
    return response.data
}

export const useCheckDuplicate = (
    onSuccess?: (data: CheckDuplicateResponseI) => void,
    onError?: (error: Error) => void
) => {
    return useMutation({ mutationFn: checkDuplicate, onSuccess, onError })
}

// ── Create product group ─────────────────────────────────────────────────────
const createProductGroup = async (dataItem: CreateProductGroupRequestI) => {
    const response = await AddVendorServices.createProductGroup({
        GROUP_NAME: dataItem.group_name,
        CREATE_BY: dataItem.CREATE_BY
    })
    return response.data
}

export const useCreateProductGroup = (onSuccess: any, onError: any) => {
    return useMutation({ mutationFn: createProductGroup, onSuccess, onError })
}

// ── Create vendor ────────────────────────────────────────────────────────────
const createVendor = async (dataItem: CreateVendorRequestI) => {
    const response = await AddVendorServices.create({
        COMPANY_NAME: dataItem.company_name,
        PROVINCE: dataItem.province,
        POSTAL_CODE: dataItem.postal_code,
        COUNTRY: dataItem.country,
        MASTER_VENDOR_TYPES_ID: dataItem.vendor_type_id,
        VENDOR_REGION: dataItem.vendor_region,
        WEBSITE: dataItem.website,
        TEL_CENTER: dataItem.tel_center,
        ADDRESS: dataItem.address,
        EMAILMAIN: dataItem.emailmain,
        NOTE: dataItem.note,
        CREATE_BY: dataItem.CREATE_BY,
        CONTACTS: (dataItem.contacts || []).map(contact => ({
            VENDOR_CONTACTS_ID: contact.vendor_contact_id,
            VENDORS_ID: contact.vendor_id,
            CONTACT_NAME: contact.contact_name,
            TEL_PHONE: contact.tel_phone,
            EMAIL: contact.email,
            POSITION: contact.position
        })),
        PRODUCTS: (dataItem.products || []).map(product => ({
            VENDOR_PRODUCTS_ID: product.vendor_product_id,
            VENDORS_ID: product.vendor_id,
            MASTER_PRODUCT_GROUPS_ID: product.product_group_id,
            MAKER_NAME: product.maker_name,
            PRODUCT_NAME: product.product_name,
            MODEL_LIST: product.model_list
        }))
    })

    return response.data
}

export const useCreateVendor = (onSuccess: any, onError: any) => {
    return useMutation({ mutationFn: createVendor, onSuccess, onError })
}
