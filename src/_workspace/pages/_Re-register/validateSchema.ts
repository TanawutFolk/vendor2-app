import { z } from 'zod'

import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'

export const SearchFiltersSchema = z.object({
    company_name: z.string().optional().or(z.literal('')),
    vendor_type_id: z.object({
        value: z.number(),
        label: z.string()
    }).nullable().optional(),
    province: z.object({
        value: z.string(),
        label: z.string()
    }).nullable().optional(),
    product_group_id: z.object({
        value: z.number(),
        label: z.string()
    }).nullable().optional(),
    status: z.object({
        value: z.string(),
        label: z.string()
    }).nullable().optional(),
    inuse: z.object({
        value: z.number(),
        label: z.string()
    }).nullable().optional(),
    product_name: z.string().optional().or(z.literal('')),
    maker_name: z.string().optional().or(z.literal('')),
    model_list: z.string().optional().or(z.literal('')),
    fft_vendor_code: z.string().optional().or(z.literal('')),
    global_search: z.string().optional().or(z.literal(''))
})

export const SearchResultsSchema = z.object({
    agGridState: z.any().optional()
})

export const ReRegisterSchema = z.object({
    searchFilters: SearchFiltersSchema,
    searchResults: SearchResultsSchema
})

export type SearchFiltersFormData = z.infer<typeof SearchFiltersSchema>
export type ReRegisterFormData = z.infer<typeof ReRegisterSchema>

export const defaultSearchFilters: SearchFiltersFormData = {
    company_name: '',
    vendor_type_id: null,
    province: null,
    product_group_id: null,
    status: null,
    inuse: null,
    product_name: '',
    maker_name: '',
    model_list: '',
    fft_vendor_code: '',
    global_search: ''
}

export const defaultReRegisterValues: ReRegisterFormData = {
    searchFilters: defaultSearchFilters,
    searchResults: {}
}

const getUrlParamSearch = ({ USER_ID, APPLICATION_ID, MENU_ID }: UserProfileSettingProgramI): string => {
    let params = ``
    params += `"USER_ID":"${USER_ID}"`
    params += `, "APPLICATION_ID":"${APPLICATION_ID}"`
    params += `, "MENU_ID":"${MENU_ID}"`
    return `{${params}}`
}

const paramForSearch: UserProfileSettingProgramI = {
    USER_ID: Number(getUserData().USER_ID),
    APPLICATION_ID: Number(import.meta.env.VITE_APPLICATION_ID),
    MENU_ID
}

export const fetchDefaultValues = async (): Promise<ReRegisterFormData> => {
    try {
        const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
            AxiosResponseI<UserProfileSettingProgramI<ReRegisterFormData>>
        >(getUrlParamSearch(paramForSearch))

        if (!result?.data?.Status || !result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA) {
            return defaultReRegisterValues
        }

        const savedData = result.data.ResultOnDb[0].USER_PROFILE_SETTING_PROGRAM_DATA

        return {
            searchFilters: {
                ...defaultReRegisterValues.searchFilters,
                ...savedData.searchFilters,
                vendor_type_id: savedData.searchFilters.vendor_type_id || null,
                province: savedData.searchFilters.province || null,
                product_group_id: savedData.searchFilters.product_group_id || null,
                status: savedData.searchFilters.status || null,
                inuse: savedData.searchFilters.inuse || null
            },
            searchResults: {
                agGridState: savedData.searchResults?.agGridState
            }
        }
    } catch (error) {
        console.error('Failed to load user settings', error)
        return defaultReRegisterValues
    }
}
