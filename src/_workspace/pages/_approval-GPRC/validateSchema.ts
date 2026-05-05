import { z } from 'zod'
import { MENU_ID } from './env'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const SearchFiltersSchema = z.object({
    request_number: z.string().optional().or(z.literal('')),
    vendor_name: z.string().optional().or(z.literal('')),
    step_keyword: z.string().optional().or(z.literal('')),
    status_keyword: z.string().optional().or(z.literal('')),
})

export const SearchResultsSchema = z.object({
    approvalGridState: z.unknown().optional(),
    actionRequiredGridState: z.unknown().optional(),
})

export const ApprovalGprCSchema = z.object({
    searchFilters: SearchFiltersSchema,
    searchResults: SearchResultsSchema,
})

export type SearchFiltersFormData = z.infer<typeof SearchFiltersSchema>
export type ApprovalGprCFormData = z.infer<typeof ApprovalGprCSchema>

export const defaultSearchFilters: SearchFiltersFormData = {
    request_number: '',
    vendor_name: '',
    step_keyword: '',
    status_keyword: '',
}

export const defaultFormValues: ApprovalGprCFormData = {
    searchFilters: defaultSearchFilters,
    searchResults: {},
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
    MENU_ID: MENU_ID,
}

export const fetchDefaultValues = async (): Promise<ApprovalGprCFormData> => {
    try {
        const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
            AxiosResponseI<UserProfileSettingProgramI<ApprovalGprCFormData>>
        >(getUrlParamSearch(paramForSearch))

        if (!result?.data?.Status || !result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA) {
            return defaultFormValues
        }

        const saved = result.data.ResultOnDb[0].USER_PROFILE_SETTING_PROGRAM_DATA

        return {
            searchFilters: { ...defaultSearchFilters, ...saved.searchFilters },
            searchResults: saved.searchResults ?? {},
        }
    } catch {
        return defaultFormValues
    }
}
