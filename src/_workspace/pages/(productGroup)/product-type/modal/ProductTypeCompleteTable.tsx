import { ProductTypeI } from '../../../../../../_workspace/types/productGroup/ProductType'

import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Pagination,
  TablePagination,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
  darken,
  lighten,
  useTheme,
  Grid,
  Divider
} from '@mui/material'

import type {
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_Updater,
  MRT_VisibilityState,
  MRT_DensityState,
  MRT_ColumnPinningState,
  MRT_ColumnOrderState,
  MRT_ColumnSizingState,
  MRT_Row,
  MRT_ColumnFilterFnsState,
  MRT_RowSelectionState
} from 'material-react-table'

import {
  MRT_ActionMenuItem,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table'

import { Controller, useForm, useFormContext } from 'react-hook-form'

import { useEffectOnce, useUpdateEffect } from 'react-use'
// import type { CustomerInvoiceToInterface } from '@/_workspace/types/customer/CustomerInvoiceTo'

import type { FormData } from '../page'
// Utils
import {
  formatToNumberIfNanThenReturnBlank,
  is_Null_Undefined_Blank
} from '@utils/formatting-checking-value/checkingValueTypes'

import CustomTextField from '@components/mui/TextField'

import type {
  SearchResultTableI,
  ParamApiSearchResultTableI,
  ParamApiSearchResultTableI_V2
} from '@libs/material-react-table/types/SearchResultTable'

import ActionsMenu from '@libs/material-react-table/components/ActionsMenu'

import StatusColumn from '@libs/material-react-table/components/StatusOption'

import { Label } from 'recharts'
import { useSearch } from '@/_workspace/react-query/hooks/useProductTypeData'
import ProductTypeCompleteTableForSearch from './ProductTypeCompleteTableForSearch'
// import { Grid } from 'react-loader-spinner'
// import ProductTypeSelectedFromCompleteTable from './ProductTypeSelectedFromCompleteTable'
// import { getUrlParamSearch } from './ProductTypeAddModal'

interface ParamApiSearchProductTypeI extends ParamApiSearchResultTableI_V2 {
  PRODUCT_TYPE_STATUS_WORKING_ID?: number | ''
  PRODUCT_TYPE_NAME?: string
  PRODUCT_TYPE_CODE?: string
  SUFFIX_FOR_PART_NUMBER?: string
  // PRODUCT_PART_NUMBER?: string
  // IS_PRODUCT_FOR_REPAIR?: string
  // IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE?: string
  PC_NAME?: string
  PRODUCT_ITEM_NAME?: string
  PRODUCT_ITEM_CODE?: string
  FFT_PART_NUMBER?: string
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID?: number | ''
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME?: string
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER?: string
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION?: string
  PRODUCT_PART_NUMBER?: string
  // inuseForSearch?: string
}

// export const getUrlParamSearch = ({
//   queryPageIndex,
//   queryPageSize,
//   querySortBy,
//   queryColumnFilterFns,
//   queryColumnFilters,
//   PRODUCT_TYPE_NAME = '',
//   PRODUCT_TYPE_CODE = '',
//   SUFFIX_FOR_PART_NUMBER = '',
//   PC_NAME = '',
//   PRODUCT_ITEM_NAME = '',
//   PRODUCT_ITEM_CODE = '',
//   FFT_PART_NUMBER = '',
//   PRODUCT_TYPE_STATUS_WORKING_ID = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION = '',
//   PRODUCT_PART_NUMBER = '',
//   inuseForSearch = ''
//   // INUSE = null
//   // INUSE = ''
//   // PRODUCT_CATEGORY_ID = ''
// }: ParamApiSearchProductTypeI): any => {
//   const params = {
//     PRODUCT_TYPE_NAME: PRODUCT_TYPE_NAME || '',
//     PRODUCT_TYPE_STATUS_WORKING_ID: PRODUCT_TYPE_STATUS_WORKING_ID || '',
//     PRODUCT_TYPE_CODE: PRODUCT_TYPE_CODE || '',
//     SUFFIX_FOR_PART_NUMBER: SUFFIX_FOR_PART_NUMBER || '',
//     // PRODUCT_PART_NUMBER: PRODUCT_PART_NUMBER.trim(),
//     PC_NAME: PC_NAME || '',
//     PRODUCT_ITEM_NAME: PRODUCT_ITEM_NAME || '',
//     PRODUCT_ITEM_CODE: PRODUCT_ITEM_CODE || '',
//     FFT_PART_NUMBER: FFT_PART_NUMBER || '',
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID || '',
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME.trim(),
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER.trim(),
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
//       PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION.trim(),
//     PRODUCT_PART_NUMBER: PRODUCT_PART_NUMBER.trim(),
//     INUSE: is_Null_Undefined_Blank(inuseForSearch) ? '' : inuseForSearch,
//     Start: queryPageIndex,
//     Limit: queryPageSize || 10,
//     Order: querySortBy?.length > 0 ? JSON.stringify(querySortBy).replace('MODIFIED_DATE', 'UPDATE_DATE') : ''
//   }

//   return params
// }

function ProductTypeCompleteTable({
  // paramForSearch,
  isEnableFetching,
  setIsEnableFetching,
  row,
  setCopyRow,
  copyRow,
  data,
  setData
}: any) {
  // react-hook-form
  const { getValues, control, setValue } = useFormContext<FormData>()

  // const reactHookFormMethods = useForm<FormData>({
  //   // ###VALIBOT####
  //   // resolver: valibotResolver(schema),
  //   // defaultValues: {
  //   //   productSub: null,
  //   //   productMain: null,
  //   //   itemCategory: null
  //   // }
  // })

  // const { getValues, control, setValue } = reactHookFormMethods
  // States

  // const selectAction = async (row: MRT_Row<FormData>) => {
  //   setCopyRow(
  //     (prevUsers: any) =>
  //       [
  //         ...prevUsers,
  //         {
  //           id: (Math.random() + 1).toString(36).substring(7),
  //           PRODUCT_TYPE_ID: row?.original?.PRODUCT_TYPE_ID,
  //           PRODUCT_TYPE_NAME: row?.original?.PRODUCT_TYPE_NAME,
  //           PRODUCT_TYPE_ALPHABET: row?.original?.PRODUCT_TYPE_ALPHABET,
  //           PRODUCT_PART_NUMBER: row?.original?.PRODUCT_PART_NUMBER,
  //           SUFFIX_FOR_PART_NUMBER: row?.original?.SUFFIX_FOR_PART_NUMBER,
  //           PRODUCT_SUB_ID: row?.original?.PRODUCT_SUB_ID,
  //           PRODUCT_SUB_NAME: row?.original?.PRODUCT_SUB_NAME,
  //           PRODUCT_SUB_ALPHABET: row?.original?.PRODUCT_SUB_ALPHABET,
  //           PRODUCT_MAIN_ID: row?.original?.PRODUCT_MAIN_ID,
  //           PRODUCT_MAIN_NAME: row?.original?.PRODUCT_MAIN_NAME,
  //           PRODUCT_MAIN_ALPHABET: row?.original?.PRODUCT_MAIN_ALPHABET,
  //           PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: row?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME,
  //           PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: row?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER,
  //           PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
  //             row?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
  //         }
  //       ] as FormData[]
  //   )
  //   console.log('setCopyRow', setCopyRow)
  //   console.log('selectAction', selectAction)
  // }

  const getMaxId = (users: any) => {
    return users.reduce((max: any, user: any) => Math.max(max, user.id), -1)
  }

  const selectAction = async (row: MRT_Row<FormData>) => {
    console.log('Row data:', row)

    setData((prevUsers: any) => {
      const maxId = getMaxId(prevUsers)

      // const originalData = row?.original;
      // if (!originalData) {
      //   console.error('Original data is missing');
      //   return prevUsers;
      // }

      const newRow = {
        id: maxId + 1,
        // id: (Math.random() + 1).toString(36).substring(7),
        dataFromCopy: true,

        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: row?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID,
        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: row?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME,
        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: row?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER,
        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
          row?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION,
        PRODUCT_PART_NUMBER: row?.original?.PRODUCT_PART_NUMBER,

        SUFFIX_FOR_PART_NUMBER: row?.original?.SUFFIX_FOR_PART_NUMBER,
        IS_PRODUCT_FOR_REPAIR: row?.original?.IS_PRODUCT_FOR_REPAIR,
        IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE: row?.original?.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE,

        ITEM_CATEGORY_ID: row?.original?.ITEM_CATEGORY_ID,
        ITEM_CATEGORY_NAME: row?.original?.ITEM_CATEGORY_NAME,
        ITEM_CATEGORY_ALPHABET: row?.original?.ITEM_CATEGORY_ALPHABET,
        ITEM_CATEGORY_SHORT_NAME: row?.original?.ITEM_CATEGORY_SHORT_NAME,

        PRODUCT_SUB_ID: row?.original?.PRODUCT_SUB_ID,
        PRODUCT_SUB_NAME: row?.original?.PRODUCT_SUB_NAME,
        PRODUCT_SUB_ALPHABET: row?.original?.PRODUCT_SUB_ALPHABET,

        PRODUCT_TYPE_ID: '',
        PRODUCT_TYPE_NAME: row?.original?.PRODUCT_TYPE_NAME,
        PRODUCT_TYPE_CODE: row?.original?.PRODUCT_TYPE_CODE,

        PRODUCT_CATEGORY_ID: row?.original?.PRODUCT_CATEGORY_ID,
        PRODUCT_CATEGORY_NAME: row?.original?.PRODUCT_CATEGORY_NAME,
        PRODUCT_CATEGORY_ALPHABET: row?.original?.PRODUCT_CATEGORY_ALPHABET,

        FLOW_ID: row?.original?.FLOW_ID,
        FLOW_NAME: row?.original?.FLOW_NAME,
        FLOW_CODE: row?.original?.FLOW_CODE,

        BOM_ID: row?.original?.BOM_ID,
        BOM_NAME: row?.original?.BOM_NAME,
        BOM_CODE: row?.original?.BOM_CODE,

        PRODUCT_MAIN_ID: row?.original?.PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: row?.original?.PRODUCT_MAIN_NAME,
        PRODUCT_MAIN_ALPHABET: row?.original?.PRODUCT_MAIN_ALPHABET,

        PRODUCT_ITEM_CODE: row?.original?.PRODUCT_ITEM_CODE,

        ACCOUNT_DEPARTMENT_CODE: row?.original?.ACCOUNT_DEPARTMENT_CODE,
        ACCOUNT_DEPARTMENT_CODE_ID: row?.original?.ACCOUNT_DEPARTMENT_CODE_ID,

        PC_NAME: row?.original?.PC_NAME,
        PRODUCT_ITEM_NAME: row?.original?.PRODUCT_ITEM_NAME,
        // PRODUCT_ITEM_ID: row?.original?.PRODUCT_ITEM_ID,

        CUSTOMER_INVOICE_TO_ID: row?.original?.CUSTOMER_INVOICE_TO_ID,
        CUSTOMER_INVOICE_TO_NAME: row?.original?.CUSTOMER_INVOICE_TO_NAME,

        IS_BOI: row?.original?.IS_BOI,
        BOI_PROJECT_NAME: row?.original?.BOI_PROJECT_NAME,
        BOI_PROJECT_CODE: row?.original?.BOI_PROJECT_CODE
      }

      const updatedRows = [...prevUsers, newRow] as FormData[]
      console.log('[getValues]updatedRows:', updatedRows)
      // setValue(`searchFilters.suffixForPartNumber.${row?.original.id}`, newRow.SUFFIX_FOR_PART_NUMBER)
      // console.log('newRow.SUFFIX_FOR_PART_NUMBER:', newRow.SUFFIX_FOR_PART_NUMBER)
      // console.log('SSSS', `searchFilters.suffixForPartNumber`, newRow.SUFFIX_FOR_PART_NUMBER)
      // console.log('SSSS', row?.original)

      return updatedRows
    })
  }

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  // const handleRowSelectionChange = (rowSelected: any) => {
  //   setRowSelected(rowSelected)
  //   console.log('Selected rows:', rowSelected)
  // }
  console.log('Selected rows Out:', rowSelection)
  // States : mui-react-table
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    getValues('searchResults.columnFilters') || []
  )
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting') || [])

  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
    // || {
    //   CREATE_BY: 'contains',
    //   CUSTOMER_INVOICE_TO_ID: 'contains',
    //   CUSTOMER_INVOICE_TO_NAME: 'contains',
    //   CUSTOMER_INVOICE_TO_ALPHABET: 'contains'
    // }
  )

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize') || 10
  })

  // const paramForSearch = ({
  //   PRODUCT_TYPE_NAME,
  //   PRODUCT_TYPE_CODE,
  //   SUFFIX_FOR_PART_NUMBER,
  //   PC_NAME,
  //   PRODUCT_ITEM_NAME,
  //   PRODUCT_ITEM_CODE,
  //   FFT_PART_NUMBER,
  //   PRODUCT_TYPE_STATUS_WORKING_ID,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION,
  //   PRODUCT_PART_NUMBER,
  //   inuseForSearch
  // }: {
  //   PRODUCT_TYPE_NAME: string
  //   PRODUCT_TYPE_CODE: string
  //   SUFFIX_FOR_PART_NUMBER: string
  //   PC_NAME: string
  //   PRODUCT_ITEM_NAME: string
  //   PRODUCT_ITEM_CODE: string
  //   FFT_PART_NUMBER: string
  //   PRODUCT_TYPE_STATUS_WORKING_ID: number
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: number
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: string
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: string
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: string
  //   PRODUCT_PART_NUMBER: string
  //   inuseForSearch: string
  // }): ParamApiSearchProductTypeI => ({
  //   queryPageIndex: pagination.pageIndex,
  //   queryPageSize: pagination.pageSize,
  //   querySortBy: sorting,
  //   queryColumnFilterFns: columnFilterFns,
  //   queryColumnFilters: columnFilters,
  //   INUSE: null,
  //   CREATE_BY: '',
  //   CREATE_DATE: '',
  //   DESCRIPTION: '',
  //   UPDATE_BY: '',
  //   UPDATE_DATE: '',
  //   PRODUCT_TYPE_NAME,
  //   PRODUCT_TYPE_CODE,
  //   SUFFIX_FOR_PART_NUMBER,
  //   PC_NAME,
  //   PRODUCT_ITEM_NAME,
  //   PRODUCT_ITEM_CODE,
  //   FFT_PART_NUMBER,
  //   PRODUCT_TYPE_STATUS_WORKING_ID,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION,
  //   PRODUCT_PART_NUMBER,
  //   inuseForSearch
  // })

  const paramForSearch: ParamApiSearchProductTypeI = {
    SearchFilters: [
      {
        id: 'PRODUCT_TYPE_NAME',
        value: getValues('searchFilters.productTypeName') || ''
      },
      {
        id: 'PRODUCT_TYPE_CODE',
        value: getValues('searchFilters.productTypeCode') || ''
      },
      {
        id: 'SUFFIX_FOR_PART_NUMBER',
        value: getValues('searchFilters.suffixForPartNumber') || ''
      },
      {
        id: 'PC_NAME',
        value: getValues('searchFilters.pcName') || ''
      },
      {
        id: 'PRODUCT_ITEM_NAME',
        value: getValues('searchFilters.productItemName') || ''
      },
      {
        id: 'PRODUCT_ITEM_CODE',
        value: getValues('searchFilters.productItemCode') || ''
      },
      {
        id: 'FFT_PART_NUMBER',
        value: getValues('searchFilters.fftPartNumber') || ''
      },
      {
        id: 'PRODUCT_TYPE_STATUS_WORKING_ID',
        value: getValues('searchFilters.productTypeStatusWorking')?.PRODUCT_TYPE_STATUS_WORKING_ID || ''
      },
      {
        id: 'inuseForSearch',
        value: 1
      }
    ],
    ColumnFilters: columnFilters?.map(item => ({
      columnFns: columnFilterFns[item.id],
      column: item.id,
      value: item.value
    })),

    // PRODUCT_CATEGORY_NAME: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_NAME ?? '',
    // PRODUCT_CATEGORY_ID: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID ?? '',

    // PRODUCT_MAIN_NAME: getValues('searchFilters.productMainName'),
    // PRODUCT_MAIN_CODE: getValues('searchFilters.productMainCode'),
    // PRODUCT_MAIN_ALPHABET: getValues('searchFilters.productMainAlphabet'),

    // inuseForSearch: getValues('searchFilters.status')?.value ?? ''
    Order: sorting,
    Start: pagination.pageIndex,
    Limit: pagination.pageSize

    //ColumnFilterFns: columnFilterFns
  }

  const {
    isRefetching: isRefetchingTypeForCopy,
    isLoading: isLoadingProductTypeForCopy,
    isError: isErrorProductTypeForCopy,
    refetch: refetchProductTypeForCopy,
    data: dataProductTypeForCopy,
    isFetching: isFetchingProductTypeForCopy
  } = useSearch(paramForSearch, true, 'PRODUCT_TYPE_FOR_COPY')

  useEffect(() => {
    if (isFetchingProductTypeForCopy === false) {
      setIsEnableFetching(false)
    }
  }, [isFetchingProductTypeForCopy, setIsEnableFetching])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, columnFilterFns, sorting, pagination])])

  // const {
  //   isRefetching: isRefetchingTypeForCopy,
  //   isLoading: isLoadingProductTypeForCopy,
  //   isError: isErrorProductTypeForCopy,
  //   refetch: refetchProductTypeForCopy,
  //   data: dataProductTypeForCopy,
  //   isFetching: isFetchingProductTypeForCopy
  // } = useSearchProductTypeForCopy( true, 'PRODUCT_TYPE_FOR_COPY')

  // console.log('dataProductTypeForCopy', dataProductTypeForCopy)
  // console.log('productTypeStatusWorking', getValues('searchFilters.productTypeStatusWorking'))
  // console.log('productTypeName', getValues('searchFilters.productTypeName'))

  // useEffect(() => {
  //   if (isFetchingProductTypeForCopy === false) {
  //     setIsEnableFetching(false)
  //   }
  // }, [isFetchingProductTypeForCopy])

  // react-table
  const columns = useMemo<MRT_ColumnDef<ProductTypeI>[]>(
    () => [
      // {
      //   accessorKey: 'INUSE',
      //   header: 'Status',
      //   size: 150,
      //   Cell: ({ cell }) => {
      //     // console.log(label)
      //     return (
      //       <>
      //         <Chip
      //           size='small'
      //           label={StatusColumn.find(dataItem => dataItem.value === cell.getValue<number>())?.label}
      //           color={StatusColumn.find(dataItem => dataItem.value === cell.getValue<string>())?.color || 'primary'}
      //         />
      //       </>
      //     )
      //   },
      //   filterSelectOptions: StatusColumn,
      //   filterVariant: 'select',
      //   enableColumnFilterModes: false
      // },

      {
        accessorKey: 'PRODUCT_TYPE_STATUS_WORKING_ID',
        header: 'STATUS',
        filterFn: 'contains',
        size: 150,

        Cell: ({ cell }) => {
          // console.log(label)

          return (
            <>
              <Chip
                variant='outlined'
                size='small'
                label={
                  cell.getValue<number>() === 1 ? 'Completed' : cell.getValue<number>() === 2 ? 'Incomplete' : 'Unknown'
                }
                // color={StatusColumn.find(dataItem => dataItem.value === cell.getValue<string>())?.color || 'primary'}
                color={cell.getValue<number>() === 1 ? 'success' : cell.getValue<number>() === 2 ? 'error' : 'primary'}
                sx={{
                  backgroundColor: 'transparent',
                  borderColor:
                    StatusColumn.find(dataItem => dataItem.value === cell.getValue<number>())?.color || 'primary.main'
                  // marginLeft: '50px'
                }}
              />
            </>
          )
        }
      },

      {
        accessorKey: 'PRODUCT_TYPE_NAME',
        header: 'PRODUCT TYPE NAME',
        filterFn: 'contains'
        // Cell: ({ renderedCellValue, row, cell }) => {
        //   return (
        //     <>
        //       {/* {JSON.stringify(MixedTypeName)} */}
        //       <Controller
        //         name='searchFilters.productType'
        //         control={control}
        //         // rules={{ required: true }}
        //         render={({ field: { value, onChange, ...fieldProps } }) => (
        //           <CustomTextField
        //             label='Product Type Name'
        //             value={row?.original?.PRODUCT_TYPE_NAME || ''}
        //             {...fieldProps}
        //             fullWidth
        //             autoComplete='off'
        //             // onChange={value => {
        //             //   onChange(value)
        //             //   console.log('valueForCopy', value)
        //             // }}
        //             disabled
        //             // {...(errors.searchFilters.specificationSettingVersionRevision && {
        //             //   error: true,
        //             //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
        //             // })}
        //             // {...(errors?.searchFilters?.productTypeName?.[row.original.id] && {
        //             //   error: true,
        //             //   helperText: errors?.searchFilters?.productTypeName?.[row.original.id].message
        //             // })}
        //           />
        //         )}
        //       />
        //     </>
        //   )
        // }
      },
      {
        accessorKey: 'PRODUCT_TYPE_CODE',
        header: 'PRODUCT TYPE CODE',
        filterFn: 'contains'
      },

      // {
      //   accessorKey: 'SUFFIX_FOR_PART_NUMBER',
      //   header: 'SUFFIX FOR PART NUMBER',
      //   filterFn: 'contains'
      // },

      // {
      //   accessorKey: 'SUFFIX_FOR_PART_NUMBER',
      //   header: 'SUFFIX FOR PART NUMBER',
      //   filterFn: 'contains'
      // },
      // {
      //   accessorKey: 'PRODUCT_FOR_REPAIR',
      //   header: 'PRODUCT FOR REPAIR',
      //   filterFn: 'contains'
      // },

      // {
      //   accessorKey: 'SELECTED_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE',
      //   header: 'SELECTED PRODUCT LEVEL FOR GEN PRODUCT TYPE CODE',
      //   filterFn: 'contains'
      // },
      // {
      //   accessorKey: 'PC_NAME',
      //   header: 'PC NAME',
      //   filterFn: 'contains'
      // },

      {
        accessorKey: 'PRODUCT_ITEM_NAME',
        header: 'PRODUCT ITEM NAME',
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_ITEM_CODE',
        header: 'PRODUCT ITEM CODE',
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
        header: 'PRODUCT SPECIFICATION DOCUMENT SETTING NAME',
        filterFn: 'contains'
      },
      {
        accessorKey: 'MODIFIED_DATE',
        header: 'UPDATE DATE',
        filterFn: 'equals'
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'UPDATE BY',
        filterFn: 'contains'
      }
    ],
    []
  )

  const isFirstRender = useRef(true)

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnFilters', columnFilters)
  }, [columnFilters])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.sorting', sorting)
  }, [sorting])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.density', density)
  }, [density])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnVisibility', columnVisibility)
  }, [columnVisibility])
  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnPinning', columnPinning)
  }, [columnPinning])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnOrder', columnOrder)
  }, [columnOrder])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnFilterFns', columnFilterFns)
  }, [columnFilterFns])

  const table = useMaterialReactTable({
    columns,
    data: dataProductTypeForCopy?.data?.ResultOnDb || [],
    rowCount: dataProductTypeForCopy?.data?.TotalCountOnDb ?? 0,
    manualFiltering: false, //turn off built-in client-side filtering
    manualPagination: true, //turn off built-in client-side pagination
    manualSorting: false, //turn off built-in client-side sorting
    onColumnFiltersChange: setColumnFilters,
    onColumnFilterFnsChange: setColumnFilterFns,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onDensityChange: setDensity,
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: setColumnOrder,
    enableRowActions: true,
    enableRowSelection: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    // getRowId: originalRow => originalRow?.PRODUCT_TYPE_ID,
    onRowSelectionChange: setRowSelection,

    isMultiSortEvent: () => true,

    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableColumnPinning: true,

    enableColumnResizing: true,
    enableColumnOrdering: true,
    paginationDisplayMode: 'pages',
    state: {
      columnFilters,
      // isLoading,
      pagination,
      // showAlertBanner: isError,
      // showProgressBars: isRefetching,
      sorting,
      // density,
      // columnVisibility,
      // columnPinning,
      columnOrder,

      columnFilterFns
    },
    // onRowSelectionChange:handleRowSelectionChange,
    // onColumnSizingChange: setColumnSizing,

    // state: {
    //   columnFilters,
    //   isLoading,
    //   pagination,
    //   showAlertBanner: isError,
    //   showProgressBars: isRefetching,
    //   sorting,
    //   density,
    //   columnVisibility,
    //   columnPinning,
    //   columnOrder,
    //   columnSizing,
    //   columnFilterFns
    // },
    defaultColumn: {
      //minSize: 80, //allow columns to get smaller than default
      //maxSize: 400, //allow columns to get larger than default
      size: 300 //make columns wider by default
      // muiFilterTextFieldProps: { placeholder: '' }
      // grow: true
    },
    layoutMode: 'grid',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Actions',
        size: 100,
        grow: false,
        muiTableHeadCellProps: {
          align: 'center'
        }
      }
      // ,
      // 'mrt-row-select': {
      //   enableColumnActions: true,
      //   enableHiding: true,
      //   size: 100,
      //   muiTableHeadCellProps: {
      //     align: 'center'
      //   },
      //   muiTableBodyCellProps: {
      //     align: 'center'
      //   }
      // }
    },
    renderTopToolbarCustomActions: () => (
      <div className='flex gap-1'>
        <div className='flex items-center gap-1'>
          <Typography className='hidden sm:block'>Show</Typography>
          <Controller
            name='searchResults.pageSize'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <CustomTextField
                {...fieldProps}
                select
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                  onChange(Number(e.target.value))
                }}
                className='is-[80px]'
                style={{ zIndex: 2001 }}
              >
                <MenuItem value='10'>10</MenuItem>
                <MenuItem value='25'>25</MenuItem>
                <MenuItem value='50'>50</MenuItem>
                <MenuItem value='100'>100</MenuItem>
              </CustomTextField>
            )}
          />
          <Typography className='hidden sm:block'>Entries</Typography>
        </div>
        {/* <Button variant='tonal' onClick={() => table.resetSorting(true)}>
          Clear All Sorting
        </Button> */}
        {/* <Tooltip arrow title='Clear All Sorting' onClick={() => table.resetSorting(true)}>
          <IconButton>
            <Badge badgeContent={sorting.length ?? 0} color='primary'>
              <SwapVertIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
          <IconButton>
            <Badge badgeContent={columnFilters.length ?? 0} color='primary'>
              <FilterListIcon />
            </Badge>
          </IconButton>
        </Tooltip>
 */}
      </div>
    ),
    renderRowActions: ({ row }) => (
      <div className='flex items-center'>
        <Button
          sx={{
            backgroundColor: 'transparent',
            color: 'grey',
            '&:hover': {
              color: 'white'
            }
          }}
          variant='contained'
          onClick={() => selectAction(row)}
        >
          Copy
        </Button>
      </div>
    ),
    renderBottomToolbar: ({ table }) => (
      <div className='flex items-center justify-end gap-2 p-3'>
        <div className='flex items-center gap-2'>
          <Typography variant='body1'>
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
            {pagination.pageIndex * pagination.pageSize + (dataProductTypeForCopy?.data?.ResultOnDb?.length || 0)} of{' '}
            {table.getRowCount()} entries
          </Typography>
          {/* <MRT_TablePagination table={table} showRowsPerPage={false} /> */}

          <Pagination
            count={table.getPageOptions()?.length}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(event, value: number) => table.setPageIndex(value - 1)}
            variant='tonal'
            shape='rounded'
            color='primary'
          />
        </div>
      </div>
    ),
    muiTableContainerProps: {
      sx: {
        maxHeight: '300px'
      }
    },
    initialState: {
      showColumnFilters: false
    },

    muiPaginationProps: {
      showRowsPerPage: false
    },

    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600,
        textTransform: 'uppercase',

        backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.25)'
      }
    },
    muiTableBodyProps: {
      sx: {
        '& tr:nth-of-type(odd) > td': {
          backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.055)'
        }
      }
    },

    muiTableBodyCellProps: {
      sx: theme => ({
        backgroundColor: 'var(--mui-palette-background-default)',
        fontSize: 15
      })
    },

    muiTopToolbarProps: {
      sx: {
        backgroundColor: 'var(--mui-palette-background-default)'
      }
    }
    // muiTablePaperProps: ({ table }) => ({
    //   elevation: 0, //change the mui box shadow
    //   //customize paper styles
    //   style: {
    //     zIndex: table.getState().isFullScreen ? 2000 : undefined
    //   },
    //   sx: {
    //     borderRadius: '0'
    //   }
    // })
  })

  //Add Data From Copy

  // const onMutateSuccess = data => {
  //   if (data.data && data.data.Status == true) {
  //     const message = {
  //       message: data.data.Message,
  //       title: 'Add Product Type'
  //     }
  //     setIsEnableFetching(true)
  //     queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  //     ToastMessageSuccess(message)
  //     handleClose()
  //     // ToastMessageError(message)
  //   }
  // }

  // const onMutateError = e => {
  //   const message = {
  //     title: 'Add Product Type',
  //     message: e.message
  //   }

  //   ToastMessageError(message)
  // }

  // const mutation = useCreateProductType(onMutateSuccess, onMutateError)

  // const onError: SubmitErrorHandler<FormData> = data => {
  //   console.log(data)
  // }

  // // Hooks : react-query
  // const queryClient = useQueryClient()

  return (
    <>
      {/* {JSON.stringify(copyRow)}
      {JSON.stringify(dataProductTypeForCopy?.data?.ResultOnDb)}
      <pre>{JSON.stringify(rowSelection, null, 2)}</pre> */}
      {/* {'JSON.stringify(data?.data?.ResultOnDb)'} */}

      {/* <Grid item xs={12}>
        <Divider textAlign='left'>
          <Typography variant='h5' color='primary'>
            Completed Product Type ( 16 Digits )
          </Typography>
        </Divider>
      </Grid>
      <br /> */}

      {/* <Card sx={{ maxWidth: 1700, margin: 'auto' }}>
        <DialogContent>
          <Grid item xs={12}>

            <Typography variant='h7' color='primary'>
              Completed Product Type For Copy
            </Typography>

          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MaterialReactTable table={table} />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ marginY: 2 }} />
              <Typography variant='h7' color='primary' gutterBottom>
                Product Types Data From Being Copied
              </Typography>
              <ProductTypeSelectedFromCompleteTable data={copyRow || []} setData={setCopyRow} />
            </Grid>
          </Grid>
        </DialogContent>
      </Card> */}
      <DialogContent>
        <Grid alignItems='center'>
          {/* <Grid item xs={12}> */}
          <ProductTypeCompleteTableForSearch
            // isEnableFetching={isEnableFetching}
            setIsEnableFetching={setIsEnableFetching}
            // copyRow={copyRow || []}
            // setCopyRow={setCopyRow}
            // data={dataRow || []}
            // setData={setData}
          />
        </Grid>
      </DialogContent>

      <MaterialReactTable table={table} />
    </>
  )
}

export default ProductTypeCompleteTable
