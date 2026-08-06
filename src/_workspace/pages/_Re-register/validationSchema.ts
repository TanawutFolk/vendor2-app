import { z } from 'zod'

import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { normalizeStatusMasterOption } from '@/_workspace/types/StatusMasterTypes'

// TODO: Can change this value
const searchFiltersSchema = z.object({
  globalSearch: z.string(),
  companyName: z.string(),
  vendorTypeId: z
    .object({
      value: z.number(),
      label: z.string()
    })
    .nullable(),
  province: z
    .object({
      value: z.string(),
      label: z.string()
    })
    .nullable(),
  productGroupId: z
    .object({
      value: z.number(),
      label: z.string()
    })
    .nullable(),
  status: z
    .object({
      STATUS_ID: z.number().int().nonnegative(),
      STATUS_CODE: z.string().min(1),
      value: z.number().int().nonnegative(),
      label: z.string()
    })
    .nullable(),
  inuse: z
    .object({
      value: z.number(),
      label: z.string()
    })
    .nullable(),
  productName: z.string(),
  makerName: z.string(),
  modelList: z.string(),
  fftVendorCode: z.string()
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
          globalSearch:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.globalSearch || '',
          companyName:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.companyName || '',
          vendorTypeId:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.vendorTypeId || null,
          province: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.province || null,
          productGroupId:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productGroupId || null,
          status: normalizeStatusMasterOption(
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.status
          ),
          inuse: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.inuse || null,
          productName:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productName || '',
          makerName: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.makerName || '',
          modelList: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.modelList || '',
          fftVendorCode:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.fftVendorCode || ''
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
          globalSearch: '',
          companyName: '',
          vendorTypeId: null,
          province: null,
          productGroupId: null,
          status: null,
          inuse: null,
          productName: '',
          makerName: '',
          modelList: '',
          fftVendorCode: ''
        },
        searchResults: {
          agGridState: undefined
        }
      })
    }
  })
}
