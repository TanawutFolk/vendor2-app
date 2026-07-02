// React Imports
import { useState } from 'react'

// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

// Components Imports
import ColorSearch from './ColorSearch'
import ColorWatch from './ColorWatch'
import ColorTableData from './ColorTableData'

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
    ITEM_PROPERTY_COLOR_NAME: nullable(string()),
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

const columns = ['mrt-row-actions', 'INUSE', 'ITEM_PROPERTY_COLOR_NAME', 'MODIFIED_DATE', 'UPDATE_BY']

const Color = () => {
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
            ITEM_PROPERTY_COLOR_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
                .ITEM_PROPERTY_COLOR_NAME || '',
            INUSE: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.INUSE || null
          },
          searchResults: {
            pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            columnFilters: columnFilters || [],
            sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting || [],
            density:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density || 'comfortable',
            columnVisibility: {
              INUSE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .INUSE ?? true,
              ITEM_PROPERTY_COLOR_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_PROPERTY_COLOR_ID ?? false,
              ITEM_PROPERTY_COLOR_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_PROPERTY_COLOR_NAME ?? true,
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
              ITEM_PROPERTY_COLOR_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_PROPERTY_COLOR_NAME ?? MRT_FilterFns.contains.name,
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
            ITEM_PROPERTY_COLOR_NAME: '',
            INUSE: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'comfortable',
            columnVisibility: {
              INUSE: true,
              ITEM_PROPERTY_ITEM_PROPERTY_COLOR_ID: false,
              ITEM_PROPERTY_COLOR_NAME: true,
              MODIFIED_DATE: true,
              UPDATE_BY: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              INUSE: MRT_FilterFns.contains.name,
              ITEM_PROPERTY_COLOR_NAME: MRT_FilterFns.contains.name,
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
        color: 'var(--mui-palette-text-secondary) !important'
      }}
    >
      Item Property
    </Typography>,
    <Typography
      key='4'
      color='text.primary'
      sx={{
        color: 'var(--mui-palette-text-primary) !important'
      }}
    >
      Color
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
          <Typography variant='h4'>Color</Typography>
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
          {isLoading ? null : <ColorWatch />}
        </Grid>
        <Grid item xs={12}>
          <ColorSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            'Loading'
          ) : (
            <ColorTableData isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default Color
