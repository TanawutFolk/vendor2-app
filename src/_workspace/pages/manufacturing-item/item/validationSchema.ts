import { z } from 'zod'

import { MRT_FilterFns } from 'material-react-table'

import dayjs from 'dayjs'

import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'

import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'

import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

// TODO: Can change this value
const columns = [
  'mrt-row-actions',

  'inuseForSearch',

  'IMAGE',
  'ITEM_CODE_FOR_SUPPORT_MES',
  'VERSION_NO',

  'ITEM_CATEGORY',

  'ITEM_EXTERNAL_CODE',
  'ITEM_EXTERNAL_FULL_NAME',
  'ITEM_EXTERNAL_SHORT_NAME',

  'ITEM_INTERNAL_FULL_NAME',
  'ITEM_INTERNAL_SHORT_NAME',

  'ITEM_PURPOSE_NAME',

  'VENDOR_ALPHABET',

  'PURCHASE_UNIT_RATIO',
  'PURCHASE_UNIT_NAME',
  'USAGE_UNIT_RATIO',
  'USAGE_UNIT_NAME',

  'MOQ',
  'LEAD_TIME',
  'SAFETY_STOCK',

  'MAKER_NAME',

  'ITEM_PROPERTY_COLOR_NAME',
  'ITEM_PROPERTY_SHAPE_NAME',
  'NOTE'
] as const

// TODO: Can change this value
const searchFiltersSchema = z.object({
  // Component
  itemCategory: z
    .object({
      ITEM_CATEGORY_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Item Category' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Item Category' }) }), // > 0)
      PURCHASE_MODULE_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Item Category' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Item Category' }) }), // > 0)
      ITEM_CATEGORY_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Item Category' })),
      ITEM_CATEGORY_ALPHABET: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
        })
        .max(1, requiredFieldMessage({ fieldName: 'Item Category' }))
    })
    .nullable(),
  itemPurpose: z
    .object({
      ITEM_PURPOSE_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Item Purpose' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Item Purpose' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Item Purpose' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Item Purpose' }) }), // > 0)
      ITEM_PURPOSE_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Item Purpose' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Item Purpose' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Item Purpose' }))
    })
    .nullable(),
  // vendor: z
  //   .object({
  //     VENDOR_ID: z
  //       .number({
  //         required_error: requiredFieldMessage({ fieldName: 'Vendor' }),
  //         invalid_type_error: requiredFieldMessage({ fieldName: 'Vendor' })
  //       })
  //       .int({ message: requiredFieldMessage({ fieldName: 'Vendor' }) }) // value must be an integer
  //       .positive({ message: requiredFieldMessage({ fieldName: 'Vendor' }) }), // > 0)
  //     VENDOR_ALPHABET: z
  //       .string({
  //         required_error: requiredFieldMessage({ fieldName: 'Vendor' }),
  //         invalid_type_error: requiredFieldMessage({ fieldName: 'Vendor' })
  //       })
  //       .min(1, requiredFieldMessage({ fieldName: 'Vendor' }))
  //   })
  //   .nullable(),
  vendor: z
    .object({
      VENDOR_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Vendor' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Vendor' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Vendor' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Vendor' }) }), // > 0)
      VENDOR_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Vendor' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Vendor' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Vendor' }))
    })
    .nullable(),
  maker: z
    .object({
      MAKER_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Maker' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Maker' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Maker' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Maker' }) }), // > 0)
      MAKER_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Maker' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Maker' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Maker' }))
    })
    .nullable(),
  itemGroup: z
    .object({
      ITEM_GROUP_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Item Group' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Item Group' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Item Group' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Item Group' }) }), // > 0)
      ITEM_GROUP_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Item Group' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Item Group' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Item Group' }))
    })
    .nullable(),

  // Code & Name
  itemInternalCode: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Item Internal Code' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Item Internal Code' })
    })
    .nullable(),
  itemInternalFullName: z.string({
    required_error: requiredFieldMessage({ fieldName: 'Item Internal Full Name' }),
    invalid_type_error: requiredFieldMessage({ fieldName: 'Item Internal Full Name' })
  }),
  itemInternalShortName: z.string({
    required_error: requiredFieldMessage({ fieldName: 'Item Internal Short Name' }),
    invalid_type_error: requiredFieldMessage({ fieldName: 'Item Internal Short Name' })
  }),
  itemExternalCode: z.string({
    required_error: requiredFieldMessage({ fieldName: 'Item External Code' }),
    invalid_type_error: requiredFieldMessage({ fieldName: 'Item External Code' })
  }),
  itemExternalFullName: z.string({
    required_error: requiredFieldMessage({ fieldName: 'Item External Full Name' }),
    invalid_type_error: requiredFieldMessage({ fieldName: 'Item External Full Name' })
  }),
  itemExternalShortName: z.string({
    required_error: requiredFieldMessage({ fieldName: 'Item External Short Name' }),
    invalid_type_error: requiredFieldMessage({ fieldName: 'Item External Short Name' })
  }),

  // Other
  itemCodeForSupportMes: z.string({
    required_error: requiredFieldMessage({ fieldName: 'Item Code For Support Mes & Old System' }),
    invalid_type_error: requiredFieldMessage({ fieldName: 'Item Code For Support Mes & Old System' })
  }),
  status: z
    .object({
      value: z.number().min(0, requiredFieldMessage({ fieldName: 'Status' })),
      label: z.string().min(1, requiredFieldMessage({ fieldName: 'Status' })),
      icon: z.string().min(1, requiredFieldMessage({ fieldName: 'Status' }))
    })
    .nullable(),

  // Property
  color: z
    .object({
      ITEM_PROPERTY_COLOR_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Color' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Color' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Color' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Color' }) }), // > 0)
      ITEM_PROPERTY_COLOR_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Color' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Color' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Color' }))
    })
    .nullable(),
  shape: z
    .object({
      ITEM_PROPERTY_SHAPE_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Shape' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Shape' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Shape' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Shape' }) }), // > 0)
      ITEM_PROPERTY_SHAPE_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Shape' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Shape' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Shape' }))
    })
    .nullable()
})

// !! Do not change this value
export const validationSchemaPage = z.object({
  // searchFilters
  searchFilters: searchFiltersSchema,

  // searchResults
  searchResults: z.object({
    pageSize: z.number().min(10, requiredFieldMessage({ fieldName: 'Page Size' })),
    columnFilters: z.any(),
    sorting: z.array(
      z.object({
        id: z.string(),
        desc: z.boolean()
      })
    ),
    density: z.enum(['comfortable', 'compact', 'spacious'], {
      invalid_type_error: 'density invalid_type_error',
      required_error: 'density required_error'
    }),
    columnVisibility: z.record(z.string(), z.boolean()),
    columnPinning: z.object({
      left: z.array(z.string()).optional(),
      right: z.array(z.string()).optional()
    }),

    columnOrder: z.array(z.string()),
    columnFilterFns: z.any()
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

      // find column missing from default
      const columnsDifference = columns?.filter(
        element =>
          result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnOrder?.includes(
            element
          ) === false
      )

      // change to date format
      const columnFilters =
        result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnFilters?.map(
          (item: any) => {
            if (item.id === 'CREATE_DATE' || item.id === 'UPDATE_DATE' || item.id === 'MODIFIED_DATE') {
              const value = (item?.value as string) || ''

              return {
                id: item.id,
                value: dayjs(value).isValid() ? dayjs(value) : null
              }
            } else {
              return item
            }
          }
        )

      resolve({
        searchFilters: {
          // TODO: Can change this value
          itemCategory:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemCategory ?? null,
          itemPurpose:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemPurpose ?? null,
          itemGroup: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemGroup ?? null,
          vendor: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.vendor ?? null,
          maker: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.maker ?? null,
          itemInternalCode:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemInternalCode ?? '',
          itemInternalFullName:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemInternalFullName ?? '',
          itemInternalShortName:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemInternalShortName ?? '',
          itemExternalCode:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemExternalCode ?? '',
          itemExternalFullName:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemExternalFullName ?? '',
          itemExternalShortName:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemExternalShortName ?? '',
          itemCodeForSupportMes:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemCodeForSupportMes ?? '',
          status: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.status ?? null,
          color: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.color ?? null,
          shape: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.shape ?? null
        },
        searchResults: {
          pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize ?? 10,
          columnFilters: columnFilters ?? [],
          sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting ?? [],
          density:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density ?? 'comfortable',
          columnVisibility: {
            inuseForSearch:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.inuseForSearch ?? true,
            IMAGE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility.IMAGE ??
              true,
            ITEM_CODE_FOR_SUPPORT_MES:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_CODE_FOR_SUPPORT_MES ?? true,
            VERSION_NO:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .VERSION_NO ?? true,
            ITEM_CATEGORY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_CATEGORY ?? true,
            ITEM_EXTERNAL_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_EXTERNAL_CODE ?? true,
            ITEM_EXTERNAL_FULL_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_EXTERNAL_FULL_NAME ?? true,
            ITEM_EXTERNAL_SHORT_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_EXTERNAL_SHORT_NAME ?? true,
            ITEM_INTERNAL_FULL_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_INTERNAL_FULL_NAME ?? true,
            ITEM_INTERNAL_SHORT_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_INTERNAL_SHORT_NAME ?? true,
            ITEM_PURPOSE_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_PURPOSE_NAME ?? true,
            VENDOR_ALPHABET:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .VENDOR_ALPHABET ?? true,
            PURCHASE_UNIT_RATIO:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .PURCHASE_UNIT_RATIO ?? true,
            PURCHASE_UNIT_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .PURCHASE_UNIT_NAME ?? true,
            USAGE_UNIT_RATIO:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .USAGE_UNIT_RATIO ?? true,
            USAGE_UNIT_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .USAGE_UNIT_NAME ?? true,
            MOQ:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility.MOQ ??
              true,
            LEAD_TIME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .LEAD_TIME ?? true,
            SAFETY_STOCK:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .SAFETY_STOCK ?? true,
            MAKER_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .MAKER_NAME ?? true,
            ITEM_PROPERTY_COLOR_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_PROPERTY_COLOR_NAME ?? true,
            ITEM_PROPERTY_SHAPE_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_PROPERTY_SHAPE_NAME ?? true,
            ITEM_GROUP_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .ITEM_GROUP_NAME ?? true,
            WIDTH:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility.WIDTH ??
              true,
            HEIGHT:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .HEIGHT ?? true,
            DEPTH:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility.DEPTH ??
              true,
            CUSTOMER_ORDER_FROM:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                .CUSTOMER_ORDER_FROM_ALPHABET ?? true,
            UPDATE_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility.c ??
              true,
            UPDATE_BY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility.c ??
              true,
            NOTE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility.NOTE ??
              true
          },
          columnPinning: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults
            .columnPinning ?? { left: [], right: [] },
          columnOrder:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnOrder?.concat(
              columnsDifference
            ) ?? [],
          columnFilterFns: {
            inuseForSearch:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .inuseForSearch ?? MRT_FilterFns.contains.name,
            IMAGE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.IMAGE ??
              MRT_FilterFns.contains.name,
            ITEM_CODE_FOR_SUPPORT_MES:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_CODE_FOR_SUPPORT_MES ?? MRT_FilterFns.contains.name,
            VERSION_NO:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .VERSION_NO ?? MRT_FilterFns.contains.name,
            ITEM_CATEGORY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_CATEGORY ?? MRT_FilterFns.contains.name,
            ITEM_EXTERNAL_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_EXTERNAL_CODE ?? MRT_FilterFns.contains.name,
            ITEM_EXTERNAL_FULL_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_EXTERNAL_FULL_NAME ?? MRT_FilterFns.contains.name,
            ITEM_EXTERNAL_SHORT_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_EXTERNAL_SHORT_NAME ?? MRT_FilterFns.contains.name,
            ITEM_INTERNAL_FULL_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_INTERNAL_FULL_NAME ?? MRT_FilterFns.contains.name,
            ITEM_INTERNAL_SHORT_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_INTERNAL_SHORT_NAME ?? MRT_FilterFns.contains.name,
            ITEM_PURPOSE_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_PURPOSE_NAME ?? MRT_FilterFns.contains.name,
            VENDOR_ALPHABET:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .VENDOR_ALPHABET ?? MRT_FilterFns.contains.name,
            PURCHASE_UNIT_RATIO:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .PURCHASE_UNIT_RATIO ?? MRT_FilterFns.contains.name,
            PURCHASE_UNIT_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .PURCHASE_UNIT_NAME ?? MRT_FilterFns.contains.name,
            USAGE_UNIT_RATIO:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .USAGE_UNIT_RATIO ?? MRT_FilterFns.contains.name,
            USAGE_UNIT_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .USAGE_UNIT_NAME ?? MRT_FilterFns.contains.name,
            MOQ:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.MOQ ??
              MRT_FilterFns.contains.name,
            LEAD_TIME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .LEAD_TIME ?? MRT_FilterFns.contains.name,
            SAFETY_STOCK:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .SAFETY_STOCK ?? MRT_FilterFns.contains.name,
            MAKER_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .MAKER_NAME ?? MRT_FilterFns.contains.name,
            ITEM_PROPERTY_COLOR_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_PROPERTY_COLOR_NAME ?? MRT_FilterFns.contains.name,
            ITEM_PROPERTY_SHAPE_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_PROPERTY_SHAPE_NAME ?? MRT_FilterFns.contains.name,
            ITEM_GROUP_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_GROUP_NAME ?? MRT_FilterFns.contains.name,
            WIDTH:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.WIDTH ??
              MRT_FilterFns.contains.name,
            HEIGHT:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.HEIGHT ??
              MRT_FilterFns.contains.name,
            DEPTH:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.DEPTH ??
              MRT_FilterFns.contains.name,
            CUSTOMER_ORDER_FROM_ALPHABET:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .CUSTOMER_ORDER_FROM_ALPHABET ?? MRT_FilterFns.contains.name,
            UPDATE_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .UPDATE_DATE ?? MRT_FilterFns.equals.name,
            UPDATE_BY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .UPDATE_BY ?? MRT_FilterFns.contains.name,
            NOTE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.NOTE ??
              MRT_FilterFns.contains.name
          }
        }
      })
    } catch (error) {
      resolve({
        searchFilters: {
          // TODO: Can change this value
          itemCategory: null,
          itemPurpose: null,
          itemGroup: null,
          vendor: null,
          maker: null,
          itemInternalCode: '',
          itemInternalFullName: '',
          itemInternalShortName: '',
          itemExternalCode: '',
          itemExternalFullName: '',
          itemExternalShortName: '',
          itemCodeForSupportMes: '',
          status: null,
          color: null,
          shape: null
        },
        searchResults: {
          pageSize: 10,
          columnFilters: [],
          sorting: [],
          density: 'comfortable',
          columnVisibility: {
            inuseForSearch: true,
            IMAGE: true,
            ITEM_CODE_FOR_SUPPORT_MES: true,
            VERSION_NO: true,
            ITEM_CATEGORY: true,
            ITEM_EXTERNAL_CODE: true,
            ITEM_EXTERNAL_FULL_NAME: true,
            ITEM_EXTERNAL_SHORT_NAME: true,
            ITEM_INTERNAL_FULL_NAME: true,
            ITEM_INTERNAL_SHORT_NAME: true,
            ITEM_PURPOSE_NAME: true,
            VENDOR_ALPHABET: true,
            PURCHASE_UNIT_RATIO: true,
            PURCHASE_UNIT_NAME: true,
            USAGE_UNIT_RATIO: true,
            USAGE_UNIT_NAME: true,
            MOQ: true,
            LEAD_TIME: true,
            SAFETY_STOCK: true,
            MAKER_NAME: true,
            ITEM_PROPERTY_COLOR_NAME: true,
            ITEM_PROPERTY_SHAPE_NAME: true,
            ITEM_GROUP_NAME: true,
            UPDATE_DATE: true,
            UPDATE_BY: true,
            NOTE: true
          },
          columnPinning: { left: [], right: [] },
          columnOrder: Array.from(columns),
          columnFilterFns: {
            inuseForSearch: MRT_FilterFns.contains.name,
            IMAGE: MRT_FilterFns.contains.name,
            ITEM_CODE_FOR_SUPPORT_MES: MRT_FilterFns.contains.name,
            VERSION_NO: MRT_FilterFns.contains.name,
            ITEM_CATEGORY: MRT_FilterFns.contains.name,
            ITEM_EXTERNAL_CODE: MRT_FilterFns.contains.name,
            ITEM_EXTERNAL_FULL_NAME: MRT_FilterFns.contains.name,
            ITEM_EXTERNAL_SHORT_NAME: MRT_FilterFns.contains.name,
            ITEM_INTERNAL_FULL_NAME: MRT_FilterFns.contains.name,
            ITEM_INTERNAL_SHORT_NAME: MRT_FilterFns.contains.name,
            ITEM_PURPOSE_NAME: MRT_FilterFns.contains.name,
            VENDOR_ALPHABET: MRT_FilterFns.contains.name,
            PURCHASE_UNIT_RATIO: MRT_FilterFns.contains.name,
            PURCHASE_UNIT_NAME: MRT_FilterFns.contains.name,
            USAGE_UNIT_RATIO: MRT_FilterFns.contains.name,
            USAGE_UNIT_NAME: MRT_FilterFns.contains.name,
            MOQ: MRT_FilterFns.contains.name,
            LEAD_TIME: MRT_FilterFns.contains.name,
            SAFETY_STOCK: MRT_FilterFns.contains.name,
            MAKER_NAME: MRT_FilterFns.contains.name,
            ITEM_PROPERTY_COLOR_NAME: MRT_FilterFns.contains.name,
            ITEM_PROPERTY_SHAPE_NAME: MRT_FilterFns.contains.name,
            ITEM_GROUP_NAME: MRT_FilterFns.contains.name,
            UPDATE_DATE: MRT_FilterFns.equals.name,
            UPDATE_BY: MRT_FilterFns.contains.name,
            NOTE: MRT_FilterFns.contains.name
          }
        }
      })
    }
  })
}
