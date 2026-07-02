import { z } from 'zod'

import { getUserData } from '@/utils/user-profile/userLoginProfile'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { MENU_ID } from './env'

export const AssigneeGroupOptionSchema = z.object({
    label: z.string(),
    value: z.string()
})

export const AssigneesSearchSchema = z.object({
    keyword: z.string().optional(),
    group_code: AssigneeGroupOptionSchema.nullable().optional(),
    in_use: z.string().optional()
})

export const AssigneesSearchResultSchema = z.object({
    agGridState: z.unknown().optional()
})

export const AssigneesSchema = z.object({
    searchFilters: AssigneesSearchSchema,
    searchResults: AssigneesSearchResultSchema
})

export const AssigneesFormSchema = z.object({
    Assignees_id: z.number().optional(),
    empcode: z.string().trim().min(1, 'EmpCode is required'),
    empName: z.string().trim().min(1, 'Name is required'),
    empEmail: z.string().trim().min(1, 'Email is required').email('Invalid email format'),
    group_code: z.string().trim().min(1, 'Group is required'),
    group_name: z.string().trim().min(1, 'Group is required'),
    INUSE: z.number()
})

export type AssigneesSearchFiltersFormData = z.infer<typeof AssigneesSearchSchema>
export type AssigneesFormData = z.infer<typeof AssigneesSchema>
export type AssigneeFormData = z.infer<typeof AssigneesFormSchema>
export type AssigneeGroupOption = z.infer<typeof AssigneeGroupOptionSchema>

import type { AssigneeRow } from '@_workspace/types/_Employee-manager/EmployeeManagerTypes'
export type { AssigneeRow }

export const defaultSearchFilters: AssigneesSearchFiltersFormData = {
    keyword: '',
    group_code: null,
    in_use: ''
}

export const defaultAssigneeFormValues: AssigneeFormData = {
    Assignees_id: undefined,
    empcode: '',
    empName: '',
    empEmail: '',
    group_code: '',
    group_name: '',
    INUSE: 1
}

const getUrlParamSearch = ({ USER_ID, APPLICATION_ID, MENU_ID }: UserProfileSettingProgramI): string => {
    let params = ''

    params += `"USER_ID":"${USER_ID}"`
    params += `, "APPLICATION_ID":"${APPLICATION_ID}"`
    params += `, "MENU_ID":"${MENU_ID}"`

    return `{${params}}`
}

const paramForSearch: UserProfileSettingProgramI = {
    USER_ID: Number(getUserData().USER_ID),
    APPLICATION_ID: Number(import.meta.env.VITE_APPLICATION_ID),
    MENU_ID,
}

export const fetchDefaultValues = async (): Promise<AssigneesFormData> => {
    try {
        const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
            AxiosResponseI<UserProfileSettingProgramI<AssigneesFormData>>
        >(getUrlParamSearch(paramForSearch))

        const saved = result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA

        if (!result?.data?.Status || !saved) {
            return { searchFilters: defaultSearchFilters, searchResults: {} }
        }

        return {
            searchFilters: { ...defaultSearchFilters, ...saved.searchFilters },
            searchResults: { ...saved.searchResults },
        }
    } catch {
        return { searchFilters: defaultSearchFilters, searchResults: {} }
    }
}
