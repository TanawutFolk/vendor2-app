import { useEffect, useMemo, useState } from 'react'
import { Box, Breadcrumbs, Button, Divider, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import type { Input } from 'valibot'
import {
  any,
  array,
  boolean,
  literal,
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

import { MENU_ID } from './env'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { MRT_FilterFns } from 'material-react-table'

import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import { useUpdateEffect } from 'react-use'

import dayjs from 'dayjs'

import BoiNameForMaterialConsumableWatch from './BoiNameForMaterialConsumableWatch'
import BoiNameForMaterialConsumableSearch from './BoiNameForMaterialConsumableSearch'
import BoiNameForMaterialConsumableTableData from './BoiNameForMaterialConsumableTableData'
import { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import SkeletonCustom from '@/components/SkeletonCustom'

export type FormData = Input<typeof schema>

const schema = object({
  searchFilters: object({
    boiGroupNo: union([
      nullable(
        object({
          BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID: number(),
          BOI_GROUP_NO: string()
        })
      ),
      literal('')
    ]),
    boiProject: union([
      nullable(
        object({
          BOI_PROJECT_ID: number(),
          BOI_PROJECT_NAME: string(),
          BOI_PROJECT_CODE: string()
        })
      ),
      literal('')
    ]),
    // boiDescriptionMainName: string(),
    // boiDescriptionSubName: string(),

    status: nullable(
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
        value: unknown()
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

  'BOI_PROJECT_NAME',
  'BOI_PROJECT_CODE',
  'BOI_GROUP_NO',
  'BOI_DESCRIPTION_MAIN_NAME',
  'BOI_DESCRIPTION_SUB_NAME',
  'BOI_UNIT_SYMBOL',

  'CREATE_BY',
  'CREATE_DATE',
  'UPDATE_BY',
  'UPDATE_DATE'
]

const BoiNameForMaterialConsumable = () => {
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
          result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnFilters.map(item => {
            if (item.id === 'CREATE_DATE' || item.id === 'UPDATE_DATE') {
              const value = (item?.value as string) || ''

              return {
                id: item.id,
                value: dayjs(value).isValid() ? dayjs(value) : null
              }
            } else {
              return item
            }
          })

        return {
          searchFilters: {
            boiProject:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.boiProject || null,
            boiGroupNo:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.boiGroupNo || null,
            status: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.status || null
          },
          searchResults: {
            pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            columnFilters: columnFilters || [],
            sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting || [],
            density:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density || 'compact',
            columnVisibility: {
              BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID ?? false,
              BOI_PROJECT_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .BOI_PROJECT_ID ?? false,
              BOI_UNIT_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .BOI_UNIT_ID ?? false,
              BOI_UNIT_SYMBOL:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .BOI_UNIT_SYMBOL ?? true,
              BOI_GROUP_NO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .BOI_GROUP_NO ?? true,
              BOI_DESCRIPTION_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .BOI_DESCRIPTION_MAIN_NAME ?? true,
              BOI_DESCRIPTION_SUB_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .BOI_DESCRIPTION_SUB_NAME ?? true,
              CREATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CREATE_BY ?? true,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .UPDATE_BY ?? true,
              CREATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CREATE_DATE ?? true,
              UPDATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .UPDATE_DATE ?? true,
              inuseForSearch:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .inuseForSearch ?? true
            },
            columnPinning: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults
              .columnPinning || { left: [], right: [] },
            columnOrder:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnOrder?.concat(
                columnsDifference
              ) || [],
            columnFilterFns: {
              BOI_UNIT_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOI_UNIT_ID || MRT_FilterFns.contains.name,
              BOI_UNIT_SYMBOL:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOI_UNIT_SYMBOL || MRT_FilterFns.contains.name,
              BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID || MRT_FilterFns.contains.name,
              BOI_PROJECT_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOI_PROJECT_ID || MRT_FilterFns.contains.name,
              BOI_PROJECT_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOI_PROJECT_NAME || MRT_FilterFns.contains.name,
              BOI_PROJECT_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOI_PROJECT_CODE || MRT_FilterFns.contains.name,
              BOI_GROUP_NO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOI_GROUP_NO || MRT_FilterFns.contains.name,
              BOI_DESCRIPTION_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOI_DESCRIPTION_MAIN_NAME || MRT_FilterFns.contains.name,
              BOI_DESCRIPTION_SUB_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOI_DESCRIPTION_SUB_NAME || MRT_FilterFns.contains.name,
              CREATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CREATE_BY || MRT_FilterFns.contains.name,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_BY || MRT_FilterFns.contains.name,
              CREATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CREATE_DATE || MRT_FilterFns.equals.name,
              UPDATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_DATE || MRT_FilterFns.equals.name,
              inuseForSearch:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .inuseForSearch || ''
            }
          }
        }
      } catch (error) {
        return {
          searchFilters: {
            boiProject: null,
            boiGroupNo: '',
            status: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'compact',
            columnVisibility: {
              BOI_UNIT_ID: false,
              BOI_UNIT_SYMBOL: true,
              BOI_PROJECT_ID: false,
              BOI_PROJECT_NAME: true,
              BOI_PROJECT_CODE: true,
              BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID: false,
              BOI_GROUP_NO: true,
              CREATE_BY: true,
              CREATE_DATE: true,
              UPDATE_DATE: true,
              UPDATE_BY: true,
              inuseForSearch: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              BOI_UNIT_ID: MRT_FilterFns.contains.name,
              BOI_UNIT_SYMBOL: MRT_FilterFns.contains.name,
              BOI_PROJECT_NAME: MRT_FilterFns.contains.name,
              BOI_PROJECT_ID: MRT_FilterFns.contains.name,
              BOI_PROJECT_CODE: MRT_FilterFns.contains.name,
              BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID: MRT_FilterFns.contains.name,
              BOI_GROUP_NO: MRT_FilterFns.contains.name,
              CREATE_BY: MRT_FilterFns.contains.name,
              CREATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_BY: MRT_FilterFns.equals.name,
              inuseForSearch: MRT_FilterFns.contains.name
            }
          }
        }
      }
      // as FormData)

      // console.log(result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA || '', jsonValue)

      // return jsonValue
    }
  })

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoading])

  const breadcrumbs = [
    <Typography key='1' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      Home
    </Typography>,
    <Typography key='2' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      BOI
    </Typography>,
    <Typography key='2' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      BOI Category
    </Typography>,
    <Typography key='3' sx={{ color: 'var(--mui-palette-text-primary) !important' }}>
      BOI Name For Material/Consumable
    </Typography>
  ]

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* Header Section */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>BOI Name For Material/Consumable</Typography>
          <Divider orientation='vertical' flexItem />
          <Breadcrumbs
            separator='›'
            aria-label='breadcrumb'
            sx={{
              display: 'inline-block'
            }}
          >
            {breadcrumbs}
          </Breadcrumbs>
          {!isLoading && <BoiNameForMaterialConsumableWatch />}
        </Grid>

        {/* Search Section */}
        <Grid item xs={12}>
          <BoiNameForMaterialConsumableSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>

        {/* Table Section */}
        <Grid item xs={12}>
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <BoiNameForMaterialConsumableTableData
              isEnableFetching={isEnableFetching}
              setIsEnableFetching={setIsEnableFetching}
            />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default BoiNameForMaterialConsumable
