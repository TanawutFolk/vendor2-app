// React Imports
import { useState } from 'react'

// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

// React Hook Form Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'

// Valibot Imports
import {
  any,
  array,
  boolean,
  InferOutput,
  nullable,
  number,
  object,
  optional,
  picklist,
  record,
  string,
  unknown
} from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'

// Material React Table Imports
import { MRT_FilterFns } from 'material-react-table'

// Third-party Imports
import { useUpdateEffect } from 'react-use'
import dayjs from 'dayjs'

// Local Imports
import { MENU_ID } from './env'

// Components Imports
import ProductCategoryTableData from './ProductCategoryTableData'
import ProductCategorySearch from './ProductCategorySearch'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import ProductCategoryWatch from './ProductCategoryWatch'
import { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import SkeletonCustom from '@/components/SkeletonCustom'

export type FormData = InferOutput<typeof schema>

const schema = object({
  searchFilters: object({
    productCategoryName: string(),
    productCategoryCode: string(),
    productCategoryAlphabet: string(),
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

  'PRODUCT_CATEGORY_ID',
  'PRODUCT_CATEGORY_CODE',

  'PRODUCT_CATEGORY_ALPHABET',

  'CREATE_BY',
  'CREATE_DATE',

  'UPDATE_BY',
  'UPDATE_DATE'
]

const ProductCategory = () => {
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
            productCategoryName:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productCategoryName || '',
            productCategoryCode:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productCategoryCode || '',
            productCategoryAlphabet:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productCategoryAlphabet ||
              '',
            status: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.status || null
          },
          searchResults: {
            pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            columnFilters: columnFilters || [],
            sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting || [],
            density:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density || 'compact',
            columnVisibility: {
              PRODUCT_CATEGORY_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_CATEGORY_ID ?? false,
              PRODUCT_CATEGORY_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_CATEGORY_CODE ?? true,
              PRODUCT_CATEGORY_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_CATEGORY_NAME ?? true,
              PRODUCT_CATEGORY_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_CATEGORY_ALPHABET ?? true,
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
              PRODUCT_CATEGORY_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_CATEGORY_ID || MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_CATEGORY_CODE || MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_CATEGORY_NAME || MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_CATEGORY_ALPHABET || MRT_FilterFns.contains.name,
              CREATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CREATE_BY || MRT_FilterFns.contains.name,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_BY || MRT_FilterFns.equals.name,
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
      } catch {
        return {
          searchFilters: {
            productCategoryName: '',
            productCategoryCode: '',
            productCategoryAlphabet: '',
            status: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'compact',
            columnVisibility: {
              PRODUCT_CATEGORY_ID: false,
              PRODUCT_CATEGORY_CODE: true,
              PRODUCT_CATEGORY_NAME: true,
              PRODUCT_CATEGORY_ALPHABET: true,
              CREATE_BY: true,
              CREATE_DATE: true,
              UPDATE_DATE: true,
              UPDATE_BY: true,
              inuseForSearch: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columns,
            columnFilterFns: {
              PRODUCT_CATEGORY_ID: MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_CODE: MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_NAME: MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_ALPHABET: MRT_FilterFns.contains.name,
              CREATE_BY: MRT_FilterFns.contains.name,
              CREATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_BY: MRT_FilterFns.equals.name,
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

  const breadcrumbs = [
    <Typography key='1' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      Home
    </Typography>,
    <Typography key='2' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      Product Group
    </Typography>,
    <Typography key='3' sx={{ color: 'var(--mui-palette-text-primary) !important' }}>
      Product Category
    </Typography>
  ]

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* Header Section */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>Product Category</Typography>
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
          {!isLoading && <ProductCategoryWatch />}
        </Grid>

        {/* Search Section */}
        <Grid item xs={12}>
          <ProductCategorySearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>

        {/* Table Section */}
        <Grid item xs={12}>
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <ProductCategoryTableData isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default ProductCategory
