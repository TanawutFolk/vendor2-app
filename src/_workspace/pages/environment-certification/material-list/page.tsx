// React Imports
import { useState } from 'react'

// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

// Components Imports
import MaterialListSearch from './MaterialListSearch'
import MaterialListWatch from './MaterialListWatch'
import MaterialListTableData from './MaterialListTableData'

// Third-party Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  any,
  array,
  boolean,
  empty,
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
  unknown,
  value
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
    ITEM_CATEGORY: pipe(
      array(
        object({
          ITEM_CATEGORY_ID: number(),
          ITEM_CATEGORY_NAME: string()
        })
      ),
      minLength(0)
    ),
    PRODUCT_CATEGORY: nullable(
      object({
        PRODUCT_CATEGORY_ID: number(),
        PRODUCT_CATEGORY_NAME: string()
      })
    ),
    PRODUCT_MAIN: nullable(
      object({
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string()
      })
    ),
    PRODUCT_SUB: nullable(
      object({
        PRODUCT_SUB_ID: number(),
        PRODUCT_SUB_NAME: string()
      })
    ),
    PRODUCT_TYPE: nullable(
      object({
        PRODUCT_TYPE_ID: number(),
        PRODUCT_TYPE_NAME: string()
      })
    ),
    CUSTOMER_INVOICE_TO: nullable(
      object({
        CUSTOMER_INVOICE_TO_ID: number(),
        CUSTOMER_INVOICE_TO_NAME: string()
      })
    ),
    EXPORT_MODE: object({
      value: number(),
      label: string()
    })
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
  'ITEM_CATEGORY_NAME',
  'PRODUCT_CATEGORY_NAME',
  'PRODUCT_MAIN_NAME',
  'PRODUCT_SUB_NAME',
  'PRODUCT_TYPE_CODE',
  'PRODUCT_TYPE_NAME',
  'CUSTOMER_INVOICE_TO_NAME',
  'PRODUCT_TYPE_CODE_SUB',
  'PRODUCT_TYPE_NAME_SUB',
  'BOM_CODE',
  'M_CODE_MES',
  'ITEM_CATEGORY_FROM_BOM',
  'MATERIAL_EXTERNAL_FULL_NAME',
  'MATERIAL_EXTERNAL_SHORT_NAME',
  'PURCHASE_SPECIFICATION_NO',
  'DRAWING_NO',
  'MADE_BY',
  'VENDOR_NAME',
  'MAKER_NAME',
  'ITEM_CATEGORY_FROM_ITEM_MASTER',
  'RoSH10',
  'REACH',
  'Green_NTT',
  'ChemSHERPA',
  'Conflict_Minerals',
  'Packaging_Waste'
]

const MaterialListPage = () => {
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
            EXPORT_MODE: {
              value: 1,
              label: 'Product With M-Code'
            },
            ITEM_CATEGORY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.ITEM_CATEGORY || [],
            PRODUCT_CATEGORY:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.PRODUCT_CATEGORY || null,
            PRODUCT_MAIN:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.PRODUCT_MAIN || null,
            PRODUCT_SUB:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.PRODUCT_SUB || null,

            PRODUCT_TYPE:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.PRODUCT_TYPE || null,
            CUSTOMER_INVOICE_TO:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters
                .CUSTOMER_INVOICE_TO_NAME || null
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
              ITEM_CATEGORY_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ITEM_CATEGORY_NAME ?? true,
              PRODUCT_CATEGORY_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_CATEGORY_NAME ?? true,
              PRODUCT_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_MAIN_NAME ?? true,
              PRODUCT_SUB_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_SUB_NAME ?? true,
              PRODUCT_TYPE_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_TYPE_CODE ?? true,
              PRODUCT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PRODUCT_TYPE_NAME ?? true,
              CUSTOMER_INVOICE_TO_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CUSTOMER_INVOICE_TO_NAME ?? true,
              PRODUCT_TYPE_CODE_SUB:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility[
                  'PRODUCT_TYPE_CODE_SUB'
                ] ?? true,
              PRODUCT_TYPE_NAME_SUB:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility[
                  'PRODUCT_TYPE_NAME_SUB'
                ] ?? true,
              BOM_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .BOM_CODE ?? true,
              M_CODE_MES:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility[
                  'M_CODE_MES'
                ] ?? true,
              ITEM_CATEGORY_FROM_BOM:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility[
                  'ITEM_CATEGORY_FROM_BOM'
                ] ?? true,
              MATERIAL_EXTERNAL_FULL_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .MATERIAL_EXTERNAL_FULL_NAME ?? true,
              MATERIAL_EXTERNAL_SHORT_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .MATERIAL_EXTERNAL_SHORT_NAME ?? true,
              PURCHASE_SPECIFICATION_NO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .PURCHASE_SPECIFICATION_NO ?? true,
              DRAWING_NO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .DRAWING_NO ?? true,
              MADE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .MADE_BY ?? true,
              VENDOR_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .VENDOR_NAME ?? true,
              MAKER_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .MAKER_NAME ?? true,
              ITEM_CATEGORY_FROM_ITEM_MASTER:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility[
                  'ITEM_CATEGORY_FROM_ITEM_MASTER'
                ] ?? true,
              RoSH10:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .RoSH10 ?? true,
              REACH:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .REACH ?? true,
              Green_NTT:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .Green_NTT ?? true,
              ChemSHERPA:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .ChemSHERPA ?? true,
              Conflict_Minerals:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .Conflict_Minerals ?? true,
              Packaging_Waste:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .Packaging_Waste ?? true
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
              ITEM_CATEGORY_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ITEM_CATEGORY_NAME || MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_CATEGORY_NAME || MRT_FilterFns.contains.name,
              PRODUCT_MAIN_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_MAIN_NAME || MRT_FilterFns.contains.name,
              PRODUCT_SUB_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_SUB_NAME || MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_TYPE_CODE || MRT_FilterFns.contains.name,
              PRODUCT_TYPE_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PRODUCT_TYPE_NAME || MRT_FilterFns.contains.name,
              CUSTOMER_INVOICE_TO_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CUSTOMER_INVOICE_TO_NAME || MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE_SUB:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns[
                  'PRODUCT_TYPE_CODE_SUB'
                ] || MRT_FilterFns.contains.name,
              PRODUCT_TYPE_NAME_SUB:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns[
                  'PRODUCT_TYPE_NAME_SUB'
                ] || MRT_FilterFns.contains.name,
              BOM_CODE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .BOM_CODE || MRT_FilterFns.contains.name,
              M_CODE_MES:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns[
                  'M_CODE_MES'
                ] || MRT_FilterFns.contains.name,
              ITEM_CATEGORY_FROM_BOM:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns[
                  'ITEM_CATEGORY_FROM_BOM'
                ] || MRT_FilterFns.contains.name,
              MATERIAL_EXTERNAL_FULL_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .MATERIAL_EXTERNAL_FULL_NAME || MRT_FilterFns.contains.name,
              MATERIAL_EXTERNAL_SHORT_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .MATERIAL_EXTERNAL_SHORT_NAME || MRT_FilterFns.contains.name,
              PURCHASE_SPECIFICATION_NO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .PURCHASE_SPECIFICATION_NO || MRT_FilterFns.contains.name,
              DRAWING_NO:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .DRAWING_NO || MRT_FilterFns.contains.name,
              MADE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .MADE_BY || MRT_FilterFns.contains.name,
              VENDOR_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .VENDOR_NAME || MRT_FilterFns.contains.name,
              MAKER_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .MAKER_NAME || MRT_FilterFns.contains.name,
              ITEM_CATEGORY_FROM_ITEM_MASTER:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns[
                  'ITEM_CATEGORY_FROM_ITEM_MASTER'
                ] || MRT_FilterFns.contains.name,
              RoSH10:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .RoSH10 || MRT_FilterFns.contains.name,
              REACH:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns.REACH ||
                MRT_FilterFns.contains.name,
              Green_NTT:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .Green_NTT || MRT_FilterFns.contains.name,
              ChemSHERPA:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .ChemSHERPA || MRT_FilterFns.contains.name,
              Conflict_Minerals:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .Conflict_Minerals || MRT_FilterFns.contains.name,
              Packaging_Waste:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .Packaging_Waste || MRT_FilterFns.contains.name
            }
          }
        }
      } catch (error) {
        return {
          searchFilters: {
            EXPORT_MODE: {
              value: 1,
              label: 'Product With M-Code'
            },
            ITEM_CATEGORY: [],
            PRODUCT_CATEGORY: null,
            PRODUCT_MAIN: null,
            PRODUCT_SUB: null,
            PRODUCT_TYPE: null,
            CUSTOMER_INVOICE_TO_NAME: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'comfortable',
            columnVisibility: {
              inuseForSearch: true,
              ITEM_CATEGORY_NAME: true,
              PRODUCT_CATEGORY_NAME: true,
              PRODUCT_MAIN_NAME: true,
              PRODUCT_SUB_NAME: true,
              PRODUCT_TYPE_CODE: true,
              PRODUCT_TYPE_NAME: true,
              CUSTOMER_INVOICE_TO_NAME: true,
              PRODUCT_TYPE_CODE_SUB: true,
              PRODUCT_TYPE_NAME_SUB: true,
              BOM_CODE: true,
              M_CODE_MES: true,
              ITEM_CATEGORY_FROM_BOM: true,
              MATERIAL_EXTERNAL_FULL_NAME: true,
              MATERIAL_EXTERNAL_SHORT_NAME: true,
              PURCHASE_SPECIFICATION_NO: true,
              DRAWING_NO: true,
              MADE_BY: true,
              VENDOR_NAME: true,
              MAKER_NAME: true,
              ITEM_CATEGORY_FROM_ITEM_MASTER: true,
              RoSH10: true,
              REACH: true,
              Green_NTT: true,
              ChemSHERPA: true,
              Conflict_Minerals: true,
              Packaging_Waste: true
            },
            columnPinning: {
              left: [],
              right: []
            },
            columnOrder: columns,
            columnFilterFns: {
              ITEM_CATEGORY_NAME: MRT_FilterFns.contains.name,
              PRODUCT_CATEGORY_NAME: MRT_FilterFns.contains.name,
              PRODUCT_MAIN_NAME: MRT_FilterFns.contains.name,
              PRODUCT_SUB_NAME: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_NAME: MRT_FilterFns.contains.name,
              CUSTOMER_INVOICE_TO_NAME: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_CODE_SUB: MRT_FilterFns.contains.name,
              PRODUCT_TYPE_NAME_SUB: MRT_FilterFns.contains.name,
              BOM_CODE: MRT_FilterFns.contains.name,
              M_CODE_MES: MRT_FilterFns.contains.name,
              ITEM_CATEGORY_FROM_BOM: MRT_FilterFns.contains.name,
              MATERIAL_EXTERNAL_FULL_NAME: MRT_FilterFns.contains.name,
              MATERIAL_EXTERNAL_SHORT_NAME: MRT_FilterFns.contains.name,
              PURCHASE_SPECIFICATION_NO: MRT_FilterFns.contains.name,
              DRAWING_NO: MRT_FilterFns.contains.name,
              MADE_BY: MRT_FilterFns.contains.name,
              VENDOR_NAME: MRT_FilterFns.contains.name,
              MAKER_NAME: MRT_FilterFns.contains.name,
              ITEM_CATEGORY_FROM_ITEM_MASTER: MRT_FilterFns.contains.name,
              RoSH10: MRT_FilterFns.contains.name,
              REACH: MRT_FilterFns.contains.name,
              Green_NTT: MRT_FilterFns.contains.name,
              ChemSHERPA: MRT_FilterFns.contains.name,
              Conflict_Minerals: MRT_FilterFns.contains.name,
              Packaging_Waste: MRT_FilterFns.contains.name
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
    //setIsEnableFetching(true)
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
      Environment Certificate
    </Typography>,
    <Typography
      key='3'
      color='text.primary'
      sx={{
        color: 'var(--mui-palette-text-primary) !important'
      }}
    >
      Material List
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
            Material List
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
          {isLoading ? null : <MaterialListWatch />}
        </Grid>
        <Grid item xs={12}>
          <MaterialListSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            'Loading'
          ) : (
            <MaterialListTableData isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default MaterialListPage
