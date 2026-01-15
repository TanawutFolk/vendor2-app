import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'
import { useState } from 'react'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import type { Input } from 'valibot'
import { any, array, boolean, nullable, number, object, optional, picklist, record, string, unknown } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { MENU_ID } from './env'

import { MRT_FilterFns } from 'material-react-table'

import SkeletonCustom from '@/components/SkeletonCustom'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import dayjs from 'dayjs'
import { useUpdateEffect } from 'react-use'
import ProductTypeSearch from './ProductTypeSearch'
import ProductTypeTableData from './ProductTypeTableData'
import ProductCategoryWatch from './ProductTypeWatch'

// import ProductTypeDnd from './modal/ProductTypeDnd'

export type FormData = Input<typeof schema>

const schema = object({
  searchFilters: object({
    // productType: nullish(
    //   object({
    //     PRODUCT_TYPE_ID: number(),
    //     PRODUCT_TYPE_NAME: string()
    //   })
    // ),
    // productTypeName: union([literal(''), string()]),
    // productTypeCode: union([literal(''), string()]),
    // suffixForPartNumber: union([literal(''), string()]),
    // fftPartNumber: union([literal(''), string()]),
    // // productForRepair: nullish(string()),
    // // selectedProductLevelForGen: nullish(string()),
    // pcName: union([literal(''), string()]),
    // productItemName: union([literal(''), string()]),
    // productItemCode: union([literal(''), string()]),
    // isBoi: string(),
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
  // 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
  // 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER',
  // 'PRODUCT_SPECIFICATION_DOCUMENT_VERSION_REVISION',
  // 'IS_PRODUCT_FOR_REPAIR',
  // 'PRODUCT_PART_NUMBER',
  // 'SUFFIX_FOR_PART_NUMBER',
  // 'FFT_PART_NUMBER',
  // 'PRODUCT_CATEGORY_CODE',
  // 'PRODUCT_CATEGORY_ID',
  'PRODUCT_CATEGORY_NAME',
  // 'PRODUCT_MAIN_CODE',
  // 'PRODUCT_MAIN_ID',
  'PRODUCT_MAIN_NAME',
  // 'PRODUCT_SUB_ID',
  // 'PRODUCT_SUB_CODE',
  'PRODUCT_SUB_NAME',
  // 'ITEM_CATEGORY_ALPHABET',
  // 'ITEM_CATEGORY_ID',
  'ITEM_CATEGORY_NAME',
  // 'FLOW_ID',
  // 'FLOW_NAME',
  'FLOW_CODE',
  // 'BOM_ID',
  // 'BOM_NAME',
  'BOM_CODE',
  // 'BOI_NAME',
  // 'BOI_CODE',
  'PRODUCT_TYPE_ID',
  'PRODUCT_TYPE_NAME',
  'PRODUCT_TYPE_CODE_FOR_SCT',
  'PRODUCT_SPECIFICATION_TYPE_NAME',
  'CUSTOMER_INVOICE_TO_ALPHABET',
  //'ACCOUNT_DEPARTMENT_CODE_ID',
  // 'ACCOUNT_DEPARTMENT_NAME',
  'ACCOUNT_DEPARTMENT_CODE',
  // 'SELECTED_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE',
  // 'IS_FFT_PART_NUMBER',
  // 'IS_BOI',
  // 'CREATE_BY',
  // 'CREATE_DATE',
  'UPDATE_BY',
  'UPDATE_DATE'
]

const ProductType = () => {
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
          result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnFilters
            .filter(item => columns.includes(item))
            .map(item => {
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
            productTypeName:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productTypeName || '',
            itemCategory:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.itemCategory || null,
            productSub:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productSub || null,
            productMain:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productMain || null,
            productCategory:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productCategory || null,
            productTypeCode:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.productTypeCode || '',
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
              PRODUCT_MAIN_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_MAIN_ID ?? false,
              PRODUCT_SUB_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_SUB_ID ?? false,
              PRODUCT_TYPE_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_TYPE_ID ?? false,
              ITEM_CATEGORY_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_CATEGORY_ID ?? false,
              ITEM_CATEGORY_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_CATEGORY_ALPHABET ?? true,
              ACCOUNT_DEPARTMENT_CODE_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ACCOUNT_DEPARTMENT_CODE_ID ?? false,
              FLOW_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .FLOW_ID ?? false,
              BOM_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .BOM_ID ?? false,
              PRODUCT_TYPE_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_TYPE_CODE ?? false,
              BOI_PROJECT_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .BOI_PROJECT_ID ?? false,
              PRODUCT_ITEM_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_ITEM_NAME ?? true,
              PRODUCT_ITEM_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_ITEM_CODE ?? true,
              ACCOUNT_DEPARTMENT_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ACCOUNT_DEPARTMENT_CODE ?? true,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME ?? true,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER ?? true,
              PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION ?? true,
              PRODUCT_PART_NUMBER:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_PART_NUMBER ?? true,
              SUFFIX_FOR_PART_NUMBER:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .SUFFIX_FOR_PART_NUMBER ?? true,
              IS_PRODUCT_FOR_REPAIR:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .IS_PRODUCT_FOR_REPAIR ?? true,
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
              // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME || MRT_FilterFns.contains.name,
              // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER || MRT_FilterFns.contains.name,
              // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION || MRT_FilterFns.contains.name,
              // PRODUCT_PART_NUMBER:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .PRODUCT_PART_NUMBER || MRT_FilterFns.contains.name,
              // SUFFIX_FOR_PART_NUMBER:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .SUFFIX_FOR_PART_NUMBER || MRT_FilterFns.contains.name,
              // IS_PRODUCT_FOR_REPAIR:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .IS_PRODUCT_FOR_REPAIR || MRT_FilterFns.contains.name,
              // FFT_PART_NUMBER:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .FFT_PART_NUMBER || MRT_FilterFns.contains.name,
              // PRODUCT_ITEM_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .PRODUCT_ITEM_NAME || MRT_FilterFns.contains.name,
              // PRODUCT_ITEM_CODE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .PRODUCT_ITEM_CODE || MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_CATEGORY_ID || MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_CATEGORY_NAME || MRT_FilterFns.contains.name,
              PRODUCT_MAIN_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_MAIN_ID || MRT_FilterFns.contains.name,
              PRODUCT_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_MAIN_NAME || MRT_FilterFns.contains.name,
              PRODUCT_SUB_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_SUB_ID || MRT_FilterFns.contains.name,
              PRODUCT_SUB_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_SUB_NAME || MRT_FilterFns.contains.name,
              ITEM_CATEGORY_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_CATEGORY_ID || MRT_FilterFns.contains.name,
              ITEM_CATEGORY_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_CATEGORY_NAME || MRT_FilterFns.contains.name,
              ITEM_CATEGORY_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_CATEGORY_ALPHABET || MRT_FilterFns.contains.name,
              // ACCOUNT_DEPARTMENT_CODE_ID:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .ACCOUNT_DEPARTMENT_CODE_ID || MRT_FilterFns.contains.name,
              // ACCOUNT_DEPARTMENT_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .ACCOUNT_DEPARTMENT_NAME || MRT_FilterFns.contains.name,
              // ACCOUNT_DEPARTMENT_CODE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .ACCOUNT_DEPARTMENT_CODE || MRT_FilterFns.contains.name,
              // FLOW_ID:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .FLOW_ID || MRT_FilterFns.contains.name,
              // FLOW_CODE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .FLOW_CODE || MRT_FilterFns.contains.name,
              // BOM_ID:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .BOM_ID || MRT_FilterFns.contains.name,
              // BOM_CODE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .BOM_CODE || MRT_FilterFns.contains.name,
              PRODUCT_TYPE_ID:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_TYPE_ID || MRT_FilterFns.contains.name,
              PRODUCT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_TYPE_NAME || MRT_FilterFns.contains.name,
              // BOI_PROJECT_ID:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .BOI_PROJECT_ID || MRT_FilterFns.contains.name,
              // BOI_PROJECT_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .BOI_PROJECT_NAME || MRT_FilterFns.contains.name,
              // BOI_PROJECT_CODE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .BOI_PROJECT_NAME || MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOI_PROJECT_NAME || MRT_FilterFns.contains.name,
              // IS_BOI:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .IS_BOI || MRT_FilterFns.contains.name,
              // IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE || MRT_FilterFns.contains.name,
              // PC_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .PC_NAME || MRT_FilterFns.contains.name,
              // FLOW_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .FLOW_NAME || MRT_FilterFns.contains.name,
              // BOM_NAME:
              //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
              //     .BOM_NAME || MRT_FilterFns.contains.name,
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
            ITEM_CATEGORY_ID: null,
            ITEM_CATEGORY_NAME: '',
            ITEM_CATEGORY_ALPHABET: '',
            PRODUCT_CATEGORY_ID: null,
            PRODUCT_CATEGORY_NAME: '',
            PRODUCT_MAIN_ID: null,
            PRODUCT_MAIN_NAME: '',
            PRODUCT_SUB_ID: null,
            PRODUCT_SUB_NAME: '',
            PRODUCT_TYPE_NAME: '',
            PRODUCT_TYPE_CODE: '',
            // SUFFIX_FOR_PART_NUMBER: '',
            // PC_NAME: '',
            // PRODUCT_ITEM_NAME: '',
            // PRODUCT_ITEM_CODE: '',
            // FFT_PART_NUMBER: '',
            // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: null,
            // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: '',
            // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: '',
            // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: '',
            // PRODUCT_PART_NUMBER: '',
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
              PRODUCT_MAIN_ID: false,
              PRODUCT_MAIN_NAME: true,
              PRODUCT_SUB_ID: false,
              PRODUCT_SUB_NAME: true,
              ITEM_CATEGORY_ID: false,
              ITEM_CATEGORY_NAME: true,
              PRODUCT_TYPE_ID: false,
              PRODUCT_TYPE_NAME: true,
              PRODUCT_TYPE_CODE: true,
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
              PRODUCT_MAIN_ID: MRT_FilterFns.contains.name,
              PRODUCT_MAIN_NAME: MRT_FilterFns.contains.name,
              PRODUCT_SUB_ID: MRT_FilterFns.contains.name,
              PRODUCT_SUB_NAME: MRT_FilterFns.contains.name,
              ITEM_CATEGORY_ID: MRT_FilterFns.contains.name,
              ITEM_CATEGORY_NAME: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_ID: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_NAME: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE: MRT_FilterFns.contains.name,
              CREATE_BY: MRT_FilterFns.contains.name,
              CREATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_BY: MRT_FilterFns.contains.name,
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
      Product Type
    </Typography>
  ]

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* Header Section */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>Product Type</Typography>
          <Divider orientation='vertical' flexItem />
          <Breadcrumbs separator='›' aria-label='breadcrumb' sx={{ display: 'inline-block' }}>
            {breadcrumbs}
          </Breadcrumbs>
          {!isLoading && <ProductCategoryWatch />}
        </Grid>

        {/* Search Section */}
        <Grid item xs={12}>
          <ProductTypeSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>

        {/* Table Section */}
        <Grid item xs={12}>
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <ProductTypeTableData isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>

        {/* Optional DnD Section */}
        {/* <Grid item xs={12}>
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <ProductTypeDnd
              isEnableFetching={isEnableFetching}
              setIsEnableFetching={setIsEnableFetching}
            />
          )}
        </Grid> */}
      </FormProvider>
    </Grid>
  )
}

export default ProductType
