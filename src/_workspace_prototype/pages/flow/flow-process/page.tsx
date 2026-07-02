// React Imports
import { useState } from 'react'

// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

// Components Imports
import FlowProcessSearch from './FlowProcessSearch'
import FlowProcessWatch from './FlowProcessWatch'
import FlowProcessTableData from './FlowProcessTableData'

// Third-party Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
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
import type { Input } from 'valibot'
import { MRT_FilterFns } from 'material-react-table'

// Env Imports
import { MENU_ID } from './env'

// Services Imports
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'

// Types Imports
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useUpdateEffect } from 'react-use'

import dayjs from 'dayjs'

const schema = object({
  searchFilters: object({
    PRODUCT_MAIN: nullable(
      object({
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string()
      })
    ),
    FLOW_CODE: nullable(string()),
    FLOW_NAME: nullable(string()),
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
  'PRODUCT_MAIN_NAME',
  'FLOW_CODE',
  'FLOW_NAME',
  'TOTAL_COUNT_PROCESS',
  'PRODUCT_TYPE_CODE',
  'PRODUCT_TYPE_NAME',
  'MODIFIED_DATE',
  'UPDATE_BY'
]

const FlowProcess = () => {
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
            FLOW_CODE: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.FLOW_CODE || '',
            FLOW_NAME: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.FLOW_NAME || '',
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
              FLOW_PROCESS_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .FLOW_PROCESS_ID ?? false,
              PRODUCT_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_MAIN_NAME ?? true,
              FLOW_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .FLOW_CODE ?? true,
              FLOW_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .FLOW_NAME ?? true,
              TOTAL_COUNT_PROCESS:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .TOTAL_COUNT_PROCESS ?? true,
              PRODUCT_TYPE_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_TYPE_CODE ?? false,
              PRODUCT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_TYPE_NAME ?? false,
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
              FLOW_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .FLOW_CODE ?? MRT_FilterFns.contains.name,
              FLOW_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .FLOW_NAME ?? MRT_FilterFns.contains.name,

              PRODUCT_TYPE_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_TYPE_CODE ?? MRT_FilterFns.contains.name,
              PRODUCT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_TYPE_NAME ?? MRT_FilterFns.contains.name,
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
            FLOW_CODE: '',
            FLOW_NAME: '',
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
              FLOW_PROCESS_ID: false,
              FLOW_CODE: true,
              FLOW_NAME: true,
              TOTAL_COUNT_PROCESS: true,
              PRODUCT_TYPE_CODE: false,
              PRODUCT_TYPE_NAME: false,
              MODIFIED_DATE: true,
              UPDATE_BY: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              inuseForSearch: MRT_FilterFns.contains.name,
              PRODUCT_MAIN_NAME: MRT_FilterFns.contains.name,
              FLOW_CODE: MRT_FilterFns.contains.name,
              FLOW_NAME: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_NAME: MRT_FilterFns.contains.name,
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
        color: 'var(--mui-palette-text-secondary) !important'
      }}
    >
      Flow
    </Typography>,
    <Typography
      key='3'
      color='text.primary'
      sx={{
        color: 'var(--mui-palette-text-primary) !important'
      }}
    >
      Flow Process
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
          <Typography variant='h4'>Flow Process</Typography>
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
          {isLoading ? null : <FlowProcessWatch />}
        </Grid>
        <Grid item xs={12}>
          <FlowProcessSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            'Loading'
          ) : (
            <FlowProcessTableData isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default FlowProcess
