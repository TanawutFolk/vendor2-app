import { z } from 'zod'

import { MRT_FilterFns } from 'material-react-table'

import dayjs from 'dayjs'

import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// TODO: Can change this value
// const columns = [
//   'mrt-row-actions',
//   'mrt-row-select',

//   'Cal SCT',
//   'IS_REFRESH_DATA_MASTER',

//   'SCT_STATUS_PROGRESS_NAME',
//   'PRODUCT_TYPE_CODE',
//   'FISCAL_YEAR',
//   'SCT_PATTERN_NAME',

//   'SCT_REVISION_CODE',
//   'SELLING_PRICE',

//   'CUSTOMER_INVOICE_TO_ALPHABET',
//   'CUSTOMER_INVOICE_TO_NAME',

//   'SCT_REASON_SETTING_NAME',
//   'SCT_TAG_SETTING_NAME',

//   'ESTIMATE_PERIOD_START_DATE',
//   'ESTIMATE_PERIOD_END_DATE',

//   'PRODUCT_CATEGORY_NAME',
//   'PRODUCT_MAIN_NAME',
//   'PRODUCT_SUB_NAME',
//   'PRODUCT_TYPE_NAME',

//   'ITEM_CATEGORY_NAME',

//   'BOM_CODE',
//   'FLOW_CODE',

//   'ASSEMBLY_GROUP_FOR_SUPPORT_MES',

//   'NOTE',
//   'DESCRIPTION',

//   'UPDATE_BY',
//   'UPDATE_DATE',
//   'CREATE_BY',
//   'CREATE_DATE',

//   'STATUS_UPDATE_BY',
//   'STATUS_UPDATE_DATE',

//   'RECAL_UPDATE_BY',
//   'RECAL_UPDATE_DATE',

//   'CANCEL_REASON'
// ] as const
const columns = [
  'mrt-row-actions',
  'mrt-row-select',

  // --- ซ้าย ---
  'Cal_SCT',
  'SCT_STATUS_PROGRESS_NAME',
  'IS_REFRESH_DATA_MASTER',

  'PRODUCT_TYPE_CODE',
  'FISCAL_YEAR',
  'SCT_PATTERN_NAME',
  'SCT_REVISION_CODE',

  'BOM_CODE',
  'FLOW_CODE',

  'RE_CAL_UPDATE_DATE',
  'RE_CAL_UPDATE_BY',

  'SELLING_PRICE',
  'ADJUST_PRICE',

  'TOTAL_INDIRECT_COST',
  'INDIRECT_COST_MODE',

  'SCT_REASON_SETTING_NAME',
  'SCT_TAG_SETTING_NAME',

  'ESTIMATE_PERIOD_START_DATE',
  'ESTIMATE_PERIOD_END_DATE',

  // --- ขวา ---
  'CUSTOMER_INVOICE_TO_ALPHABET',
  'CUSTOMER_INVOICE_TO_NAME',

  'PRODUCT_CATEGORY_NAME',
  'PRODUCT_MAIN_NAME',
  'PRODUCT_SUB_NAME',
  'PRODUCT_TYPE_NAME',

  'ITEM_CATEGORY_NAME',

  'ASSEMBLY_GROUP_FOR_SUPPORT_MES',

  'NOTE',
  'DESCRIPTION',

  'UPDATE_DATE',
  'UPDATE_BY',

  'STATUS_UPDATE_DATE',
  'STATUS_UPDATE_BY',

  'CREATE_DATE',
  'CREATE_BY',

  'CANCEL_REASON'
] as const

// TODO: Can change this value
const searchFiltersSchema = z.object({
  // ?? Header
  // SCT Revision Code
  sctRevisionCode: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'SCT Revision Code' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Revision Code' })
    })
    .nullish()
    .nullable(),

  sctLatestRevisionOption: z
    .object({
      value: z.enum(['All', 'Latest'], {
        required_error: requiredFieldMessage({ fieldName: 'Option - SCT Revision Code' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Option - SCT Revision Code' })
      }),
      label: z.string({
        required_error: requiredFieldMessage({ fieldName: 'Option - SCT Revision Code' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Option - SCT Revision Code' })
      }),
      icon: z.string({
        required_error: requiredFieldMessage({ fieldName: 'Option - SCT Revision Code' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Option - SCT Revision Code' })
      })
    })
    .nullish()
    .nullable(),

  // Fiscal Year
  fiscalYear: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Fiscal Year' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Fiscal Year' })
    })
    .nullish()
    .nullable(),

  // SCT Reason
  sctReasonSetting: z
    .object({
      SCT_REASON_SETTING_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'SCT Reason' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Reason' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'SCT Reason' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'SCT Reason' }) }), // > 0)
      SCT_REASON_SETTING_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'SCT Reason' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Reason' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'SCT Reason' }))
    })
    .nullish()
    .nullable(),

  // SCT Tag
  sctTagSetting: z
    .object({
      SCT_TAG_SETTING_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'SCT Tag' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Tag' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'SCT Tag' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'SCT Tag' }) }), // > 0)
      SCT_TAG_SETTING_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'SCT Tag' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Tag' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'SCT Tag' }))
    })
    .nullish()
    .nullable(),

  // SCT Pattern
  sctPattern: z
    .object({
      SCT_PATTERN_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'SCT Pattern' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Pattern' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'SCT Pattern' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'SCT Pattern' }) }), // > 0)
      SCT_PATTERN_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'SCT Pattern' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Pattern' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'SCT Pattern' }))
    })
    .nullish()
    .nullable(),

  // ?? Product Group
  // Product Category
  productCategory: z
    .object({
      PRODUCT_CATEGORY_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Product Category' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Product Category' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Product Category' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Product Category' }) }), // > 0)
      PRODUCT_CATEGORY_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Product Category' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Product Category' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Product Category' }))
    })
    .nullish()
    .nullable(),

  // Product Main
  productMain: z
    .object({
      PRODUCT_MAIN_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Product Main' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Product Main' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Product Main' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Product Main' }) }), // > 0)
      PRODUCT_MAIN_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Product Main' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Product Main' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Product Main' }))
    })
    .nullish()
    .nullable(),

  // Product Sub
  productSub: z
    .object({
      PRODUCT_SUB_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Product Sub' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Product Sub' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Product Sub' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Product Sub' }) }), // > 0)
      PRODUCT_SUB_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Product Sub' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Product Sub' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Product Sub' }))
    })
    .nullish()
    .nullable(),

  // Product Type
  productType: z
    .object({
      PRODUCT_TYPE_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Product Type' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Product Type' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Product Type' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Product Type' }) }), // > 0)
      PRODUCT_TYPE_CODE: z.string({
        required_error: requiredFieldMessage({ fieldName: 'Product Type' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Product Type' })
      }),
      PRODUCT_TYPE_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Product Type' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Product Type' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Product Type' }))
    })
    .nullish()
    .nullable(),

  // Product Category
  customerInvoice: z
    .object({
      CUSTOMER_INVOICE_TO_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Customer Invoice' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Customer Invoice' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Customer Invoice' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'Customer Invoice' }) }), // > 0)
      CUSTOMER_INVOICE_TO_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Customer Invoice' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Customer Invoice' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Customer Invoice' }))
    })
    .nullish()
    .nullable(),

  // ?? Objective
  // Item Category
  itemCategory: z
    .object({
      ITEM_CATEGORY_ID: z.number({
        required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
      }),
      ITEM_CATEGORY_NAME: z.string({
        required_error: requiredFieldMessage({ fieldName: 'Item Category' }),
        invalid_type_error: requiredFieldMessage({ fieldName: 'Item Category' })
      })
    })
    .nullish()
    .nullable(),

  // Production Specification Type
  productionSpecificationType: z
    .string({
      required_error: requiredFieldMessage({ fieldName: 'Production Specification Type' }),
      invalid_type_error: requiredFieldMessage({ fieldName: 'Production Specification Type' })
    })
    .nullish()
    .nullable(),

  // ?? Other
  // SCT Progress Working
  sctStatusProgress: z
    .object({
      SCT_STATUS_PROGRESS_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'SCT Progress Working' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Progress Working' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'SCT Progress Working' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'SCT Progress Working' }) }), // > 0)
      SCT_STATUS_PROGRESS_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'SCT Progress Working' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Progress Working' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'SCT Progress Working' }))
    })
    .nullish()
    .nullable(),

  includingCancelled: z.boolean({
    required_error: requiredFieldMessage({ fieldName: 'Including Cancelled' }),
    invalid_type_error: requiredFieldMessage({ fieldName: 'Including Cancelled' })
  }),

  alreadyHaveSellingPrice: z
    .object({
      value: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'Already have a Item Price ?' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Already have a Item Price ?' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'Already have a Item Price ?' }) }), // value must be an integer
      // .positive({ message: requiredFieldMessage({ fieldName: 'Already have a Item Price ?' }) }), // > 0)
      label: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'Already have a Item Price ?' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'Already have a Item Price ?' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'Already have a Item Price ?' }))
    })
    .nullish()
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
  }),

  // helper
  TABLE_CHANGE_STATUS_TO: z
    .object({
      SCT_STATUS_PROGRESS_ID: z
        .number({
          required_error: requiredFieldMessage({ fieldName: 'SCT Progress Working' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Progress Working' })
        })
        .int({ message: requiredFieldMessage({ fieldName: 'SCT Progress Working' }) }) // value must be an integer
        .positive({ message: requiredFieldMessage({ fieldName: 'SCT Progress Working' }) }), // > 0)
      SCT_STATUS_PROGRESS_NAME: z
        .string({
          required_error: requiredFieldMessage({ fieldName: 'SCT Progress Working' }),
          invalid_type_error: requiredFieldMessage({ fieldName: 'SCT Progress Working' })
        })
        .min(1, requiredFieldMessage({ fieldName: 'SCT Progress Working' }))
    })
    .nullish()
    .nullable()
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
              const value = (item?.value as string) ?? ''

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
          sctRevisionCode:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.sctRevisionCode,
          sctLatestRevisionOption: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
            ?.sctLatestRevisionOption ?? {
            value: 'All',
            label: 'All',
            icon: 'tabler-checks'
          },
          fiscalYear: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.fiscalYear,
          sctReasonSetting:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.sctReasonSetting,
          sctTagSetting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.sctTagSetting,
          sctPattern: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.sctPattern,
          productCategory:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.productCategory,
          productMain: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.productMain,
          productSub: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.productSub,
          productType: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.productType,
          itemCategory: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.itemCategory,
          productionSpecificationType:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
              ?.productionSpecificationType,
          customerInvoice:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.customerInvoice,
          sctStatusProgress:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.sctStatusProgress,
          includingCancelled:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.includingCancelled ??
            false,
          alreadyHaveSellingPrice:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters?.alreadyHaveSellingPrice
        },
        searchResults: {
          pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize ?? 10,
          columnFilters: columnFilters ?? [],
          sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting ?? [],
          density: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density ?? 'compact',
          columnVisibility: {
            Cal_SCT:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.Cal_SCT ?? true,
            IS_REFRESH_DATA_MASTER:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.IS_REFRESH_DATA_MASTER ?? true,
            RE_CAL_UPDATE_BY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.RE_CAL_UPDATE_BY ?? true,
            ADJUST_PRICE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.ADJUST_PRICE ?? true,
            TOTAL_INDIRECT_COST:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.TOTAL_INDIRECT_COST ?? true,
            STATUS_UPDATE_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.STATUS_UPDATE_DATE ?? true,
            STATUS_UPDATE_BY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.STATUS_UPDATE_BY ?? true,
            CANCEL_REASON:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.CANCEL_REASON ?? true,

            NOTE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility?.NOTE ??
              true,
            DESCRIPTION:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.DESCRIPTION ?? true,
            SCT_STATUS_PROGRESS_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.SCT_STATUS_PROGRESS_NAME ?? true,
            PRODUCT_CATEGORY_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.PRODUCT_CATEGORY_NAME ?? true,
            PRODUCT_MAIN_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.PRODUCT_MAIN_NAME ?? true,
            PRODUCT_SUB_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.PRODUCT_SUB_NAME ?? true,
            PRODUCT_TYPE_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.PRODUCT_TYPE_NAME ?? true,
            PRODUCT_TYPE_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.PRODUCT_TYPE_CODE ?? true,
            FISCAL_YEAR:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.FISCAL_YEAR ?? true,
            SCT_PATTERN_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.SCT_PATTERN_NAME ?? true,
            INDIRECT_COST_MODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.INDIRECT_COST_MODE ?? true,
            SCT_REVISION_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.SCT_REVISION_CODE ?? true,
            SELLING_PRICE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.SELLING_PRICE ?? true,
            RE_CAL_UPDATE_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.RE_CAL_UPDATE_DATE ?? true,
            CUSTOMER_INVOICE_TO_ALPHABET:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.CUSTOMER_INVOICE_TO_ALPHABET ?? true,
            CUSTOMER_INVOICE_TO_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.CUSTOMER_INVOICE_TO_NAME ?? true,
            SCT_REASON_SETTING_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.SCT_REASON_SETTING_NAME ?? true,
            SCT_TAG_SETTING_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.SCT_TAG_SETTING_NAME ?? true,
            ESTIMATE_PERIOD_START_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.ESTIMATE_PERIOD_START_DATE ?? true,
            ESTIMATE_PERIOD_END_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.ESTIMATE_PERIOD_END_DATE ?? true,
            BOM_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.BOM_CODE ?? true,
            ITEM_CATEGORY_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.ITEM_CATEGORY_NAME ?? true,
            FLOW_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.FLOW_CODE ?? true,
            ASSEMBLY_GROUP_FOR_SUPPORT_MES:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.ASSEMBLY_GROUP_FOR_SUPPORT_MES ?? true,
            CREATE_BY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.CREATE_BY ?? true,
            UPDATE_BY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.UPDATE_BY ?? true,
            CREATE_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnVisibility
                ?.CREATE_DATE ?? true,
            UPDATE_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                ?.UPDATE_DATE ?? true
          },
          columnPinning: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults
            .columnPinning ?? { left: [], right: [] },
          columnOrder:
            result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnOrder?.concat(
              columnsDifference
            ) ?? [],
          columnFilterFns: {
            PRODUCT_CATEGORY_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .PRODUCT_CATEGORY_NAME ?? MRT_FilterFns.contains.name,
            PRODUCT_MAIN_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .PRODUCT_MAIN_NAME ?? MRT_FilterFns.contains.name,
            PRODUCT_TYPE_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .PRODUCT_TYPE_CODE ?? MRT_FilterFns.contains.name,
            SCT_STATUS_PROGRESS_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .SCT_STATUS_PROGRESS_NAME ?? MRT_FilterFns.contains.name,
            FISCAL_YEAR:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .FISCAL_YEAR ?? MRT_FilterFns.contains.name,
            SCT_PATTERN_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .SCT_PATTERN_NAME ?? MRT_FilterFns.contains.name,
            INDIRECT_COST_MODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .INDIRECT_COST_MODE ?? MRT_FilterFns.contains.name,
            SCT_REVISION_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .SCT_REVISION_CODE ?? MRT_FilterFns.contains.name,
            SELLING_PRICE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .SELLING_PRICE ?? MRT_FilterFns.contains.name,
            RE_CAL_UPDATE_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .RE_CAL_UPDATE_DATE ?? MRT_FilterFns.contains.name,
            CUSTOMER_INVOICE_TO_ALPHABET:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .CUSTOMER_INVOICE_TO_ALPHABET ?? MRT_FilterFns.contains.name,
            CUSTOMER_INVOICE_TO_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .CUSTOMER_INVOICE_TO_NAME ?? MRT_FilterFns.contains.name,
            SCT_REASON_SETTING_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .SCT_REASON_SETTING_NAME ?? MRT_FilterFns.contains.name,
            SCT_TAG_SETTING_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .SCT_TAG_SETTING_NAME ?? MRT_FilterFns.contains.name,
            ESTIMATE_PERIOD_START_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ESTIMATE_PERIOD_START_DATE ?? MRT_FilterFns.contains.name,
            ESTIMATE_PERIOD_END_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ESTIMATE_PERIOD_END_DATE ?? MRT_FilterFns.contains.name,
            PRODUCT_SUB_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .PRODUCT_SUB_NAME ?? MRT_FilterFns.contains.name,
            PRODUCT_TYPE_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .PRODUCT_TYPE_NAME ?? MRT_FilterFns.contains.name,
            ITEM_CATEGORY_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ITEM_CATEGORY_NAME ?? MRT_FilterFns.contains.name,
            BOM_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .BOM_CODE ?? MRT_FilterFns.contains.name,
            FLOW_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .FLOW_CODE ?? MRT_FilterFns.contains.name,
            ASSEMBLY_GROUP_FOR_SUPPORT_MES:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .ASSEMBLY_GROUP_FOR_SUPPORT_MES ?? MRT_FilterFns.contains.name,
            NOTE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.NOTE ??
              MRT_FilterFns.contains.name,
            DESCRIPTION:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .DESCRIPTION ?? MRT_FilterFns.contains.name,

            CREATE_BY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .CREATE_BY ?? MRT_FilterFns.contains.name,
            UPDATE_BY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .UPDATE_BY ?? MRT_FilterFns.contains.name,
            CREATE_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .CREATE_DATE ?? MRT_FilterFns.equals.name,
            UPDATE_DATE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                .UPDATE_DATE ?? MRT_FilterFns.equals.name
          }
        }
      })
    } catch (error) {
      resolve({
        searchFilters: {
          // TODO: Can change this value
          sctRevisionCode: '',
          sctLatestRevisionOption: {
            value: 'All',
            label: 'All',
            icon: 'tabler-checks'
          },
          fiscalYear: '',
          sctReasonSetting: null,
          sctTagSetting: null,
          sctPattern: null,
          productCategory: null,
          productMain: null,
          productSub: null,
          productType: null,
          itemCategory: null,
          productionSpecificationType: '',
          customerInvoice: null,
          sctStatusProgress: null,
          includingCancelled: false,
          alreadyHaveSellingPrice: null
        },
        searchResults: {
          pageSize: 10,
          columnFilters: [],
          sorting: [],
          density: 'comfortable',
          columnVisibility: {
            PRODUCT_CATEGORY_NAME: true,
            PRODUCT_MAIN_NAME: true,
            SCT_STATUS_PROGRESS_NAME: true,
            PRODUCT_TYPE_CODE: true,
            FISCAL_YEAR: true,
            SCT_PATTERN_NAME: true,
            INDIRECT_COST_MODE: true,
            SCT_REVISION_CODE: true,
            SELLING_PRICE: true,
            RE_CAL_UPDATE_DATE: true,
            CUSTOMER_INVOICE_TO_ALPHABET: true,
            CUSTOMER_INVOICE_TO_NAME: true,
            SCT_REASON_SETTING_NAME: true,
            SCT_TAG_SETTING_NAME: true,
            ESTIMATE_PERIOD_START_DATE: true,
            ESTIMATE_PERIOD_END_DATE: true,
            PRODUCT_SUB_NAME: true,
            PRODUCT_TYPE_NAME: true,
            ITEM_CATEGORY_NAME: true,
            BOM_CODE: true,
            FLOW_CODE: true,
            ASSEMBLY_GROUP_FOR_SUPPORT_MES: true,
            NOTE: true,
            DESCRIPTION: true,
            CREATE_BY: true,
            CREATE_DATE: true,
            UPDATE_DATE: true,
            UPDATE_BY: true,

            //             Cal_SCT

            // IS_REFRESH_DATA_MASTER

            // RECAL_UPDATE_BY

            // ADJUST_PRICE

            // TOTAL_INDIRECT_COST

            // STATUS_UPDATE_DATE

            // STATUS_UPDATE_BY

            // CANCEL_REASON

            // mrt-row-actions

            // mrt-row-select

            Cal_SCT: true,
            IS_REFRESH_DATA_MASTER: true,
            RE_CAL_UPDATE_BY: true,
            ADJUST_PRICE: true,
            TOTAL_INDIRECT_COST: true,
            STATUS_UPDATE_DATE: true,
            STATUS_UPDATE_BY: true,
            CANCEL_REASON: true
          },
          columnPinning: { left: [], right: [] },
          columnOrder: Array.from(columns),
          columnFilterFns: {
            PRODUCT_CATEGORY_NAME: MRT_FilterFns.contains.name,
            PRODUCT_MAIN_NAME: MRT_FilterFns.contains.name,
            SCT_STATUS_PROGRESS_NAME: MRT_FilterFns.contains.name,
            PRODUCT_TYPE_CODE: MRT_FilterFns.contains.name,
            FISCAL_YEAR: MRT_FilterFns.contains.name,
            SCT_PATTERN_NAME: MRT_FilterFns.contains.name,
            INDIRECT_COST_MODE: MRT_FilterFns.contains.name,
            SCT_REVISION_CODE: MRT_FilterFns.contains.name,
            SELLING_PRICE: MRT_FilterFns.contains.name,
            RE_CAL_UPDATE_DATE: MRT_FilterFns.contains.name,
            CUSTOMER_INVOICE_TO_ALPHABET: MRT_FilterFns.contains.name,
            CUSTOMER_INVOICE_TO_NAME: MRT_FilterFns.contains.name,
            SCT_REASON_SETTING_NAME: MRT_FilterFns.contains.name,
            SCT_TAG_SETTING_NAME: MRT_FilterFns.contains.name,
            ESTIMATE_PERIOD_START_DATE: MRT_FilterFns.contains.name,
            ESTIMATE_PERIOD_END_DATE: MRT_FilterFns.contains.name,
            PRODUCT_SUB_NAME: MRT_FilterFns.contains.name,
            PRODUCT_TYPE_NAME: MRT_FilterFns.contains.name,
            ITEM_CATEGORY_NAME: MRT_FilterFns.contains.name,
            BOM_CODE: MRT_FilterFns.contains.name,
            FLOW_CODE: MRT_FilterFns.contains.name,
            ASSEMBLY_GROUP_FOR_SUPPORT_MES: MRT_FilterFns.contains.name,
            NOTE: MRT_FilterFns.contains.name,
            DESCRIPTION: MRT_FilterFns.contains.name,
            CREATE_BY: MRT_FilterFns.contains.name,
            CREATE_DATE: MRT_FilterFns.contains.name,
            UPDATE_DATE: MRT_FilterFns.contains.name,
            UPDATE_BY: MRT_FilterFns.contains.name
          }
        }
      })
    }
  })
}

// react-query
// const handleAdd = () => {
//   const dataItem = {
//     USER_ID: getUserData().USER_ID,
//     APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
//     MENU_ID: MENU_ID.toString(),
//     USER_PROFILE_SETTING_PROGRAM_DATA: {
//       searchFilters: {
//         // customerOrderFromId: getValues('searchFilters.customerOrderFromId'),
//         productCategory: getValues('searchFilters.productCategory'),
//         productMainName: getValues('searchFilters.productMainName'),
//         productMainCode: getValues('searchFilters.productMainCode'),
//         productMainAlphabet: getValues('searchFilters.productMainAlphabet'),
//         status: getValues('searchFilters.status')
//       },
//       searchResults: {
//         pageSize: getValues('searchResults.pageSize'),
//         columnFilters: getValues('searchResults.columnFilters'),
//         sorting: getValues('searchResults.sorting'),
//         density: getValues('searchResults.density'),
//         columnVisibility: getValues('searchResults.columnVisibility'),
//         columnPinning: getValues('searchResults.columnPinning'),
//         columnOrder: getValues('searchResults.columnOrder'),
//         columnFilterFns: getValues('searchResults.columnFilterFns')
//       }
//     } as FormData
//   }

//   mutate(dataItem)
// }
