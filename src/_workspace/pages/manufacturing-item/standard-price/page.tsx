// React Imports
import { useState } from 'react'

// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

// Components Imports
import StandardPriceSearch from './StandardPriceSearch'
import StandardPriceTableData from './StandardPriceTableData'
import StandardPriceWatch from './StandardPriceWatch'

// Third-party Imports
import { valibotResolver } from '@hookform/resolvers/valibot'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import {
  any,
  array,
  boolean,
  nullable,
  number,
  object,
  optional,
  picklist,
  record,
  string,
  union,
  unknown
} from 'valibot'

//@ts-ignore
import { MRT_FilterFns } from 'material-react-table'
import type { Input } from 'valibot'

// Env Imports
import { MENU_ID } from './env'

// Services Imports
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'

// Types Imports
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useUpdateEffect } from 'react-use'

import dayjs from 'dayjs'

const schema = object({
  searchFilters: object({
    ITEM_CODE_FOR_SUPPORT_MES: nullable(
      object({
        ITEM_MANUFACTURING_ID: number(),
        ITEM_CODE_FOR_SUPPORT_MES: string()
      })
    ),
    FISCAL_YEAR: nullable(string()),
    SCT_PATTERN: nullable(
      object({
        SCT_PATTERN_ID: number(),
        SCT_PATTERN_NAME: string()
      })
    ),
    vendor: nullable(
      object({
        VENDOR_ID: number(),
        VENDOR_NAME: string()
      })
    ),
    ITEM_IMPORT_TYPE: nullable(
      object({
        ITEM_IMPORT_TYPE_ID: number(),
        ITEM_IMPORT_TYPE_NAME: string()
      })
    ),
    itemInternalFullName: nullable(string()),
    itemInternalShortName: nullable(string())
  }),
  searchResults: object({
    pageSize: number(),
    columnFilters: array(
      object({
        id: string(),
        value: union([string(), unknown()])
      })
    ),
    sorting: array(
      object({
        desc: boolean(),
        id: string()
      })
    ),
    density: picklist(['comfortable', 'compact', 'spacious']),
    columnVisibility: record(string(), boolean()),
    columnPinning: object({
      left: optional(array(string())),
      right: optional(array(string()))
    }),
    columnOrder: array(string()),
    columnFilterFns: record(string(), any())
  })
})

export type FormData = Input<typeof schema>

const getUrlParamSearch = ({ USER_ID, APPLICATION_ID, MENU_ID }: UserProfileSettingProgramI): string => {
  let params = ``

  params += `"USER_ID":"${USER_ID}"`
  params += `, "APPLICATION_ID":"${APPLICATION_ID}"`
  params += `, "MENU_ID":"${MENU_ID}"`

  params = `{${params}}`

  return params
}

const paramForSearch: UserProfileSettingProgramI = {
  USER_ID: Number(getUserData().USER_ID),
  APPLICATION_ID: Number(import.meta.env.VITE_APPLICATION_ID),
  MENU_ID: MENU_ID
}

const columns = [
  'ITEM_CODE_FOR_SUPPORT_MES',
  'ITEM_M_S_PRICE_VALUE',
  'FISCAL_YEAR',
  'SCT_PATTERN_NAME',
  'VERSION',
  'IS_CURRENT',
  'VENDOR_NAME',
  'ITEM_IMPORT_TYPE_NAME',
  'VENDOR_ALPHABET',
  'PURCHASE_UNIT_CODE',
  'USAGE_UNIT_CODE',
  'ITEM_INTERNAL_SHORT_NAME',
  'ITEM_INTERNAL_FULL_NAME',
  'PURCHASE_PRICE',
  'PURCHASE_PRICE_CURRENCY_SYMBOL',
  'EXCHANGE_RATE_VALUE',
  'PURCHASE_UNIT_RATIO',
  'USAGE_UNIT_RATIO',
  'IMPORT_FEE_RATE',
  'ITEM_M_S_PRICE_CREATE_FROM_SETTING_NAME',
  'ITEM_VERSION_NO',
  'ITEM_IS_CURRENT',
  'UPDATE_DATE',
  'UPDATE_BY',
  'NOTE'
]

const StandardPrice = () => {
  const [isEnableFetching, setIsEnableFetching] = useState(false)

  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: async (): Promise<FormData> => {
      try {
        const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
          AxiosResponseI<UserProfileSettingProgramI<FormData>>
        >(getUrlParamSearch(paramForSearch))

        const columnsDifference = columns.filter(
          element =>
            !result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnOrder.includes(
              element
            )
        )

        const columnFilters =
          result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnFilters.map(
            (item: any) => {
              if (item.id === 'CREATE_DATE' || item.id === 'UPDATE_DATE' || item.id === 'UPDATE_DATE') {
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

        return {
          searchFilters: {
            ITEM_CODE_FOR_SUPPORT_MES:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
                .ITEM_CODE_FOR_SUPPORT_MES || null,
            FISCAL_YEAR:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.FISCAL_YEAR ?? '',
            SCT_PATTERN:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.SCT_PATTERN || null,
            vendor: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.VENDOR || null,
            ITEM_IMPORT_TYPE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.ITEM_IMPORT_TYPE || null,
            itemInternalFullName:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.ITEM_INTERNAL_FULL_NAME ||
              '',
            itemInternalShortName:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
                .ITEM_INTERNAL_SHORT_NAME || '',
            includingCancelled:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.includingCancelled ||
              false,
            manufacturingOption:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.manufacturingOption,
            status: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.status || null
          },
          searchResults: {
            pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            columnFilters: columnFilters || [],
            sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting || [],
            density:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density || 'comfortable',
            columnVisibility: {
              // ITEM_CODE_FOR_SUPPORT_MES:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .ITEM_CODE_FOR_SUPPORT_MES ?? true,
              // ITEM_INTERNAL_SHORT_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .ITEM_INTERNAL_SHORT_NAME ?? true,
              // PURCHASE_PRICE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .PURCHASE_PRICE ?? true,
              // EXCHANGE_RATE_VALUE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .EXCHANGE_RATE_VALUE ?? true,
              // IMPORT_FEE_RATE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .IMPORT_FEE_RATE ?? true,
              // ITEM_M_S_PRICE_VALUE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .ITEM_M_S_PRICE_VALUE ?? true,
              // UPDATE_DATE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .UPDATE_DATE ?? true,
              // UPDATE_BY:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .UPDATE_BY ?? true,
              // PURCHASE_UNIT_RATIO:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .PURCHASE_UNIT_RATIO ?? true,
              // USAGE_UNIT_RATIO:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .USAGE_UNIT_RATIO ?? true,
              // FISCAL_YEAR:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .FISCAL_YEAR ?? true,
              // SCT_PATTERN_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .SCT_PATTERN_NAME ?? true,
              // VERSION:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .VERSION ?? true,
              // VENDOR_ALPHABET:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .VENDOR_ALPHABET ?? true,
              // VENDOR_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .VENDOR_NAME ?? true,
              // ITEM_IMPORT_TYPE_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
              //     .ITEM_IMPORT_TYPE_NAME ?? true

              ITEM_CODE_FOR_SUPPORT_MES:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_CODE_FOR_SUPPORT_MES ?? true,
              ITEM_M_S_PRICE_VALUE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_M_S_PRICE_VALUE ?? true,
              FISCAL_YEAR:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .FISCAL_YEAR ?? true,
              SCT_PATTERN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .SCT_PATTERN_NAME ?? true,
              VERSION:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .VERSION ?? true,
              IS_CURRENT:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .IS_CURRENT ?? true,
              VENDOR_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .VENDOR_NAME ?? true,
              ITEM_IMPORT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_IMPORT_TYPE_NAME ?? true,
              VENDOR_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .VENDOR_ALPHABET ?? true,
              PURCHASE_UNIT_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PURCHASE_UNIT_CODE ?? true,
              USAGE_UNIT_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .USAGE_UNIT_CODE ?? true,
              ITEM_INTERNAL_SHORT_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_INTERNAL_SHORT_NAME ?? true,
              ITEM_INTERNAL_FULL_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_INTERNAL_FULL_NAME ?? true,
              PURCHASE_PRICE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PURCHASE_PRICE ?? true,
              PURCHASE_PRICE_CURRENCY_SYMBOL:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PURCHASE_PRICE_CURRENCY_SYMBOL ?? true,
              EXCHANGE_RATE_VALUE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .EXCHANGE_RATE_VALUE ?? true,
              PURCHASE_UNIT_RATIO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PURCHASE_UNIT_RATIO ?? true,
              USAGE_UNIT_RATIO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .USAGE_UNIT_RATIO ?? true,
              IMPORT_FEE_RATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .IMPORT_FEE_RATE ?? true,
              ITEM_M_S_PRICE_CREATE_FROM_SETTING_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_M_S_PRICE_CREATE_FROM_SETTING_NAME ?? true,
              ITEM_VERSION_NO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_VERSION_NO ?? true,
              ITEM_IS_CURRENT:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_IS_CURRENT ?? true,
              UPDATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .UPDATE_DATE ?? true,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .UPDATE_BY ?? true,
              NOTE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility.NOTE ??
                true
            },
            columnPinning: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults
              .columnPinning || { left: [], right: [] },
            columnOrder:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnOrder?.concat(
                columnsDifference
              ) || [],
            columnFilterFns: {
              ITEM_CODE_FOR_SUPPORT_MES:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_CODE_FOR_SUPPORT_MES ?? MRT_FilterFns.contains.name,
              ITEM_INTERNAL_SHORT_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_INTERNAL_SHORT_NAME ?? MRT_FilterFns.contains.name,
              PURCHASE_PRICE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PURCHASE_PRICE ?? MRT_FilterFns.contains.name,
              PURCHASE_PRICE_CURRENCY_SYMBOL:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PURCHASE_PRICE_CURRENCY_SYMBOL ?? MRT_FilterFns.contains.name,
              EXCHANGE_RATE_VALUE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .EXCHANGE_RATE_VALUE ?? MRT_FilterFns.contains.name,
              IMPORT_FEE_RATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .IMPORT_FEE_RATE ?? MRT_FilterFns.contains.name,
              ITEM_M_S_PRICE_VALUE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_M_S_PRICE_VALUE ?? MRT_FilterFns.contains.name,
              UPDATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_DATE ?? MRT_FilterFns.equals.name,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_BY ?? MRT_FilterFns.contains.name,
              PURCHASE_UNIT_RATIO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PURCHASE_UNIT_RATIO ?? MRT_FilterFns.contains.name,
              USAGE_UNIT_RATIO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .USAGE_UNIT_RATIO ?? MRT_FilterFns.contains.name,
              FISCAL_YEAR:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .FISCAL_YEAR ?? MRT_FilterFns.contains.name,
              SCT_PATTERN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .SCT_PATTERN_NAME ?? MRT_FilterFns.contains.name,
              VERSION:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .VERSION ?? MRT_FilterFns.contains.name,
              VENDOR_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .VENDOR_ALPHABET ?? MRT_FilterFns.contains.name,
              VENDOR_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .VENDOR_NAME ?? MRT_FilterFns.contains.name,
              ITEM_IMPORT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_IMPORT_TYPE_NAME ?? MRT_FilterFns.contains.name,
              NOTE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.NOTE ??
                MRT_FilterFns.contains.name
            }
          }
        }
      } catch (error) {
        return {
          searchFilters: {
            ITEM_CODE_FOR_SUPPORT_MES: null,
            FISCAL_YEAR: '',
            SCT_PATTERN: null,
            vendor: null,
            ITEM_IMPORT_TYPE: null,
            itemInternalFullName: '',
            itemInternalShortName: '',
            includingCancelled: false,
            manufacturingOption: null,
            status: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'comfortable',
            columnVisibility: {
              ITEM_CODE_FOR_SUPPORT_MES: true,
              ITEM_M_S_PRICE_VALUE: true,
              FISCAL_YEAR: true,
              SCT_PATTERN_NAME: true,
              VERSION: true,
              IS_CURRENT: true,
              VENDOR_NAME: true,
              ITEM_IMPORT_TYPE_NAME: true,
              VENDOR_ALPHABET: true,
              PURCHASE_UNIT_CODE: true,
              USAGE_UNIT_CODE: true,
              ITEM_INTERNAL_SHORT_NAME: true,
              ITEM_INTERNAL_FULL_NAME: true,
              PURCHASE_PRICE: true,
              PURCHASE_PRICE_CURRENCY_SYMBOL: true,
              EXCHANGE_RATE_VALUE: true,
              PURCHASE_UNIT_RATIO: true,
              USAGE_UNIT_RATIO: true,
              IMPORT_FEE_RATE: true,
              ITEM_M_S_PRICE_CREATE_FROM_SETTING_NAME: true,
              ITEM_VERSION_NO: true,
              ITEM_IS_CURRENT: true,
              UPDATE_DATE: true,
              UPDATE_BY: true,
              NOTE: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              ITEM_CODE_FOR_SUPPORT_MES: MRT_FilterFns.contains.name,
              ITEM_M_S_PRICE_VALUE: MRT_FilterFns.contains.name,
              FISCAL_YEAR: MRT_FilterFns.contains.name,
              SCT_PATTERN_NAME: MRT_FilterFns.contains.name,
              VERSION: MRT_FilterFns.contains.name,
              IS_CURRENT: MRT_FilterFns.contains.name,
              VENDOR_NAME: MRT_FilterFns.contains.name,
              ITEM_IMPORT_TYPE_NAME: MRT_FilterFns.contains.name,
              VENDOR_ALPHABET: MRT_FilterFns.contains.name,
              PURCHASE_UNIT_CODE: MRT_FilterFns.contains.name,
              USAGE_UNIT_CODE: MRT_FilterFns.contains.name,
              ITEM_INTERNAL_SHORT_NAME: MRT_FilterFns.contains.name,
              ITEM_INTERNAL_FULL_NAME: MRT_FilterFns.contains.name,
              PURCHASE_PRICE: MRT_FilterFns.contains.name,
              PURCHASE_PRICE_CURRENCY_SYMBOL: MRT_FilterFns.contains.name,
              EXCHANGE_RATE_VALUE: MRT_FilterFns.contains.name,
              PURCHASE_UNIT_RATIO: MRT_FilterFns.contains.name,
              USAGE_UNIT_RATIO: MRT_FilterFns.contains.name,
              IMPORT_FEE_RATE: MRT_FilterFns.contains.name,
              ITEM_M_S_PRICE_CREATE_FROM_SETTING_NAME: MRT_FilterFns.contains.name,
              ITEM_VERSION_NO: MRT_FilterFns.contains.name,
              ITEM_IS_CURRENT: MRT_FilterFns.contains.name,
              UPDATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_BY: MRT_FilterFns.contains.name,
              NOTE: MRT_FilterFns.contains.name
            }
          }
        }
      }
    }
  })

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoading])

  const breadcrumbs = [
    <Typography
      key='1'
      sx={{
        color: 'var(--mui-pallet-text-secondary) !important'
      }}
    >
      Home
    </Typography>,
    <Typography
      key='2'
      sx={{
        color: 'var(--mui-palette-text-secondary) !important'
      }}
    >
      Manufacturing Item
    </Typography>,
    <Typography
      key='3'
      sx={{
        color: 'var(--mui-palette-text-primary) !important'
      }}
    >
      Manufacturing Item Price
    </Typography>
  ]

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography
            variant='h4'
            sx={{
              display: 'inline-block'
            }}
          >
            Manufacturing Item Price
          </Typography>
          <Divider orientation='vertical' className='mx-4' />
          <Breadcrumbs
            separator='›'
            aria-label='breadcrumb'
            sx={{
              display: 'inline-block'
            }}
          >
            {breadcrumbs}
          </Breadcrumbs>
          {isLoading ? null : <StandardPriceWatch />}
        </Grid>
        <Grid item xs={12}>
          <StandardPriceSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            'Loading'
          ) : (
            <StandardPriceTableData isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default StandardPrice
