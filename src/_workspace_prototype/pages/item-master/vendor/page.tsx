// React Imports
import { useState } from 'react'

// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

// Components Imports
import VendorSearch from './VendorSearch'
import VendorWatch from './VendorWatch'
import VendorTableData from './VendorTableData'

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
    VENDOR_NAME: nullable(string()),
    VENDOR_ALPHABET: nullable(string()),
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
  'INUSE',
  'VENDOR_NAME',
  'VENDOR_ALPHABET',
  'ITEM_IMPORT_TYPE_NAME',
  'MODIFIED_DATE',
  'UPDATE_BY'
]

const Vendor = () => {
  // State
  const [isEnableFetching, setIsEnableFetching] = useState(false)

  // react-hook-form
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
            VENDOR_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.VENDOR_NAME || '',
            VENDOR_ALPHABET:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.VENDOR_ALPHABET || '',
            INUSE: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.INUSE || null,
            VENDOR_CD_PRONES:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.VENDOR_CD_PRONES || '',
            VENDOR_NAME_PRONES:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.VENDOR_NAME_PRONES || ''
          },
          searchResults: {
            pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            columnFilters: columnFilters || [],
            sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting || [],
            density:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density || 'compact',
            columnVisibility: {
              INUSE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .INUSE ?? true,
              VENDOR_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .VENDOR_ID ?? false,
              VENDOR_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .VENDOR_NAME ?? true,
              VENDOR_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .VENDOR_ALPHABET ?? true,
              VENDOR_CD_PRONES:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .VENDOR_CD_PRONES ?? true,
              VENDOR_NAME_PRONES:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .VENDOR_NAME_PRONES ?? true,
              ITEM_IMPORT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_IMPORT_TYPE_NAME ?? true,
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
              INUSE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.INUSE ??
                MRT_FilterFns.contains.name,
              VENDOR_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .VENDOR_NAME ?? MRT_FilterFns.contains.name,
              VENDOR_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .VENDOR_ALPHABET ?? MRT_FilterFns.contains.name,
              ITEM_IMPORT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_IMPORT_TYPE_NAME ?? MRT_FilterFns.contains.name,
              VENDOR_CD_PRONES:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .VENDOR_CD_PRONES ?? MRT_FilterFns.contains.name,
              VENDOR_NAME_PRONES:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .VENDOR_NAME_PRONES ?? MRT_FilterFns.contains.name,
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
            VENDOR_NAME: '',
            VENDOR_ALPHABET: '',
            INUSE: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'compact',
            columnVisibility: {
              INUSE: true,
              VENDOR_ID: false,
              VENDOR_NAME: true,
              VENDOR_ALPHABET: true,
              ITEM_IMPORT_TYPE_NAME: true,
              VENDOR_CD_PRONES: true,
              VENDOR_NAME_PRONES: true,
              MODIFIED_DATE: true,
              UPDATE_BY: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              INUSE: MRT_FilterFns.contains.name,
              VENDOR_NAME: MRT_FilterFns.contains.name,
              VENDOR_ALPHABET: MRT_FilterFns.contains.name,
              ITEM_IMPORT_TYPE_NAME: MRT_FilterFns.contains.name,
              VENDOR_CD_PRONES: MRT_FilterFns.contains.name,
              VENDOR_NAME_PRONES: MRT_FilterFns.contains.name,
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
      Item Master
    </Typography>,
    <Typography
      key='3'
      color='text.primary'
      sx={{
        color: 'var(--mui-palette-text-primary) !important'
      }}
    >
      Vendor
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
          <Typography variant='h4'>Vendor</Typography>
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
          {isLoading ? null : <VendorWatch />}
        </Grid>
        <Grid item xs={12}>
          <VendorSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            'Loading'
          ) : (
            <VendorTableData isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default Vendor
