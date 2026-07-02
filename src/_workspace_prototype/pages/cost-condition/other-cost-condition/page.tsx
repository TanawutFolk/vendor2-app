// React Imports
import { useState } from 'react'

// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

// Components Imports
import OtherCostSearch from './OtherCostSearch'
import OtherCostTableData from './OtherCostTableData'
import OtherCostWatch from './OtherCostWatch'

// Third-party Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  any,
  array,
  boolean,
  minLength,
  nullable,
  number,
  object,
  optional,
  picklist,
  pipe,
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
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

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
    FISCAL_YEAR: nullable(
      object({
        value: number(),
        label: number()
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
  'PRODUCT_MAIN_NAME',
  'GA',
  'MARGIN',
  'SELLING_EXPENSE',
  'VAT',
  'CIT',
  'FISCAL_YEAR',
  'VERSION',
  'UPDATE_DATE',
  'UPDATE_BY'
]

const OtherCostCondition = () => {
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
            PRODUCT_MAIN:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.PRODUCT_MAIN || null,
            FISCAL_YEAR:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.FISCAL_YEAR || null
          },
          searchResults: {
            pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            columnFilters: columnFilters || [],
            sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting || [],
            density:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density || 'comfortable',
            columnVisibility: {
              PRODUCT_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_MAIN_NAME ?? true,
              GA:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility.GA ??
                true,
              MARGIN:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .MARGIN ?? true,
              SELLING_EXPENSE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .SELLING_EXPENSE ?? true,
              VAT:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility.VAT ??
                true,
              CIT:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility.CIT ??
                true,
              FISCAL_YEAR:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .FISCAL_YEAR ?? true,
              VERSION:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .VERSION ?? true,
              UPDATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .UPDATE_DATE ?? true,
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
              PRODUCT_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_MAIN_NAME ?? MRT_FilterFns.contains.name,
              GA:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.GA ??
                MRT_FilterFns.contains.name,
              MARGIN:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .MARGIN ?? MRT_FilterFns.contains.name,
              SELLING_EXPENSE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .SELLING_EXPENSE ?? MRT_FilterFns.contains.name,
              VAT:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.VAT ??
                MRT_FilterFns.contains.name,
              CIT:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.CIT ??
                MRT_FilterFns.contains.name,
              FISCAL_YEAR:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .FISCAL_YEAR ?? MRT_FilterFns.contains.name,
              VERSION:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .VERSION ?? MRT_FilterFns.contains.name,
              UPDATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_DATE ?? MRT_FilterFns.equals.name,
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
            FISCAL_YEAR: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'comfortable',
            columnVisibility: {
              PRODUCT_MAIN_NAME: true,
              GA: true,
              MARGIN: true,
              SELLING_EXPENSE: true,
              VAT: true,
              CIT: true,
              FISCAL_YEAR: true,
              VERSION: true,
              UPDATE_DATE: true,
              UPDATE_BY: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              PRODUCT_MAIN_NAME: MRT_FilterFns.contains.name,
              GA: MRT_FilterFns.contains.name,
              MARGIN: MRT_FilterFns.contains.name,
              SELLING_EXPENSE: MRT_FilterFns.contains.name,
              VAT: MRT_FilterFns.contains.name,
              CIT: MRT_FilterFns.contains.name,
              FISCAL_YEAR: MRT_FilterFns.contains.name,
              VERSION: MRT_FilterFns.contains.name,
              UPDATE_DATE: MRT_FilterFns.equals.name,
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
      sx={{
        color: 'var(--mui-palette-text-secondary) !important'
      }}
    >
      Cost Condition
    </Typography>,
    <Typography
      key='3'
      sx={{
        color: 'var(--mui-palette-text-primary) !important'
      }}
    >
      Other Cost Condition
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
            Other Cost Condition
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
          {isLoading ? null : <OtherCostWatch />}
        </Grid>
        <Grid item xs={12}>
          <OtherCostSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            'Loading'
          ) : (
            <OtherCostTableData isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default OtherCostCondition
