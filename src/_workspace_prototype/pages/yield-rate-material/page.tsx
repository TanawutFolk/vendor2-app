// React Imports
import { useState } from 'react'

// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

// Components Imports
//import ProcessSearch from './ProcessSearch'
//import ProcessWatch from './ProcessWatch'
//import ProcessTableData from './ProcessTableData'

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
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useUpdateEffect } from 'react-use'

import dayjs from 'dayjs'
import YieldRateDataTable from './YieldRateMaterialDataTable'
import YieldRateSearch from './YieldRateMaterialSearch'

const schema = object({
  searchFilters: object({
    PRODUCT_MAIN: nullable(
      object({
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string()
      })
    ),
    PROCESS_CODE: nullable(string()),
    PROCESS_NAME: nullable(string()),
    INUSE: nullable(
      object({
        value: number(),
        label: string()
      })
    )
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
  'mrt-row-actions',
  'inuseForSearch',
  'PRODUCT_CATEGORY_NAME',
  'PRODUCT_MAIN_NAME',
  'PRODUCT_SUB_NAME',
  'PRODUCT_TYPE_NAME',
  'PRODUCT_TYPE_CODE',
  'FISCAL_YEAR',
  'YIELD_ACCUMULATION_OF_ITEM_FOR_SCT',
  'ITEM_CODE_FOR_SUPPORT_MES',
  'ITEM_INTERNAL_SHORT_NAME',
  'ITEM_INTERNAL_FULL_NAME',
  'REVISION_NO',
  'MODIFIED_DATE',
  'UPDATE_BY'
]

const MainPage = () => {
  // State
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

        return {
          searchFilters: {
            PRODUCT_MAIN:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.PRODUCT_MAIN || null,
            PROCESS_CODE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.PROCESS_CODE || '',
            PROCESS_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.PROCESS_NAME || '',
            INUSE: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.INUSE || null
          },
          searchResults: {
            pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            columnFilters: columnFilters || [],
            sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting || [],
            density:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density || 'comfortable',
            columnVisibility: {
              inuseForSearch:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .inuseForSearch ?? true,

              FISCAL_YEAR:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .FISCAL_YEAR ?? true,
              PRODUCT_CATEGORY_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_CATEGORY_NAME ?? true,
              PRODUCT_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_MAIN_NAME ?? true,
              PRODUCT_SUB_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_SUB_NAME ?? true,
              PRODUCT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_TYPE_NAME ?? true,
              PRODUCT_TYPE_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_TYPE_CODE ?? true,
              ITEM_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_ID ?? false,
              YIELD_ACCUMULATION_OF_ITEM_FOR_SCT:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .YIELD_ACCUMULATION_OF_ITEM_FOR_SCT ?? true,
              ITEM_CODE_FOR_SUPPORT_MES:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_CODE_FOR_SUPPORT_MES ?? true,
              ITEM_INTERNAL_SHORT_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_INTERNAL_SHORT_NAME ?? true,
              ITEM_INTERNAL_FULL_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_INTERNAL_FULL_NAME ?? true,
              REVISION_NO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .REVISION_NO ?? true,
              MODIFIED_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .MODIFIED_DATE ?? true,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .UPDATE_BY ?? true
            },
            columnPinning: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults
              .columnPinning || { left: [], right: [] },
            columnOrder:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnOrder?.concat(
                columnsDifference
              ) || [],
            columnFilterFns: {
              inuseForSearch:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .inuseForSearch ?? MRT_FilterFns.contains.name,
              PRODUCT_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_MAIN_NAME ?? MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_CATEGORY_NAME ?? MRT_FilterFns.contains.name,
              PRODUCT_SUB_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_SUB_NAME ?? MRT_FilterFns.contains.name,
              PRODUCT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_TYPE_NAME ?? MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_TYPE_CODE ?? MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE_FOR_SCT:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_TYPE_CODE_FOR_SCT ?? MRT_FilterFns.contains.name,
              FISCAL_YEAR:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .FISCAL_YEAR ?? MRT_FilterFns.contains.name,
              ITEM_CODE_FOR_SUPPORT_MES:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_CODE_FOR_SUPPORT_MES ?? MRT_FilterFns.contains.name,
              ITEM_INTERNAL_SHORT_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_INTERNAL_SHORT_NAME ?? MRT_FilterFns.contains.name,
              ITEM_INTERNAL_FULL_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_INTERNAL_FULL_NAME ?? MRT_FilterFns.contains.name,
              REVISION_NO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .REVISION_NO ?? MRT_FilterFns.contains.name,
              MODIFIED_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .MODIFIED_DATE ?? MRT_FilterFns.equals.name,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_BY ?? MRT_FilterFns.contains.name
            }
          }
        }
      } catch (error) {
        return {
          searchFilters: {
            PRODUCT_MAIN: null,
            PROCESS_CODE: '',
            PROCESS_NAME: '',
            INUSE: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'comfortable',
            columnVisibility: {
              inuseForSearch: true,
              PRODUCT_MAIN_NAME: true,
              PROCESS_ID: false,
              PROCESS_CODE: true,
              PROCESS_NAME: true,
              MODIFIED_DATE: true,
              UPDATE_BY: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              inuseForSearch: MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_NAME: MRT_FilterFns.contains.name,
              PRODUCT_MAIN_NAME: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_NAME: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE_FOR_SCT: MRT_FilterFns.contains.name,
              FLOW_CODE: MRT_FilterFns.contains.name,
              FLOW_NAME: MRT_FilterFns.contains.name,
              FLOW_PROCESS_NO: MRT_FilterFns.contains.name,
              COLLECTION_POINT_FOR_SCT: MRT_FilterFns.contains.name,
              REVISION_NO: MRT_FilterFns.contains.name,
              PROCESS_CODE: MRT_FilterFns.contains.name,
              PROCESS_NAME: MRT_FilterFns.contains.name,
              MODIFIED_DATE: MRT_FilterFns.equals.name,
              UPDATE_BY: MRT_FilterFns.contains.name
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
      color='text.primary'
      sx={{
        color: 'var(--mui-palette-text-primary) !important'
      }}
    >
      Yield Rate Material
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
          <Typography variant='h4'>Yield Rate Material</Typography>
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
          {/* {isLoading ? null : <ProcessWatch />} */}
        </Grid>
        <Grid item xs={12}>
          <YieldRateSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            'Loading'
          ) : (
            <YieldRateDataTable isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default MainPage
