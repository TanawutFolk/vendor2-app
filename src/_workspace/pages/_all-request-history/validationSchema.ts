import { z } from 'zod'

import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// TODO: Can change this value
const searchFiltersSchema = z.object({
  section: z
    .object({
      value: z.string(),
      label: z.string()
    })
    .nullable(),
  year: z
    .object({
      value: z.number(),
      label: z.string()
    })
    .nullable()
})

// !! Do not change this value
export const validationSchemaPage = z.object({
  // searchFilters
  searchFilters: searchFiltersSchema,

  // searchResults
  searchResults: z.object({
    agGridState: z.any().optional()
  })
})

export type FormDataPage = z.infer<typeof validationSchemaPage>

// ------------------------- Fetch Default Values -------------------------

const getUrlParamSearch = ({ USER_ID, APPLICATION_ID, MENU_ID }: UserProfileSettingProgramI): string => {
  let params = ``

  params += `"USER_ID":"${USER_ID}"`
  params += `, "APPLICATION_ID":"${APPLICATION_ID}"`
  params += `, "MENU_ID":"${MENU_ID}"`

  params = `{${params}}`

  return params
}

const paramForSearch = (MENU_ID: number): UserProfileSettingProgramI => ({
  USER_ID: Number(getUserData().USER_ID),
  APPLICATION_ID: Number(import.meta.env.VITE_APPLICATION_ID),
  MENU_ID: MENU_ID
})

export const fetchDefaultValues = async (MENU_ID: number): Promise<FormDataPage> => {
  return new Promise(async resolve => {
    try {
      // get data from common-system-web-api
      const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
        AxiosResponseI<UserProfileSettingProgramI<FormDataPage>>
      >(getUrlParamSearch(paramForSearch(MENU_ID)))

      resolve({
        searchFilters: {
          // TODO: Can change this value
          section: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.section || null,
          year: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.year || null
        },
        searchResults: {
          agGridState:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.agGridState || undefined
        }
      })
    } catch (error) {
      resolve({
        searchFilters: {
          // TODO: Can change this value
          section: null,
          year: null
        },
        searchResults: {
          agGridState: undefined
        }
      })
    }
  })
}
