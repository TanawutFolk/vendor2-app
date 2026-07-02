// MUI Imports

import { Grid, LinearProgress } from '@mui/material'

// Third-party Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { array, boolean, nullish, number, object, optional, picklist, record, string, unknown } from 'valibot'

import dayjs from 'dayjs'
import type { Input } from 'valibot'

// Components Imports
import { valibotResolver } from '@hookform/resolvers/valibot'

import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'

import type AxiosResponseInterface from '@/libs/axios/types/AxiosResponseInterface'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { breadcrumbNavigation, MENU_ID, MENU_NAME } from './env'

import { useState } from 'react'
import { useUpdateEffect } from 'react-use'

import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'

import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { MRT_FilterFns } from 'material-react-table'
import Watched from './Watched'

import ManufacturingItemGroupDataTable from './ManufacturingItemGroupDataTable'
import ManufacturingItemGroupSearch from './ManufacturingItemGroupSearch'

export type FormData = Input<typeof schema>

const schema = object({
  searchFilters: object({
    department: nullish(
      object(
        {
          DEPARTMENT_ID: number(),
          DEPARTMENT_NAME: string()
        },
        requiredFieldMessage({ fieldName: 'Department' })
      )
    ),
    division: nullish(
      object(
        {
          DIVISION_ID: number(),
          DIVISION_NAME: string()
        },
        requiredFieldMessage({ fieldName: 'Division' })
      )
    ),
    sectionName: nullish(string()),
    sectionAlphabet: nullish(string()),
    status: nullish(
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
    columnOrder: array(string())
    //columnSizing: record(string(), number())
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

const columns = ['mrt-row-actions', 'inuseForSearch', 'ITEM_GROUP_NAME', 'MODIFIED_DATE', 'UPDATE_BY']

function Page() {
  // react-hook-form
  // AxiosResponseInterface
  const [isEnableFetching, setIsEnableFetching] = useState(false)

  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: async (): Promise<FormData> => {
      try {
        const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
          AxiosResponseInterface<UserProfileSettingProgramI<FormData>>
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
            ITEM_GROUP_NAME:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.ITEM_GROUP_NAME || '',

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
              ITEM_GROUP_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_GROUP_ID ?? false,
              ITEM_GROUP_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_GROUP_NAME ?? true,

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
                  .inuseForSearch || MRT_FilterFns.contains.name,
              ITEM_GROUP_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_GROUP_NAME || MRT_FilterFns.contains.name,

              MODIFIED_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .MODIFIED_DATE || MRT_FilterFns.contains.name,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_BY || MRT_FilterFns.contains.name
            }
          }
        }
      } catch (error) {
        return {
          searchFilters: {
            ITEM_GROUP_NAME: '',

            INUSE: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'comfortable',
            columnVisibility: {
              inuseForSearch: true,
              ITEM_GROUP_ID: false,
              ITEM_GROUP_NAME: true,

              MODIFIED_DATE: true,
              UPDATE_BY: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              inuseForSearch: MRT_FilterFns.contains.name,
              ITEM_GROUP_NAME: MRT_FilterFns.contains.name,
              MODIFIED_DATE: MRT_FilterFns.contains.name,
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
          <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
          {isLoading ? null : <Watched />}
        </Grid>
        <Grid item xs={12}>
          <ManufacturingItemGroupSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            <LinearProgress variant='indeterminate' value={100} />
          ) : (
            <ManufacturingItemGroupDataTable
              isEnableFetching={isEnableFetching}
              setIsEnableFetching={setIsEnableFetching}
            />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default Page
