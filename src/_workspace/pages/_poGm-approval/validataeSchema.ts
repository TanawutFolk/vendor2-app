import { z } from 'zod'

import { MENU_ID } from './env'

import { getUserData } from '@/utils/user-profile/userLoginProfile'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'

import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

// ─────────────────────────────────────────────────────────────────────────────
// Option Schema
// ─────────────────────────────────────────────────────────────────────────────

export const SelectOptionSchema = z.object({
  value: z.string(),
  label: z.string()
})

// ─────────────────────────────────────────────────────────────────────────────
// Search Filters Schema
// ─────────────────────────────────────────────────────────────────────────────

export const SearchFiltersSchema = z.object({
  vendor_name: z.string().optional().or(z.literal('')),
  submitted_by: z.string().optional().or(z.literal('')),
  overall_status: SelectOptionSchema.nullable().optional()
})

// ─────────────────────────────────────────────────────────────────────────────
// Search Results Schema
// ─────────────────────────────────────────────────────────────────────────────

export const SearchResultsSchema = z.object({
  agGridState: z.any().optional()
})

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Schema
// ─────────────────────────────────────────────────────────────────────────────

export const RequestRegisterSchema = z.object({
  searchFilters: SearchFiltersSchema,
  searchResults: SearchResultsSchema
})

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SelectOptionFormData = z.infer<typeof SelectOptionSchema>
export type SearchFiltersFormData = z.infer<typeof SearchFiltersSchema>
export type SearchResultsFormData = z.infer<typeof SearchResultsSchema>
export type RequestRegisterFormData = z.infer<typeof RequestRegisterSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Default Values
// ─────────────────────────────────────────────────────────────────────────────

export const defaultSearchFilters: SearchFiltersFormData = {
  vendor_name: '',
  submitted_by: '',
  overall_status: null
}

export const defaultSearchResults: SearchResultsFormData = {
  agGridState: undefined
}

export const defaultFormValues: RequestRegisterFormData = {
  searchFilters: defaultSearchFilters,
  searchResults: defaultSearchResults
}

// ─────────────────────────────────────────────────────────────────────────────
// User Profile Setting
// Persist filters across sessions
// ─────────────────────────────────────────────────────────────────────────────

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

export const fetchDefaultValues = async (): Promise<RequestRegisterFormData> => {
  try {
    const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
      AxiosResponseI<UserProfileSettingProgramI<RequestRegisterFormData>>
    >(getUrlParamSearch(paramForSearch))

    const saved = result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA

    if (!result?.data?.Status || !saved) {
      return defaultFormValues
    }

    return {
      searchFilters: {
        ...defaultSearchFilters,
        ...saved.searchFilters
      },
      searchResults: {
        ...defaultSearchResults,
        ...saved.searchResults
      }
    }
  } catch {
    return defaultFormValues
  }
}