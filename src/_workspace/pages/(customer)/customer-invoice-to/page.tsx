import { useEffect, useMemo, useState } from 'react'

// import {
//   MaterialReactTable,

//   // createRow,
//   type MRT_ColumnDef,
//   type MRT_Row,
//   type MRT_TableOptions,
//   useMaterialReactTable
// } from 'material-react-table'
import { Box, Breadcrumbs, Button, Divider, Grid, IconButton, Tooltip, Typography } from '@mui/material'
// import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// import EditIcon from '@mui/icons-material/Edit'
// import DeleteIcon from '@mui/icons-material/Delete'

// import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
// import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import type { Input } from 'valibot'
import { any, array, boolean, nullable, number, object, optional, picklist, record, string, unknown } from 'valibot'

import { MENU_ID } from './env'
import { valibotResolver } from '@hookform/resolvers/valibot'

// import ResultDataResponseI from '@/libs/axios/types/ResultDataResponseI'
// import { safeJsonParse } from '@/utils/formatting-checking-value/safeJsonParse'

// import EditingInlineCell from '../product-main/EditingInlineCell copy 2'
import { MRT_FilterFns } from 'material-react-table'

import CustomerInvoiceToTableData from './CustomerInvoiceToTableData'
import CustomerInvoiceToSearch from './CustomerInvoiceToSearch'

import { useUpdateEffect } from 'react-use'
import CustomerInvoiceToWatch from './CustomerInvoiceToWatch'

import dayjs from 'dayjs'
import { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import SkeletonCustom from '@/components/SkeletonCustom'

export type FormData = Input<typeof schema>

const schema = object({
  searchFilters: object({
    customerInvoiceToName: string(),
    customerInvoiceToAlphabet: string(),
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

  'CUSTOMER_INVOICE_TO_ID',
  'CUSTOMER_INVOICE_TO_NAME',

  'CUSTOMER_INVOICE_TO_ALPHABET',

  'CREATE_BY',
  'CREATE_DATE',

  'UPDATE_BY',
  'UPDATE_DATE'
]

const CustomerInvoiceTo = () => {
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
            // customerOrderFromId: '',
            customerInvoiceToName:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.customerInvoiceToName ||
              '',
            customerInvoiceToAlphabet:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
                .customerInvoiceToAlphabet || '',
            status: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.status || null
          },
          searchResults: {
            pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            columnFilters: columnFilters || [],
            sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting || [],
            density:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density || 'compact',
            columnVisibility: {
              CUSTOMER_INVOICE_TO_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CUSTOMER_INVOICE_TO_ID ?? false,
              CUSTOMER_INVOICE_TO_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CUSTOMER_INVOICE_TO_NAME ?? true,
              CUSTOMER_INVOICE_TO_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CUSTOMER_INVOICE_TO_ALPHABET ?? true,
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
              CUSTOMER_INVOICE_TO_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CUSTOMER_INVOICE_TO_ID || MRT_FilterFns.contains.name,
              CUSTOMER_INVOICE_TO_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CUSTOMER_INVOICE_TO_NAME || MRT_FilterFns.contains.name,
              CUSTOMER_INVOICE_TO_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CUSTOMER_INVOICE_TO_ALPHABET || MRT_FilterFns.contains.name,
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
            customerInvoiceToName: '',
            customerInvoiceToAlphabet: '',
            status: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'compact',
            columnVisibility: {
              CUSTOMER_INVOICE_TO_ID: false,
              CUSTOMER_INVOICE_TO_NAME: true,
              CUSTOMER_INVOICE_TO_ALPHABET: true,
              CREATE_BY: true,
              CREATE_DATE: true,
              UPDATE_DATE: true,
              UPDATE_BY: true,
              inuseForSearch: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              CUSTOMER_INVOICE_TO_ID: MRT_FilterFns.contains.name,
              CUSTOMER_INVOICE_TO_NAME: MRT_FilterFns.contains.name,
              CUSTOMER_INVOICE_TO_ALPHABET: MRT_FilterFns.contains.name,
              CREATE_BY: MRT_FilterFns.contains.name,
              CREATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_BY: MRT_FilterFns.contains.name,
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
      Customer
    </Typography>,
    <Typography key='3' sx={{ color: 'var(--mui-palette-text-primary) !important' }}>
      Customer Invoice To
    </Typography>
  ]

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>Customer Invoice To</Typography>
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
          {isLoading ? null : <CustomerInvoiceToWatch />}
        </Grid>
        <Grid item xs={12}>
          <CustomerInvoiceToSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <CustomerInvoiceToTableData isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default CustomerInvoiceTo
