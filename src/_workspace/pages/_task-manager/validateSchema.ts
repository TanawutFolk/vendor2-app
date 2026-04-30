import { z } from 'zod'

// Services Imports
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'

const SelectOptionSchema = z.object({
    value: z.string(),
    label: z.string(),
})

export const TaskSearchFiltersSchema = z.object({
    picFilter: SelectOptionSchema.nullable(),
    statusFilter: SelectOptionSchema.nullable(),
})

export const TaskSearchResultsSchema = z.object({
    agGridState: z.unknown().optional(),
})

export const TaskManagerSchema = z.object({
    searchFilters: TaskSearchFiltersSchema,
    searchResults: TaskSearchResultsSchema,
})

export type SelectOption = z.infer<typeof SelectOptionSchema>
export type TaskSearchFiltersFormData = z.infer<typeof TaskSearchFiltersSchema>
export type TaskManagerFormData = z.infer<typeof TaskManagerSchema>

export const defaultSearchFilters: TaskSearchFiltersFormData = {
    picFilter: null,
    statusFilter: null,
}

export const defaultFormValues: TaskManagerFormData = {
    searchFilters: defaultSearchFilters,
    searchResults: {},
}

// ── Fetch saved user profile settings (same pattern as Find Vendor) ──
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
    MENU_ID: MENU_ID
}

export const fetchDefaultValues = async (): Promise<TaskManagerFormData> => {
    try {
        const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
            AxiosResponseI<UserProfileSettingProgramI<TaskManagerFormData>>
        >(getUrlParamSearch(paramForSearch))

        if (!result?.data?.Status || !result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA) {
            return defaultFormValues
        }

        const savedData = result.data.ResultOnDb[0].USER_PROFILE_SETTING_PROGRAM_DATA

        return {
            searchFilters: {
                ...defaultFormValues.searchFilters,
                ...savedData.searchFilters,
                picFilter: savedData.searchFilters?.picFilter || null,
                statusFilter: savedData.searchFilters?.statusFilter || null,
            },
            searchResults: {
                agGridState: savedData.searchResults?.agGridState
            }
        }
    } catch (error) {
        console.error('Failed to load user settings', error)
        return defaultFormValues
    }
}
