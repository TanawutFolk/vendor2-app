import { forwardRef, ReactElement, Ref, useEffect, useMemo, useRef, useState } from 'react'

import {
  Badge,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Menu,
  MenuItem,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'

import type {
  MRT_ColumnDef,
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_VisibilityState,
  MRT_DensityState,
  MRT_ColumnPinningState,
  MRT_ColumnOrderState,
  MRT_Row,
  MRT_ColumnFilterFnsState
} from 'material-react-table'

import { useFormContext } from 'react-hook-form'
import { useUpdateEffect } from 'react-use'
import type { ProductMainI } from '@/_workspace/types/productGroup/product-main/ProductMain'
import type { ParamApiSearchResultTableI_V2 } from '@libs/material-react-table/types/SearchResultTable'

import {
  useSearchParentProductTypeBySctRevisionCode,
  PREFIX_QUERY_KEY,
  useGetAllWithWhereCondition_old_version
} from '@/_workspace/react-query/hooks/useStandardCostForProduct'

import { useDxContext } from '@/_template/DxContextProvider'
import type { FormDataPage } from './validationSchema'
import { useSettings } from '@/@core/hooks/useSettings'
import type { ProductCategoryI } from '@/_workspace/types/productGroup/ProductCategory'
import type { BoiProjectI } from '@/_workspace/types/boi/BoiProject'
import type { ProductMainBoiI } from '@/_workspace/types/productGroup/product-main/ProductMainBoi'
import type { EnvironmentCertificateI } from '@/_workspace/types/environment-certificate/EnvironmentCertificate'
import type { AccountDepartmentCodeI } from '@/_workspace/types/account/AccountDepartmentCode'
import { DxMRTTable } from '@/_template/DxMRTTable'
import ActionsMenu from './SearchResult/ActionsMenu'

import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import { type MRT_RowSelectionState } from 'material-react-table'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchSctStatusProgressNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctStatusProgress'

import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { useQueryClient } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'
import { MENU_ID } from './env'
import { useCheckPermission } from '@/_template/CheckPermission'
interface ParamApiSearchProductMainI extends ParamApiSearchResultTableI_V2 {
  PRODUCT_CATEGORY_ID?: number | ''
  PRODUCT_CATEGORY_NAME?: string
  PRODUCT_MAIN_ID?: number | ''
  PRODUCT_MAIN_CODE?: string
  PRODUCT_MAIN_NAME?: string
  PRODUCT_MAIN_ALPHABET?: string
}

export type SearchResultType = Required<ProductMainI> &
  Partial<ProductCategoryI> &
  Partial<BoiProjectI> &
  Partial<ProductMainBoiI> &
  Partial<EnvironmentCertificateI> &
  Partial<AccountDepartmentCodeI>

export const statusColor = {
  Preparing: {
    text: 'text-orange-500',
    bg: 'bg-orange-500/[.16]'
  },
  Prepared: {
    text: 'text-cyan-500',
    bg: 'bg-cyan-500/[.16]'
  },
  Completed: {
    text: 'text-blue-500',
    bg: 'bg-blue-500/[.16]'
  },
  Checking: {
    text: 'text-neutral-600',
    bg: 'bg-pink-200',
    darkText: 'text-neutral-700',
    darkBg: 'bg-pink-200'
  },
  'Waiting Approve': {
    text: 'text-neutral-600',
    bg: 'bg-pink-200',
    darkText: 'text-neutral-700',
    darkBg: 'bg-pink-200'
  },
  'Can use': {
    text: 'text-green-500',
    bg: 'bg-green-500/[.16]'
  },
  Cancelled: {
    text: 'text-gray-500',
    bg: 'bg-gray-500/[.16]'
  },
  Draft: {
    text: 'text-gray-500',
    bg: 'bg-gray-500/[.16]'
  }
}

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },

  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

import undraw_notify_re_65on from '@assets/images/common/undraw_notify_re_65on.svg'
import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import ConfirmModal from '../sct-for-product/modal/ConfirmModal'
import SctForProductEditModal from '../sct-for-product/modal/SctEditModal'
import ExportModal from '../sct-for-product/sct-export'
import PriceListExportModal from '../sct-for-product/price-list-export'
import { toast } from 'react-toastify'

export const canSeeCol =
  getUserData()?.EMPLOYEE_CODE === 'S524' ||
  getUserData()?.EMPLOYEE_CODE === 'S094' ||
  getUserData()?.EMPLOYEE_CODE === 'S168'

function SctBomExplosionTableData() {
  const { isEnableFetching, setIsEnableFetching, pagination, setPagination } = useDxContext()

  // react-hook-form
  const { getValues, control, setValue } = useFormContext<FormDataPage>()
  // States
  const [rowSelected, setRowSelected] = useState<MRT_Row<StandardCostI> | null>(null)
  const { settings } = useSettings()
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
  )

  // States : Modal
  const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)
  const [openExportModal, setOpenExportModal] = useState<boolean>(false)
  const [openPriceListModal, setOpenPriceListModal] = useState<boolean>(false)

  // const [allSctId, setAllSctId] = useState<any[]>([])
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [anchorSctSelection, setAnchorSctSelection] = useState<null | HTMLElement>(null)
  const [isFetchExportData, setIsFetchExportData] = useState(false)

  // react-query
  const paramForSearch: ParamApiSearchProductMainI = {
    SearchFilters: [
      {
        id: 'SCT_REVISION_CODE',
        value:
          typeof getValues('searchFilters.sctRevisionCode') === 'string' &&
          getValues('searchFilters.sctRevisionCode').trim().length > 0
            ? getValues('searchFilters.sctRevisionCode')
                .split(',')
                .map(v => `'${v.trim()}'`)
            : []
      },
      {
        id: 'sctLatestRevisionOption',
        value: getValues('searchFilters.sctLatestRevisionOption')?.value ?? ''
      },
      {
        id: 'FISCAL_YEAR',
        value: getValues('searchFilters.fiscalYear') || ''
      },
      {
        id: 'SCT_PATTERN_ID',
        value: getValues('searchFilters.sctPattern')?.SCT_PATTERN_ID || ''
      },
      {
        id: 'ITEM_CATEGORY_ID',
        value: getValues('searchFilters.itemCategory')?.ITEM_CATEGORY_ID || ''
      },
      {
        id: 'PRODUCT_CATEGORY_ID',
        value: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID || ''
      },
      {
        id: 'PRODUCT_MAIN_ID',
        value: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID || ''
      },
      {
        id: 'PRODUCT_SUB_ID',
        value: getValues('searchFilters.productSub')?.PRODUCT_SUB_ID || ''
      },
      {
        id: 'PRODUCT_TYPE_ID',
        value: getValues('searchFilters.productType')?.PRODUCT_TYPE_ID || ''
      },
      {
        id: 'CUSTOMER_INVOICE_TO_ID',
        value: getValues('searchFilters.customerInvoice')?.CUSTOMER_INVOICE_TO_ID || ''
      },
      {
        id: 'SCT_REASON_SETTING_ID',
        value: getValues('searchFilters.sctReasonSetting')?.SCT_REASON_SETTING_ID || ''
      },
      {
        id: 'SCT_TAG_SETTING_ID',
        value: getValues('searchFilters.sctTagSetting')?.SCT_TAG_SETTING_ID || ''
      },
      {
        id: 'SCT_STATUS_PROGRESS_ID',
        value: getValues('searchFilters.sctStatusProgress')?.SCT_STATUS_PROGRESS_ID || ''
      },
      {
        id: 'includingCancelled',
        value: getValues('searchFilters.includingCancelled') || ''
      },
      {
        id: 'alreadyHaveSellingPrice',
        value: getValues('searchFilters.alreadyHaveSellingPrice')?.value ?? ''
      },
      {
        id: 'ITEM_CODE_FOR_SUPPORT_MES',
        value:
          typeof getValues('searchFilters.itemCodeForSupportMes') === 'string' &&
          getValues('searchFilters.itemCodeForSupportMes').trim().length > 0
            ? getValues('searchFilters.itemCodeForSupportMes')
                .split(',')
                .map(v => `'${v.trim()}'`)
            : []
      },
      {
        id: 'FLOW_ID',
        value: getValues('searchFilters.flow')?.FLOW_ID ?? ''
      },
      {
        id: 'BOM_ID',
        value: getValues('searchFilters.bom')?.BOM_ID ?? ''
      }
    ],
    ColumnFilters: columnFilters.map(item => ({
      columnFns: columnFilterFns[item.id],
      column: item.id,
      value: item.value
    })),
    Order: sorting
    // Start: pagination.pageIndex,
    // Limit: pagination.pageSize
  }

  const { data, isError, isFetching, isLoading } = useSearchParentProductTypeBySctRevisionCode(
    paramForSearch,
    isEnableFetching
  )

  useEffect(() => {
    if (isFetching === false) {
      setIsEnableFetching(false)
    }
  }, [isFetching, setIsEnableFetching])

  // useUpdateEffect(() => {
  //   setIsEnableFetching(true)
  // }, [JSON.stringify([columnFilters, columnFilterFns, sorting])])

  // const [isEnableFetching_getAllWithWhereCondition, setIsEnableFetching_getAllWithWhereCondition] =
  //   useState<boolean>(false)

  // const {
  //   isRefetching: isRefetching_getAllWithWhereCondition,
  //   isLoading: isLoading_getAllWithWhereCondition,
  //   data: data_getAllWithWhereCondition,
  //   isFetching: isFetching_getAllWithWhereCondition
  // } = useGetAllWithWhereCondition_old_version(paramForSearch, isEnableFetching_getAllWithWhereCondition, 'SelectAll')

  // useEffect(() => {
  //   if (isFetching_getAllWithWhereCondition === false && typeof data_getAllWithWhereCondition !== 'undefined') {
  //     setIsEnableFetching_getAllWithWhereCondition(false)
  //     const dataItem = data_getAllWithWhereCondition?.data.ResultOnDb ?? []

  //     setRowSelection(() => {
  //       let result = {}
  //       dataItem.map(row => {
  //         result = { ...result, [row.SCT_ID]: true }
  //       })
  //       return result
  //     })
  //   }
  // }, [isFetching_getAllWithWhereCondition, setIsEnableFetching_getAllWithWhereCondition, data_getAllWithWhereCondition])

  // react-table
  const columns = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    () => [
      {
        accessorKey: 'SCT_STATUS_PROGRESS_NAME',
        header: 'CURRENT PROGRESS',
        Cell({ cell, row }) {
          let statusValue = statusColor[cell.getValue()]
          if (!statusValue || Object.keys(statusValue).length === 0) {
            return null
          }
          let classNames = twMerge(statusValue.text, statusValue.bg)
          if ((cell.getValue() === 'Checking' || cell.getValue() === 'Waiting Approve') && settings.mode === 'dark') {
            classNames = twMerge(statusValue.darkText, statusValue.darkBg)
          }
          return (
            <Chip
              label={String(cell.getValue())}
              className={classNames}
              variant='tonal'
              sx={{
                color: settings.mode === 'light' ? 'var(--mui-palette-text-primary)' : 'undefined'
              }}
            />
          )
        },
        filterVariant: 'text',
        filterFn: 'contains',
        size: 200,
        enableSorting: false,
        enableColumnFilterModes: false,
        Filter: ({ column }) => (
          <AsyncSelectCustom
            label=''
            isClearable
            cacheOptions
            defaultOptions
            loadOptions={inputValue =>
              fetchSctStatusProgressNameAndInuse({
                sctStatusProgressName: inputValue,
                inuse: 1
              })
            }
            getOptionLabel={data => data?.SCT_STATUS_PROGRESS_NAME.toString()}
            getOptionValue={data => data.SCT_STATUS_PROGRESS_ID.toString()}
            classNamePrefix='select'
            isMulti
            onChange={option => {
              if (option?.length > 0) {
                column.setFilterValue(option.map((item: any) => item.SCT_STATUS_PROGRESS_ID))
              } else {
                column.setFilterValue(null)
              }
            }}
          />
        )
      },
      {
        accessorKey: 'PRODUCT_TYPE_CODE',
        header: 'PRODUCT TYPE CODE',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 250
      },
      { accessorKey: 'FISCAL_YEAR', header: 'FISCAL YEAR', filterVariant: 'text', filterFn: 'contains', size: 200 },
      {
        accessorKey: 'SCT_PATTERN_NAME',
        header: 'SCT PATTERN NAME',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 250
      },
      { accessorKey: 'SCT_REVISION_CODE', header: 'SCT REVISION CODE', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'BOM_CODE', header: 'BOM CODE', filterVariant: 'text', filterFn: 'contains', size: 200 },
      { accessorKey: 'FLOW_CODE', header: 'FLOW CODE', filterVariant: 'text', filterFn: 'contains', size: 200 },
      {
        accessorKey: 'RE_CAL_UPDATE_DATE',
        header: 'RE-CAL UPDATE DATE',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 250
      },
      {
        accessorKey: 'RE_CAL_UPDATE_BY',
        header: 'RE-CAL UPDATE BY',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 250
      },
      {
        accessorKey: 'SELLING_PRICE',
        header: 'Selling Price (Baht)',
        filterVariant: 'text',
        filterFn: 'contains',
        Cell: ({ cell }) => (cell.getValue() == null ? null : Math.round(Number(cell.getValue())).toLocaleString()),
        size: 250
      },
      {
        accessorKey: 'ADJUST_PRICE',
        header: 'ADJUST PRICE (Baht)',
        filterVariant: 'text',
        filterFn: 'contains',
        Cell: ({ cell }) => (cell.getValue() == null ? null : Math.round(Number(cell.getValue())).toLocaleString()),
        size: 250
      },
      {
        accessorKey: 'TOTAL_INDIRECT_COST',
        header: 'INDIRECT COST',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 200,
        Cell: ({ cell }) => {
          const numberValue = parseFloat(cell.getValue() as string)
          if (isNaN(numberValue)) return ''
          return Number(numberValue.toFixed(3)).toLocaleString()
        }
      },
      {
        accessorKey: 'INDIRECT_COST_MODE',
        header: 'INDIRECT COST (MODE)',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 250
      },
      { accessorKey: 'SCT_REASON_SETTING_NAME', header: 'SCT REASON', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'SCT_TAG_SETTING_NAME', header: 'SCT TAG', filterVariant: 'text', filterFn: 'contains' },
      {
        accessorKey: 'ESTIMATE_PERIOD_START_DATE',
        header: 'ESTIMATE PERIOD START DATE',
        filterVariant: 'date',
        filterFn: 'equals'
      },
      {
        accessorKey: 'ESTIMATE_PERIOD_END_DATE',
        header: 'ESTIMATE PERIOD END DATE',
        filterVariant: 'date',
        filterFn: 'equals'
      },
      {
        accessorKey: 'CUSTOMER_INVOICE_TO_ALPHABET',
        header: 'CUSTOMER INVOICE TO ALPHABET',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 350
      },
      {
        accessorKey: 'CUSTOMER_INVOICE_TO_NAME',
        header: 'CUSTOMER INVOICE TO NAME',
        filterVariant: 'text',
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        header: 'PRODUCT CATEGORY NAME',
        filterVariant: 'text',
        filterFn: 'contains'
      },
      { accessorKey: 'PRODUCT_MAIN_NAME', header: 'PRODUCT MAIN NAME', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'PRODUCT_SUB_NAME', header: 'PRODUCT SUB NAME', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'PRODUCT_TYPE_NAME', header: 'PRODUCT TYPE NAME', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'ITEM_CATEGORY_NAME', header: 'ITEM CATEGORY', filterVariant: 'text', filterFn: 'contains' },
      {
        accessorKey: 'ASSEMBLY_GROUP_FOR_SUPPORT_MES',
        header: 'ASSEMBLY GROUP FOR SUPPORT MES',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 350
      },
      { accessorKey: 'NOTE', header: 'NOTE', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'DESCRIPTION', header: 'DESCRIPTION', filterVariant: 'text', filterFn: 'contains' },
      { accessorKey: 'UPDATE_DATE', header: 'UPDATE DATE', filterVariant: 'date', filterFn: 'equals', size: 250 },
      { accessorKey: 'UPDATE_BY', header: 'UPDATE BY', filterVariant: 'text', filterFn: 'contains', size: 200 },
      {
        accessorKey: 'STATUS_UPDATE_DATE',
        header: 'STATUS UPDATE DATE',
        filterVariant: 'date',
        filterFn: 'equals',
        size: 250
      },
      {
        accessorKey: 'STATUS_UPDATE_BY',
        header: 'STATUS UPDATE BY',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 230
      },
      { accessorKey: 'CREATE_DATE', header: 'CREATE DATE', filterVariant: 'date', filterFn: 'equals', size: 250 },
      { accessorKey: 'CREATE_BY', header: 'CREATE BY', filterVariant: 'text', filterFn: 'contains', size: 200 },
      {
        accessorKey: 'CANCEL_REASON',
        header: 'CANCEL REASON',
        filterVariant: 'text',
        filterFn: 'contains',
        size: 250
      }
    ],
    [settings.mode]
  )

  const isFirstRender = useRef(true)

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnFilters', columnFilters)
  }, [setValue, columnFilters])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.sorting', sorting)
  }, [setValue, sorting])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.density', density)
  }, [setValue, density])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnVisibility', columnVisibility)
  }, [setValue, columnVisibility])
  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnPinning', columnPinning)
  }, [setValue, columnPinning])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnOrder', columnOrder)
  }, [setValue, columnOrder])

  useEffect(() => {
    if (isFirstRender.current) return
    setValue('searchResults.columnFilterFns', columnFilterFns)
  }, [setValue, columnFilterFns])

  // States

  // Refs

  // useEffect(() => {
  //   if (Object.keys(rowSelection).length > 0) {
  //     const rowSelectionArr = Object.keys(rowSelection)
  //     const dataRows = data?.data?.ResultOnDb || []

  //     const sctDetailLatestSelection = dataRows.find(row => rowSelectionArr[rowSelectionArr.length - 1] === row.SCT_ID)

  //     let result: any[] = []

  //     if (sctDetailLatestSelection && sctDetailLatestSelection.SCT_STATUS_PROGRESS_ID) {
  //       result = [
  //         ...rowSelectionStatusProgress,
  //         {
  //           SCT_ID: sctDetailLatestSelection.SCT_ID,
  //           SCT_STATUS_PROGRESS_ID: sctDetailLatestSelection.SCT_STATUS_PROGRESS_ID
  //         }
  //       ]
  //     }

  //     result = result.filter(row => rowSelectionArr.includes(row.SCT_ID))

  //     // remove duplicate
  //     result = result.filter((row, index, self) => self.findIndex(r => r.SCT_ID === row.SCT_ID) === index)

  //     setRowSelectionStatusProgress(result)
  //   }
  // }, [rowSelection])

  // const { mode: muiMode } = useColorScheme()

  // const onClickExportExcelFileAlert = () => {
  //   MySwal.fire({
  //     title: 'Coming Soon ...',
  //     text: 'Waiting for development within the week',
  //     icon: 'info',
  //     background: muiMode === 'dark' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-paper)',
  //     color: muiMode === 'dark' ? 'var(--mui-palette-text-paper)' : 'var(--mui-palette-text-paper)'
  //   })
  // }
  //queryClient.invalidateQueries('STANDARD_COST_EXPORT_EXPORT');

  const onClickExportExcelFile = () => {
    if (Object.keys(rowSelection).length == 0) {
      // MySwal.fire({
      //   title: 'SCT Data is not Selected',
      //   text: 'Please select at least one to export excel',
      //   icon: 'info',
      //   background: muiMode === 'dark' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-paper)',
      //   color: muiMode === 'dark' ? 'var(--mui-palette-text-paper)' : 'var(--mui-palette-text-paper)'
      // })
      // setChangeStatusErrorMessage(
      //   'Please select at least one to export excel. โปรดเลือกอย่างน้อยหนึ่งรายการเพื่อส่งออกไฟล์ excel'
      // )
      // setOpenChangeStatus(true)
      //handleCloseChangeStatusMenu()
      toast.error('Please select at least one to export Excel. โปรดเลือกอย่างน้อยหนึ่งรายการเพื่อส่งออกไฟล์ Excel')
    } else {
      setOpenExportModal(true)
      setIsFetchExportData(true)
    }
    //queryClient.invalidateQueries('STANDARD_COST_EXPORT_EXPORT');
  }

  const handleExcelPriceList = () => {
    if (Object.keys(rowSelection).length == 0) {
      // MySwal.fire({
      //   title: 'Data Price List is not Selected',
      //   text: 'Please select at least one to export excel',
      //   icon: 'info',
      //   background: muiMode === 'dark' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-paper)',
      //   color: muiMode === 'dark' ? 'var(--mui-palette-text-paper)' : 'var(--mui-palette-text-paper)'
      // })
      toast.error(
        'Please select at least one to export Price List. โปรดเลือกอย่างน้อยหนึ่งรายการเพื่อส่งออกไฟล์ Price List'
      )
    } else {
      setOpenPriceListModal(true)
      setIsFetchExportData(true)
    }
    //queryClient.invalidateQueries('STANDARD_COST_EXPORT_EXPORT');
  }

  const handleOpenSctSelectionMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorSctSelection(event.currentTarget)
  }

  const handleCloseSctSelectionMenu = () => {
    setAnchorSctSelection(null)
  }

  const handleSelectAll = () => {
    const dataItem = data?.data?.ResultOnDb ?? []

    setRowSelection(() => {
      let result = {}
      dataItem.map(row => {
        result = { ...result, [row.SCT_ID]: true }
      })
      return result
    })
  }

  const handleClearAllSelected = () => {
    setRowSelection({})
  }

  console.log(data?.data?.ResultOnDb)
  return (
    <>
      <Card>
        <CardHeader
          title='Search result'
          action={
            <div className='flex gap-2'>
              <div className='flex items-center gap-3'>
                <Button
                  onClick={handleSelectAll}
                  variant='outlined'
                  className='rounded-3xl'
                  //disabled={isLoading_getAllWithWhereCondition || isRefetching_getAllWithWhereCondition}
                >
                  Select All
                </Button>
                <Button
                  onClick={handleClearAllSelected}
                  variant='outlined'
                  className='rounded-3xl'
                  //disabled={isLoading_getAllWithWhereCondition || isRefetching_getAllWithWhereCondition}
                >
                  Clear All
                </Button>
                <Divider orientation='vertical' flexItem />
                <Box sx={{ flexGrow: 0 }}>
                  <Badge badgeContent={Object.keys(rowSelection)?.length ?? 0} color='primary'>
                    <Button
                      onClick={handleOpenSctSelectionMenu}
                      variant='outlined'
                      disabled={Object.keys(rowSelection ?? {}).length <= 0}
                      className='rounded-3xl'
                    >
                      SCT Selected
                      {anchorSctSelection ? (
                        <i className='tabler-chevron-up text-lg' />
                      ) : (
                        <i className='tabler-chevron-down text-lg' />
                      )}
                    </Button>
                  </Badge>
                  <Menu
                    sx={{ mt: '45px' }}
                    id='menu-appbar'
                    anchorEl={anchorSctSelection}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                    open={Boolean(anchorSctSelection)}
                    onClose={handleCloseSctSelectionMenu}
                  >
                    <MenuItem
                      sx={{
                        padding: '0px'
                      }}
                    >
                      <Button
                        sx={{
                          width: '100%',
                          justifyContent: 'start'
                        }}
                        onClick={onClickExportExcelFile}
                      >
                        Export Excel
                      </Button>
                    </MenuItem>
                    <MenuItem
                      sx={{
                        padding: '0px'
                      }}
                    >
                      <Button
                        sx={{
                          width: '100%',
                          justifyContent: 'start'
                        }}
                        onClick={handleExcelPriceList}
                      >
                        Export Price List
                      </Button>
                    </MenuItem>
                  </Menu>
                </Box>
              </div>
            </div>
          }
        />

        {openModalView ? (
          <SctForProductEditModal
            isOpenModal={openModalView}
            setIsOpenModal={setOpenModalView}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
            mode='view'
            isCalculationAlready={is_Null_Undefined_Blank(rowSelected?.original?.SELLING_PRICE) ? false : true}
          />
        ) : null}

        {openExportModal && (
          <ExportModal
            openExportModal={openExportModal}
            setOpenExportModal={setOpenExportModal}
            rowSelection={rowSelection}
            isFetchExportData={isFetchExportData}
            setIsFetchExportData={setIsFetchExportData}
            handleClearAllSelected={handleClearAllSelected}
            //setIsEnableFetchingMainTable={setIsEnableFetching}
          />
        )}

        {openPriceListModal && (
          <PriceListExportModal
            openPriceListModal={openPriceListModal}
            setOpenPriceListModal={setOpenPriceListModal}
            rowSelection={rowSelection}
            isFetchExportData={isFetchExportData}
            setIsFetchExportData={setIsFetchExportData}
            handleClearAllSelected={handleClearAllSelected}
          />
        )}

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
            manualFiltering={false}
            manualPagination={false}
            manualSorting={false}
            columns={columns}
            data={data?.data?.ResultOnDb.length > 0 ? data?.data?.ResultOnDb : []}
            onColumnFiltersChange={setColumnFilters}
            onColumnFilterFnsChange={setColumnFilterFns}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            onColumnVisibilityChange={setColumnVisibility}
            onDensityChange={setDensity}
            onColumnPinningChange={setColumnPinning}
            onColumnOrderChange={setColumnOrder}
            // rowCount={data?.data?.TotalCountOnDb ?? 0}
            enableRowSelection={true}
            getRowId={row => row.SCT_ID}
            //onRowSelectionChange={data => setRowSelection(data)}
            onRowSelectionChange={updater => {
              const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
              setRowSelection(newSelection)

              // // ดึงข้อมูลทั้งแถวที่ถูกเลือก
              const selected = Object.keys(newSelection).map(key => {
                return {
                  SCT_ID: key,
                  SCT_STATUS_PROGRESS_ID: (data?.data?.ResultOnDb ?? []).find(item => item.SCT_ID == key)
                    .SCT_STATUS_PROGRESS_ID
                }
              })
            }}
            state={{
              columnFilters,
              pagination,
              showAlertBanner: isError,
              //showProgressBars: isRefetching,
              isLoading, //cell skeletons and loading overlay
              showProgressBars: isFetching, //progress bars while refetching

              sorting,
              density,
              columnVisibility,
              columnPinning,
              columnOrder,
              columnFilterFns,
              rowSelection
            }}
            isError={isError}
            renderRowActions={({ row }) => (
              <ActionsMenu
                row={row}
                setOpenModalView={setOpenModalView}
                rowSelected={rowSelected}
                setRowSelected={setRowSelected}
                MENU_ID={MENU_ID}
              />
            )}
          />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default SctBomExplosionTableData
