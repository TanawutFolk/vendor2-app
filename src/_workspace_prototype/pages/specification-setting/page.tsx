// MUI Imports

import { Grid, Typography } from '@mui/material'

// Third-party Imports
import { FormProvider, useForm } from 'react-hook-form'
import {
  object,
  string,
  number,
  nullable,
  array,
  unknown,
  boolean,
  picklist,
  record,
  optional,
  literal,
  union,
  pipe,
  nonEmpty,
  any
} from 'valibot'
import type { Input } from 'valibot'

// Components Imports
import { valibotResolver } from '@hookform/resolvers/valibot'

import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
// import ProcessTimeStudySettingWatch from './ProcessTimeStudySettingWatch'

import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'
import type ResultDataResponseI from '@/libs/axios/types/ResultDataResponseI'
import { safeJsonParse } from '@/utils/formatting-checking-value/safeJsonParse'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
// import  from './SpecificationSettingTableData'
import { useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { useFormState } from 'react-hook-form'
import SpecificationSettingSearch from './SpecificationSettingSearch'
import SpecificationSettingWatch from './SpecificationSettingWatch'
import SpecificationSettingTableData from './SpecificationSettingTableData'
import { MRT_FilterFns } from 'material-react-table'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import dayjs from 'dayjs'

export type FormData = Input<typeof schema>

const schema = object({
  searchFilters: object({
    productMain: nullable(
      object({
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string()
      })
    ),
    customerOrderFrom: nullable(
      object({
        CUSTOMER_ORDER_FROM_ID: number(),
        CUSTOMER_ORDER_FROM_NAME: string()
      })
    ),
    specificationSetting: union([literal(''), string()]),
    modelNumber: union([literal(''), string()]),
    specificationSettingNumber: union([literal(''), string()]),
    specificationSettingVersionRevision: union([literal(''), string()]),
    partNumber: union([literal(''), string()]),

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
    // columnSizing: record(string(), number()),
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

  'PRODUCT_MAIN_NAME',
  'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',

  'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER',
  'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION',
  'PRODUCT_PART_NUMBER',
  'PRODUCT_MODEL_NUMBER',
  'CUSTOMER_ORDER_FROM_NAME',
  'PRODUCT_SPECIFICATION_TYPE_NAME',

  'CREATE_BY',
  'CREATE_DATE',
  'MODIFIED_DATE',
  'UPDATE_BY',
  'UPDATE_DATE'
]

function SpecificationSettingPage() {
  // react-hook-form
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
            modelNumber:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.modelNumber || '',
            productSpecificationType:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
                .productSpecificationType || null,
            customerOrderFrom:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.customerOrderFrom || null,
            productMain:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productMain || null,
            specificationSetting:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
                .specificationSettingNumber || '',
            specificationSettingNumber:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
                .specificationSettingNumber || '',
            specificationSettingVersionRevision:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
                .specificationSettingVersionRevision || '',
            partNumber:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.partNumber || '',
            status: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.status || null
          },
          searchResults: {
            pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            columnFilters: columnFilters || [],
            sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting || [],
            density:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density || 'comfortable',
            columnVisibility: {
              PRODUCT_MODEL_NUMBER:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_MODEL_NUMBER || true,
              PRODUCT_SPECIFICATION_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_SPECIFICATION_TYPE_NAME || true,
              PRODUCT_SPECIFICATION_TYPE_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_SPECIFICATION_TYPE_ID || false,
              PRODUCT_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_MAIN_NAME || true,
              PRODUCT_MAIN_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_MAIN_ID || false,
              CUSTOMER_ORDER_FROM_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CUSTOMER_ORDER_FROM_NAME || true,
              CUSTOMER_ORDER_FROM_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CUSTOMER_ORDER_FROM_ID || false,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME ?? true,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION ?? true,
              PRODUCT_PART_NUMBER:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_PART_NUMBER ?? true,
              MODIFIED_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .MODIFIED_DATE ?? true,
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
              PRODUCT_MAIN_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_MAIN_ID ?? MRT_FilterFns.contains.name,
              CUSTOMER_ORDER_FROM_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CUSTOMER_ORDER_FROM_NAME ?? MRT_FilterFns.contains.name,
              CUSTOMER_ORDER_FROM_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CUSTOMER_ORDER_FROM_ID ?? MRT_FilterFns.contains.name,
              PRODUCT_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_MAIN_NAME ?? MRT_FilterFns.contains.name,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER ?? MRT_FilterFns.contains.name,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME ?? MRT_FilterFns.contains.name,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION ?? MRT_FilterFns.contains.name,
              PRODUCT_PART_NUMBER:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_PART_NUMBER ?? MRT_FilterFns.contains.name,
              PRODUCT_SPECIFICATION_TYPE_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_SPECIFICATION_TYPE_ID ?? MRT_FilterFns.contains.name,
              PRODUCT_SPECIFICATION_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_SPECIFICATION_TYPE_NAME ?? MRT_FilterFns.contains.name,
              PRODUCT_MODEL_NUMBER:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_MODEL_NUMBER ?? MRT_FilterFns.contains.name,
              CREATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CREATE_BY ?? MRT_FilterFns.contains.name,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_BY ?? MRT_FilterFns.contains.name,
              CREATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CREATE_DATE ?? MRT_FilterFns.equals.name,
              MODIFIED_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .MODIFIED_DATE ?? MRT_FilterFns.equals.name,
              UPDATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_DATE ?? MRT_FilterFns.equals.name,
              inuseForSearch:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .inuseForSearch ?? MRT_FilterFns.contains.name
            }
          }
        }
      } catch (error) {
        return {
          searchFilters: {
            productMain: null,
            customerOrderFrom: null,
            productSpecificationType: null,
            specificationSetting: '',
            specificationSettingNumber: '',
            specificationSettingVersionRevision: '',
            partNumber: '',
            modelNumber: '',
            status: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'comfortable',
            columnVisibility: {
              CUSTOMER_ORDER_FROM_ID: false,
              PRODUCT_MAIN_ID: false,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: true,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: true,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: true,
              PRODUCT_MAIN_NAME: true,
              CUSTOMER_ORDER_FROM_NAME: true,
              PRODUCT_SPECIFICATION_TYPE_NAME: true,
              PRODUCT_MODEL_NUMBER: true,
              CREATE_BY: true,
              CREATE_DATE: true,
              UPDATE_DATE: true,
              UPDATE_BY: true,
              MODIFIED_DATE: true,
              inuseForSearch: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              CUSTOMER_ORDER_FROM_ID: MRT_FilterFns.contains.name,
              CUSTOMER_ORDER_FROM_NAME: MRT_FilterFns.contains.name,
              PRODUCT_MAIN_ID: MRT_FilterFns.contains.name,
              PRODUCT_MAIN_NAME: MRT_FilterFns.contains.name,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: MRT_FilterFns.contains.name,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: MRT_FilterFns.contains.name,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: MRT_FilterFns.contains.name,
              PRODUCT_SPECIFICATION_TYPE_NAME: MRT_FilterFns.contains.name,
              PRODUCT_SPECIFICATION_TYPE_ID: MRT_FilterFns.contains.name,
              PRODUCT_MODEL_NUMBER: MRT_FilterFns.contains.name,
              CREATE_BY: MRT_FilterFns.contains.name,
              CREATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_BY: MRT_FilterFns.contains.name,
              MODIFIED_DATE: MRT_FilterFns.equals.name,
              inuseForSearch: MRT_FilterFns.contains.name
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
        <Grid item xs={12}>
          <Typography variant='h4'>Product Specification Document Setting</Typography>
          {isLoading ? null : <SpecificationSettingWatch />}
        </Grid>
        <Grid item xs={12}>
          <SpecificationSettingSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            'Loading'
          ) : (
            <SpecificationSettingTableData
              isEnableFetching={isEnableFetching}
              setIsEnableFetching={setIsEnableFetching}
            />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default SpecificationSettingPage
