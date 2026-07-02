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

import RefreshIcon from '@mui/icons-material/Refresh'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import FilterListIcon from '@mui/icons-material/FilterList'

import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'

import { useEffectOnce, useUpdateEffect } from 'react-use'
// import type { CustomerInvoiceToInterface } from '@/_workspace/types/customer/CustomerInvoiceTo'

import type { FormData } from '../page'
// Utils
import {
  formatToNumberIfNanThenReturnBlank,
  is_Null_Undefined_Blank
} from '@utils/formatting-checking-value/checkingValueTypes'

import CustomTextField from '@components/mui/TextField'

import type { SearchResultTableI, ParamApiSearchResultTableI } from '@libs/material-react-table/types/SearchResultTable'

import ActionsMenu from '@libs/material-react-table/components/ActionsMenu'

import StatusColumn from '@libs/material-react-table/components/StatusOption'

import { Label } from 'recharts'
import {
  useSearchSpecificationSetting,
  useSearchSpecificationSettingForCopy
} from '@/_workspace/react-query/hooks/useSpecificationSettingData'
import { SpecificationSettingI } from '@/_workspace/types/specification-setting/SpecificationSetting'
import SpecificationSettingCompleteTableForSearch from './SpecificationSettingCompleteTableForSearch'
import { json } from 'stream/consumers'
import { tree } from 'next/dist/build/templates/app-page'
import SelectCustom from '@/components/react-select/SelectCustom'

// import { Grid } from 'react-loader-spinner'
// import ProductTypeSelectedFromCompleteTable from './ProductTypeSelectedFromCompleteTable'

interface ParamApiSearchSpecificationI extends ParamApiSearchResultTableI {
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME?: string
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER?: string
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION?: string
  PRODUCT_PART_NUMBER?: string
  PRODUCT_MAIN_ID?: number | ''
  PRODUCT_MAIN_NAME?: string
  CUSTOMER_ORDER_FROM_ID?: number | ''
  CUSTOMER_ORDER_FROM_NAME?: string
  PRODUCT_SPECIFICATION_TYPE_ID?: number | ''
  PRODUCT_SPECIFICATION_TYPE_NAME?: string
  PRODUCT_MODEL_NUMBER?: string
  // inuseForSearch?: string
}

export interface ReturnApiSearchSpecificationI {
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID?: number | ''
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME?: string
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER?: string | ''
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION?: string | ''
  PRODUCT_PART_NUMBER?: string | ''
  PRODUCT_MAIN_ID?: number | ''
  PRODUCT_SPECIFICATION_TYPE_ID?: number | ''
  PRODUCT_MAIN_NAME?: string
  CUSTOMER_ORDER_FROM_ID?: number | ''
  CUSTOMER_ORDER_FROM_NAME?: string
  PRODUCT_SPECIFICATION_TYPE_NAME?: string
  PRODUCT_MODEL_NUMBER?: string
  ColumnFilters: string
}

// const getUrlParamSearch = ({
//   queryPageIndex,
//   queryPageSize,
//   querySortBy,
//   queryColumnFilterFns,
//   queryColumnFilters,
//   // PRODUCT_SPECIFICATION_SETTING_ID = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME = '',
//   PRODUCT_MAIN_ID = '',
//   PRODUCT_MAIN_NAME = '',
//   CUSTOMER_ORDER_FROM_ID = '',
//   CUSTOMER_ORDER_FROM_NAME = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION = '',
//   PRODUCT_SPECIFICATION_TYPE_NAME = '',
//   PRODUCT_SPECIFICATION_TYPE_ID = '',
//   PRODUCT_MODEL_NUMBER = '',
//   PRODUCT_PART_NUMBER = '',
//   inuseForSearch = ''
//   // INUSE = null
//   // INUSE = ''
//   // PRODUCT_CATEGORY_ID = ''
// }: ParamApiSearchSpecificationI): any => {
//   const columnFilterQuery = queryColumnFilters?.map(item => ({
//     columnFns: queryColumnFilterFns[item.id],
//     column: item.id.replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE'),
//     value: item.value
//   }))

//   const params = {
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME || '',
//     // PRODUCT_SPECIFICATION_SETTING_ID: PRODUCT_SPECIFICATION_SETTING_ID || '',
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER || '',
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
//       PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION || '',
//     PRODUCT_MAIN_ID: PRODUCT_MAIN_ID || '',
//     PRODUCT_PART_NUMBER: PRODUCT_PART_NUMBER || '',
//     PRODUCT_MAIN_NAME: PRODUCT_MAIN_NAME,
//     PRODUCT_SPECIFICATION_TYPE_NAME: PRODUCT_SPECIFICATION_TYPE_NAME,
//     PRODUCT_SPECIFICATION_TYPE_ID: PRODUCT_SPECIFICATION_TYPE_ID || '',
//     CUSTOMER_ORDER_FROM_NAME: CUSTOMER_ORDER_FROM_NAME,
//     PRODUCT_MODEL_NUMBER: PRODUCT_MODEL_NUMBER,
//     CUSTOMER_ORDER_FROM_ID: CUSTOMER_ORDER_FROM_ID || '',
//     INUSE: is_Null_Undefined_Blank(inuseForSearch) ? '' : inuseForSearch,
//     Start: queryPageIndex,
//     Limit: queryPageSize || 10,
//     Order: querySortBy?.length > 0 ? JSON.stringify(querySortBy).replace('MODIFIED_DATE', 'UPDATE_DATE') : '',
//     ColumnFilters: JSON.stringify(columnFilterQuery)
//   }

//   return params
// }

function SpecificationSettingCompleteTable({
  row,
  setCopyRow,
  copyRow,
  data,
  setData,
  setIsEnableFetching,
  isEnableFetching
}: any) {
  // react-hook-form
  const { watch, getValues, control, setValue } = useFormContext<FormData>()

  const [isCopying, setIsCopying] = useState(false)

  const [isReadyToFetch, setIsReadyToFetch] = useState(false)

  const getMaxId = (users: any) => {
    return users.reduce((max: any, user: any) => Math.max(max, user.id), -1)
  }

  const selectAction = async (row: MRT_Row<FormData>) => {
    console.log('Row data:', row)
    setIsCopying(true)
    setData((prevUsers: any) => {
      const maxId = getMaxId(prevUsers)

      const newRow = {
        // id: maxId + 1,
        id: (Math.random() + 1).toString(36).substring(7),
        dataFromCopy: true,
        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: row?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME,
        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: row?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER,
        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
          row?.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION,
        PRODUCT_PART_NUMBER: row?.original?.PRODUCT_PART_NUMBER,
        PRODUCT_MODEL_NUMBER: row?.original?.PRODUCT_MODEL_NUMBER,

        PRODUCT_MAIN_ID: row?.original?.PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: row?.original?.PRODUCT_MAIN_NAME,

        PRODUCT_SPECIFICATION_TYPE_ID: row?.original?.PRODUCT_SPECIFICATION_TYPE_ID,
        PRODUCT_SPECIFICATION_TYPE_NAME: row?.original?.PRODUCT_SPECIFICATION_TYPE_NAME,

        CUSTOMER_ORDER_FROM_ID: row?.original?.CUSTOMER_ORDER_FROM_ID,
        CUSTOMER_ORDER_FROM_NAME: row?.original?.CUSTOMER_ORDER_FROM_NAME
      }
      setValue(
        `searchFilters.specificationSettingVersionRevision.${newRow.id}`,
        newRow.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
      )
      setValue(`searchFilters.productMain.${newRow.id}`, {
        PRODUCT_MAIN_ID: row.original.PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: row.original.PRODUCT_MAIN_NAME
      })
      setValue(`searchFilters.specificationSetting.${newRow.id}`, newRow?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME)
      setValue(
        `searchFilters.specificationSettingNumber.${newRow.id}`,
        newRow?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
      )
      setValue(`searchFilters.partNumber.${newRow.id}`, newRow?.PRODUCT_PART_NUMBER)

      setValue(`searchFilters.productSpecificationType.${newRow.id}`, {
        PRODUCT_SPECIFICATION_TYPE_ID: row.original.PRODUCT_SPECIFICATION_TYPE_ID,
        PRODUCT_SPECIFICATION_TYPE_NAME: row.original.PRODUCT_SPECIFICATION_TYPE_NAME
      })

      setValue(`searchFilters.customerOrderFrom.${newRow.id}`, {
        CUSTOMER_ORDER_FROM_ID: row.original.CUSTOMER_ORDER_FROM_ID,
        CUSTOMER_ORDER_FROM_NAME: row.original.CUSTOMER_ORDER_FROM_NAME
      })

      const updatedRows = [...prevUsers, newRow] as FormData[]
      console.log('[getValues]updatedRows:', updatedRows)
      return updatedRows
    })
    setIsCopying(true)
  }

  useEffect(() => {
    console.log('watch()', watch())
  }, [watch()])

  useEffect(() => {
    if (!isCopying) {
      setIsReadyToFetch(true) // Set to true only when fetching is needed
    }
  }, [isCopying])

  // const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  // const handleRowSelectionChange = (rowSelected: any) => {
  //   setRowSelected(rowSelected)
  //   console.log('Selected rows:', rowSelected)
  // }
  // console.log('Selected rows Out:', rowSelection)
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
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))

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
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME,
  //   PRODUCT_SPECIFICATION_TYPE_NAME,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION,
  //   PRODUCT_PART_NUMBER,
  //   PRODUCT_MODEL_NUMBER,
  //   inuseForSearch
  // }: {
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: string
  //   PRODUCT_SPECIFICATION_TYPE_NAME: string
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: string
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: string
  //   PRODUCT_PART_NUMBER: string
  //   PRODUCT_MODEL_NUMBER: string
  //   inuseForSearch: string
  // }): ParamApiSearchSpecificationI => ({
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
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME,
  //   PRODUCT_SPECIFICATION_TYPE_NAME,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER,
  //   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION,
  //   PRODUCT_PART_NUMBER,
  //   PRODUCT_MODEL_NUMBER,
  //   inuseForSearch
  // })

  const paramForSearch: ParamApiSearchSpecificationI = {
    SearchFilters: [
      {
        id: 'PRODUCT_MAIN_ID',
        value: getValues('searchFilters.productMain1')?.PRODUCT_MAIN_ID || ''
      },
      {
        id: 'CUSTOMER_ORDER_FROM_ID',
        value: getValues('searchFilters.customerOrderFrom1')?.CUSTOMER_ORDER_FROM_ID || ''
      },
      {
        id: 'PRODUCT_SPECIFICATION_TYPE_ID',
        value: getValues('searchFilters.productSpecificationType1')?.PRODUCT_SPECIFICATION_TYPE_ID || ''
      },
      {
        id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
        value: getValues('searchFilters.specificationSetting1') || ''
      },
      {
        id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER',
        value: getValues('searchFilters.specificationSettingNumber1') || ''
      },
      {
        id: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION',
        value: getValues('searchFilters.specificationSettingVersionRevision1') || ''
      },
      {
        id: 'PRODUCT_PART_NUMBER',
        value: getValues('searchFilters.partNumber1') || ''
      },
      {
        id: 'PRODUCT_MODEL_NUMBER',
        value: getValues('searchFilters.modelNumber1') || ''
      },
      {
        id: 'inuseForSearch',
        value: getValues('searchFilters.status1')?.value ?? ''
      }
    ],
    Order: sorting || [],
    Start: pagination.pageIndex,
    Limit: pagination.pageSize,
    ColumnFilters: columnFilters?.map(item => ({
      columnFns: columnFilterFns[item.id],
      column: item.id,
      value: item.value
    }))

    // queryPageIndex: pagination.pageIndex,
    // queryPageSize: pagination.pageSize,
    // querySortBy: sorting,
    // queryColumnFilterFns: columnFilterFns,
    // queryColumnFilters: columnFilters,
    // INUSE: null,
    // CREATE_BY: '',
    // CREATE_DATE: '',
    // DESCRIPTION: '',
    // UPDATE_BY: '',
    // UPDATE_DATE: '',
    // CUSTOMER_ORDER_FROM_ID: getValues('searchFilters.customerOrderFrom1')?.CUSTOMER_ORDER_FROM_ID || '',
    // CUSTOMER_ORDER_FROM_NAME: getValues('searchFilters.customerOrderFrom1')?.CUSTOMER_ORDER_FROM_NAME || '',
    // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: getValues('searchFilters.specificationSetting1') || '',
    // PRODUCT_SPECIFICATION_TYPE_NAME:
    //   getValues('searchFilters.productSpecificationType1')?.PRODUCT_SPECIFICATION_TYPE_NAME || '',
    // PRODUCT_SPECIFICATION_TYPE_ID:
    //   getValues('searchFilters.productSpecificationType1')?.PRODUCT_SPECIFICATION_TYPE_ID || '',

    // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
    //   getValues('searchFilters.specificationSettingVersionRevision1') || '',
    // PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: getValues('searchFilters.specificationSettingNumber1') || '',
    // PRODUCT_PART_NUMBER: getValues('searchFilters.partNumber1') || '',
    // PRODUCT_MAIN_ID: getValues('searchFilters.productMain1')?.PRODUCT_MAIN_ID || '',
    // PRODUCT_MAIN_NAME: getValues('searchFilters.productMain1')?.PRODUCT_MAIN_NAME || '',
    // inuseForSearch: getValues('searchFilters.status')?.value || null
  }

  const reactHookFormMethodsForCopyPage = useForm<FormData>({
    // ###VALIBOT####
    // resolver: valibotResolver(schema)
    // defaultValues: {
    //   // @ts-ignore
    //   productMain: null,
    //   process: null,
    // }
    // resolver: valibotResolver(schema),
    defaultValues: {
      productSpecificationType1: null,
      specificationSettingVersionRevision1: '',
      specificationSettingNumber1: '',
      partNumber1: '',
      modelNumber1: null,
      specificationSetting1: '',
      productMain1: null,
      customerOrderFrom1: null,
      // status: null
      searchResults: {
        pageSize: 10
      }
    }
  })

  const {
    control: controlForCopyPage,
    handleSubmit: handleSubmitForCopyPage,
    getValues: getValuesForCopyPage,
    watch: watchForCopyPage,
    setValue: setValueForCopyPage,
    reset: resetForCopyPage,
    unregister: unregisterForCopyPage,
    register: registerForCopyPage,
    trigger: triggerForCopyPage
  } = reactHookFormMethodsForCopyPage

  const {
    isRefetching: isRefetchingTypeForCopy,
    isLoading: isLoadingProductTypeForCopy,
    isError: isErrorProductTypeForCopy,
    refetch: refetchProductTypeForCopy,
    data: dataSpecificationForCopy,
    isFetching: isFetchingSpecificationForCopy
  } = useSearchSpecificationSetting(
    // getUrlParamSearch(
    //   paramForSearch({
    //     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: getValues('searchFilters.specificationSetting') || '',
    //     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: getValues('searchFilters.specificationSettingNumber') || '',
    //     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
    //       getValues('searchFilters.specificationSettingVersionRevision') || '',
    //     PRODUCT_MAIN_ID: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID || '',
    //     PRODUCT_MAIN_NAME: getValues('searchFilters.productMain')?.PRODUCT_MAIN_NAME || '',
    //     CUSTOMER_ORDER_FROM_ID: getValues('searchFilters.customerOrderFrom')?.CUSTOMER_ORDER_FROM_ID || '',
    //     CUSTOMER_ORDER_FROM_NAME: getValues('searchFilters.customerOrderFrom')?.CUSTOMER_ORDER_FROM_NAME || '',
    //     PRODUCT_PART_NUMBER: getValues('searchFilters.partNumber') || '',
    //     PRODUCT_MODEL_NUMBER: getValues('searchFilters.modelNumber') || '',
    //     status: 1 || null
    //   })
    // ),
    paramForSearch,
    // isReadyToFetch,
    isEnableFetching,
    'SPECIFICATION_SETTING_FOR_COPY'
  )
  console.log('dataSpecificationForCopy', dataSpecificationForCopy)
  // console.log('isCopyingggggggg', !isCopying)

  useEffect(() => {
    if (isFetchingSpecificationForCopy === false) {
      setIsEnableFetching(false)
    }
  }, [isFetchingSpecificationForCopy])

  useEffect(() => {
    table.setPageSize(10)
  }, [])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, columnFilterFns, sorting, pagination])])
  // const selectAction = async row => {
  //   setIsCopying(true)
  //   // Copy logic
  //   setIsCopying(false)
  // }

  // react-table
  const columns = useMemo<MRT_ColumnDef<SpecificationSettingI>[]>(
    () => [
      {
        accessorKey: 'inuseForSearch',
        header: 'Status',
        size: 180,
        Cell: ({ cell }) => {
          // console.log(label)
          return (
            <>
              <Chip
                size='small'
                label={StatusColumn.find(dataItem => dataItem.value === cell.getValue<number>())?.label}
                color={StatusColumn.find(dataItem => dataItem.value === cell.getValue<string>())?.color || 'primary'}
              />
            </>
          )
        },
        filterSelectOptions: StatusColumn,
        filterVariant: 'select',
        enableColumnFilterModes: false,
        Filter: ({ column }) => {
          const idValue = getValues('searchResults.columnFilters').find((item: any) => item.id === column.id)

          let status: typeof StatusColumn = []

          if (idValue?.value?.length > 0) {
            status = StatusColumn.filter(dataItem => idValue?.value?.includes(dataItem.value))
          }

          return (
            <SelectCustom
              value={status}
              isMulti
              isClearable
              options={StatusColumn}
              classNamePrefix='select'
              placeholder='Select Status ...'
              onChange={e => {
                const value = e?.map(status => status.value) ?? []

                column.setFilterValue(value)
              }}
            />
          )
        }
      },

      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
        header: 'PRODUCT SPECIFICATION DOCUMENT SETTING NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },

      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER',
        header: 'PRODUCT SPECIFICATION DOCUMENT SETTING NUMBER',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION',
        header: 'PRODUCT SPECIFICATION DOCUMENT SETTING VERSION REVISION',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_PART_NUMBER',
        header: 'PRODUCT PART_NUMBER',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_MODEL_NUMBER',
        header: 'Product Model Number',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'PRODUCT MAIN',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'CUSTOMER_ORDER_FROM_NAME',
        header: 'CUSTOMER ORDER FROM NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_TYPE_NAME',
        header: 'Product Specification Type',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'MODIFIED_DATE',
        header: 'UPDATE DATE',
        columnFilterModeOptions: [
          'contains',
          'equals',
          'notEquals',
          'greaterThan',
          'greaterThanOrEqualTo',
          'lessThan',
          'lessThanOrEqualTo'
        ],
        filterFn: 'equals'
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'UPDATE BY',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
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
    data: dataSpecificationForCopy?.data?.ResultOnDb || [],
    rowCount: dataSpecificationForCopy?.data?.TotalCountOnDb ?? 0,
    manualFiltering: true, //turn off built-in client-side filtering
    manualPagination: true, //turn off built-in client-side pagination
    manualSorting: true, //turn off built-in client-side sorting
    onColumnFiltersChange: setColumnFilters,
    onColumnFilterFnsChange: setColumnFilterFns,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onDensityChange: setDensity,
    // onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: setColumnOrder,
    isMultiSortEvent: () => true,
    enableRowActions: true,
    enableFacetedValues: true,
    enableColumnFilterModes: true,
    enableColumnPinning: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    // defaultColumn: {
    //   maxSize: 400,
    //   minSize: 80,
    //   size: 160
    // },
    enableColumnResizing: true,
    enableColumnOrdering: true,
    paginationDisplayMode: 'pages',
    state: {
      columnFilters: columnFilters || [],
      // // isLoadingProductTypeForCopy,
      pagination,
      // // showAlertBanner: isErrorProductTypeForCopy,
      // // showProgressBars: isRefetchingTypeForCopy,
      sorting: sorting || [],
      density: density || 'comfortable',
      columnVisibility: columnVisibility || {},
      columnPinning: columnPinning || {},
      columnOrder: columnOrder || [],
      columnFilterFns
    },
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
      },
      'mrt-row-select': {
        enableColumnActions: true,
        enableHiding: true,
        size: 100,
        muiTableHeadCellProps: {
          align: 'center'
        },
        muiTableBodyCellProps: {
          align: 'center'
        }
      }
    },

    // renderTopToolbarCustomActions: () => (
    //   <div className='flex gap-1'>
    //     <div className='flex items-center gap-1'>
    //       <Typography className='hidden sm:block'>Show</Typography>
    //       <Controller
    //         name='searchResults.pageSize'
    //         control={control}
    //         render={({ field: { onChange, ...fieldProps } }) => (
    //           <CustomTextField
    //             {...fieldProps}
    //             select
    //             onChange={e => {
    //               table.setPageSize(Number(e.target.value))
    //               onChange(Number(e.target.value))
    //             }}
    //             className='is-[80px]'
    //             style={{ zIndex: 2001 }}
    //           >
    //             <MenuItem value='10'>10</MenuItem>
    //             <MenuItem value='25'>25</MenuItem>
    //             <MenuItem value='50'>50</MenuItem>
    //             <MenuItem value='100'>100</MenuItem>
    //           </CustomTextField>
    //         )}
    //       />
    //       <Typography className='hidden sm:block'>Entries</Typography>
    //     </div>
    //     {/* <Button variant='tonal' onClick={() => table.resetSorting(true)}>
    //       Clear All Sorting
    //     </Button> */}
    //     <Tooltip arrow title='Clear All Sorting' onClick={() => table.resetSorting(true)}>
    //       <IconButton>
    //         <Badge badgeContent={sorting?.length ?? 0} color='primary'>
    //           <SwapVertIcon />
    //         </Badge>
    //       </IconButton>
    //     </Tooltip>
    //     {/* <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
    //       <IconButton>
    //         <Badge badgeContent={columnFilters?.length ?? 0} color='primary'>
    //           <FilterListIcon />
    //         </Badge>
    //       </IconButton>
    //     </Tooltip> */}
    //     {/* <Tooltip arrow title='Refresh Data' onClick={() => refetchProductTypeForCopy()}>
    //       <IconButton>
    //         <RefreshIcon />
    //       </IconButton>
    //     </Tooltip> */}
    //   </div>
    // ),

    renderTopToolbarCustomActions: () => (
      // <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
      <div className='flex gap-1'>
        <div className='flex items-center gap-2'>
          <Typography className='hidden sm:block'>Show</Typography>
          <Controller
            name='searchResults.pageSize'
            control={control}
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <CustomTextField
                {...fieldProps}
                select
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                  onChange(Number(e.target.value))
                }}
                className='is-[80px]'
                value={value || 10}
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
    //       Clear All Sorting
    //     </Button> */}

        <Tooltip arrow title='Clear All Sorting' onClick={() => table.resetSorting(true)}>
          <IconButton>
            <Badge badgeContent={sorting?.length ?? 0} color='primary'>
              <SwapVertIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
          <IconButton>
            <Badge badgeContent={columnFilters?.length ?? 0} color='primary'>
              <FilterListIcon />
            </Badge>
          </IconButton>
        </Tooltip> */}
      </div>
      // </Box>
    ),

    renderToolbarInternalActions: ({ table }) => (
      <>
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    ),

    renderBottomToolbar: ({ table }) => (
      <div className='flex items-center justify-end gap-2 p-3'>
        <div className='flex items-center gap-2'>
          <Typography variant='body1'>
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
            {pagination.pageIndex * pagination.pageSize + (dataSpecificationForCopy?.data?.ResultOnDb?.length || 0)} of{' '}
            {table.getRowCount()} entries
          </Typography>

          {/* {useEffect(() => {
            console.log('Page Options Length:', table.getState().pagination.pageIndex + 1)
          }, [table])} */}
          <Pagination
            count={table.getPageOptions()?.length}
            // count={table.getPageOptions().length}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(event, value: number) => table.setPageIndex(value - 1)}
            variant='tonal'
            shape='rounded'
            color='primary'
          />
        </div>
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

    initialState: { showColumnFilters: columnFilters.filter(cf => cf?.value?.length !== 0)?.length > 0 ? true : false },

    muiTableContainerProps: {
      sx: {
        maxHeight: '300px'
      }
    },

    // initialState: {
    //   showColumnFilters: false
    // },

    // muiPaginationProps: {
    //   showRowsPerPage: true
    // },

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
  })

  return (
    <>
      {/* {JSON.stringify(watch())} */}
      {/* <FormProvider {...reactHookFormMethodsForCopyPage}> */}
      <DialogContent>
        <Grid alignItems='center'>
          {/* <Grid item xs={12}> */}
          <SpecificationSettingCompleteTableForSearch
            setIsEnableFetching={setIsEnableFetching}
            setIsCopying={setIsCopying}
          />
        </Grid>
      </DialogContent>

      <MaterialReactTable table={table} />
      {/* </FormProvider> */}
    </>
  )
}

export default SpecificationSettingCompleteTable
