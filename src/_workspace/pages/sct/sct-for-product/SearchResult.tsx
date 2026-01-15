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
  Popover,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'

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

import { Controller, useFormContext } from 'react-hook-form'
import { useUpdateEffect } from 'react-use'
import type { ProductMainI } from '@/_workspace/types/productGroup/product-main/ProductMain'
import type { ParamApiSearchResultTableI_V2 } from '@libs/material-react-table/types/SearchResultTable'

import {
  useChangeSctProgress,
  useSearch,
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
import StandardCostFormModal from './modal/SctAddModal/SctFormModal'
import SctForProductEditModal from './modal/SctEditModal'

import { type MRT_RowSelectionState } from 'material-react-table'

import ExportModal from './sct-export'
import SctDataDeleteModal from './modal/DeleteModal'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchSctStatusProgressNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctStatusProgress'
import ConfirmModal from './modal/ConfirmModal'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { useQueryClient } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'

import ConfirmModalForSctForProduct from './modal/ConfirmModalForSctForProduct'
import { fetchSctReCalButton } from '@/_workspace/react-select/async-promise-load-options/fetchSctReCalButton'
import PriceListExportModal from './price-list-export'
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
import StandardCostForProductServices from '@/_workspace/services/sct/StandardCostForProductServices'
import { toast } from 'react-toastify'

export const canSeeCol =
  getUserData()?.EMPLOYEE_CODE === 'S524' ||
  getUserData()?.EMPLOYEE_CODE === 'S094' ||
  getUserData()?.EMPLOYEE_CODE === 'S168'

function ProductMainTableData() {
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
  const [rowSelectionStatusProgress, setRowSelectionStatusProgress] = useState<any[]>([])
  const [anchorSctSelection, setAnchorSctSelection] = useState<null | HTMLElement>(null)
  const [anchorChangeStatus, setAnchorChangeStatus] = useState<null | HTMLElement>(null)
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
      }
    ],
    ColumnFilters: columnFilters.map(item => ({
      columnFns: columnFilterFns[item.id],
      column: item.id,
      value: item.value
    })),
    Order: sorting,
    Start: pagination.pageIndex,
    Limit: pagination.pageSize
  }

  const { isRefetching, isLoading, data, isError, isFetching } = useSearch(paramForSearch, isEnableFetching)

  useEffect(() => {
    if (isFetching === false) {
      setIsEnableFetching(false)
    }
  }, [isFetching, setIsEnableFetching])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, columnFilterFns, sorting, pagination])])

  const [isEnableFetching_getAllWithWhereCondition, setIsEnableFetching_getAllWithWhereCondition] =
    useState<boolean>(false)

  const {
    isRefetching: isRefetching_getAllWithWhereCondition,
    isLoading: isLoading_getAllWithWhereCondition,
    data: data_getAllWithWhereCondition,
    isFetching: isFetching_getAllWithWhereCondition
  } = useGetAllWithWhereCondition_old_version(paramForSearch, isEnableFetching_getAllWithWhereCondition, 'SelectAll')

  useEffect(() => {
    if (isFetching_getAllWithWhereCondition === false && typeof data_getAllWithWhereCondition !== 'undefined') {
      setIsEnableFetching_getAllWithWhereCondition(false)
      const dataItem = data_getAllWithWhereCondition?.data.ResultOnDb ?? []

      setRowSelectionStatusProgress(dataItem)
      setRowSelection(() => {
        let result = {}
        dataItem.map(row => {
          result = { ...result, [row.SCT_ID]: true }
        })
        return result
      })
    }
  }, [isFetching_getAllWithWhereCondition, setIsEnableFetching_getAllWithWhereCondition, data_getAllWithWhereCondition])

  // react-table
  const columns = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    () => [
      {
        accessorKey: 'Cal_SCT',
        header: 'Cal SCT',
        Cell({ row }) {
          const [button, setButton] = useState<{
            SCT_ID: string
            IS_GENERATE_BUTTON: boolean
            IS_DISABLE: boolean
            IS_HAS_BUTTON: boolean
            DETAIL_MESSAGES: string[]
          } | null>(null)
          const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

          const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget)
          }

          const handlePopoverClose = () => {
            setAnchorEl(null)
          }

          const open = Boolean(anchorEl)

          useEffect(() => {
            if (row.original.SCT_STATUS_PROGRESS_ID != 3) return
            fetchSctReCalButton({
              SCT_ID: row.original.SCT_ID ?? '',
              FISCAL_YEAR: row.original.FISCAL_YEAR ?? '',
              SCT_PATTERN_ID: row.original.SCT_PATTERN_ID ?? '',
              SCT_STATUS_PROGRESS_ID: row.original.SCT_STATUS_PROGRESS_ID ?? '',
              SCT_REASON_SETTING_ID: row.original.SCT_REASON_SETTING_ID ?? '',
              SCT_TAG_SETTING_ID: row.original.SCT_TAG_SETTING_ID ?? '',
              IS_REFRESH_DATA_MASTER: row.original?.IS_REFRESH_DATA_MASTER ? true : false,
              SELLING_PRICE: row.original.SELLING_PRICE
            })
              .then(res => {
                setButton(() => {
                  return res?.[0] ?? null
                })

                // setReCalButtonStatus(prev => {
                //   const newButton = [...prev]
                //   const index = newButton.findIndex(item => item.SCT_ID === row.original.SCT_ID)

                //   if (index !== -1) {
                //     newButton[index] = res[0]
                //   } else {
                //     newButton.push(res[0])
                //   }

                //   return newButton
                // })
              })
              .catch(err => setButton(null))
          }, [isEnableFetching])

          if (!button) {
            return null
          }

          return (
            <>
              {button?.IS_HAS_BUTTON && canSeeCol && (
                <>
                  <div onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
                    <Button
                      aria-owns={open ? 'mouse-over-popover' : undefined}
                      aria-haspopup='true'
                      onClick={() => {
                        const dataItem = [
                          {
                            // SCT_ID: row.original.SCT_ID,
                            // SCT_STATUS_PROGRESS_ID: row.original.SCT_STATUS_PROGRESS_ID,
                            // UPDATE_BY: getUserData().EMPLOYEE_CODE

                            SCT_ID: row?.original.SCT_ID,
                            SCT_REVISION_CODE: row?.original.SCT_REVISION_CODE,
                            CREATE_BY: getUserData().EMPLOYEE_CODE,
                            UPDATE_BY: getUserData().EMPLOYEE_CODE
                          }
                        ]

                        setRowSelection(dataItem)
                        setOpenConfirmReCalModal(true)
                      }}
                      variant='contained'
                      color='success'
                      disabled={button.IS_DISABLE}
                    >
                      {button.IS_GENERATE_BUTTON ? 'Cal SCT' : 'Re-Cal SCT'}
                    </Button>
                  </div>

                  {button?.IS_DISABLE && button?.DETAIL_MESSAGES?.length > 0 && (
                    <Popover
                      id='mouse-over-popover'
                      sx={{ pointerEvents: 'none' }}
                      open={open}
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left'
                      }}
                      onClose={handlePopoverClose}
                      disableRestoreFocus
                    >
                      <div className='p-2'>
                        {button.DETAIL_MESSAGES.length > 0 &&
                          button.DETAIL_MESSAGES.map((message, index) => (
                            <Typography
                              key={`${row.original.SCT_ID}_${row.original.UPDATE_DATE}_${row.original.STATUS_UPDATE_DATE}`}
                            >
                              {message}
                            </Typography>
                          ))}
                      </div>
                    </Popover>
                  )}
                </>
              )}
            </>
          )
        },
        size: 150,
        enableColumnFilter: false,
        enableSorting: false,
        enableResizing: false
      },
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
      ...(canSeeCol
        ? [
            {
              accessorKey: 'IS_REFRESH_DATA_MASTER',
              header: 'Refresh Selling Price',
              size: 250,
              Cell: ({ row, cell }) => {
                const isRefreshDataMaster = cell.getValue<number>() === 1 && row.original.SCT_STATUS_PROGRESS_ID == 3
                return isRefreshDataMaster ? (
                  <Chip
                    label='Data Master Changed'
                    color='primary'
                    variant='tonal'
                    icon={<i className='tabler-refresh-alert' />}
                  />
                ) : null
              },
              enableColumnFilter: false,
              enableSorting: false
            }
          ]
        : []),

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
    [settings.mode, isEnableFetching]
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

  const handleClickOpen = () => setOpenModalAdd(true)

  // States

  const [openConfirmModal, setOpenConfirmModal] = useState(false)
  const [openConfirmReCalModal, setOpenConfirmReCalModal] = useState(false)
  const [isLoadingReCalModal, setIsLoadingReCalModal] = useState(false)

  // States : Change Status
  const [changeStatusErrorMessage, setChangeStatusErrorMessage] = useState<string>('')
  const [openChangeStatus, setOpenChangeStatus] = useState<boolean>(false)

  const handleCloseChangeStatus = () => setOpenChangeStatus(false)

  // Refs

  const handleClose = () => {
    setOpenConfirmModal(false)
  }

  const handleConfirmChangeStatus = () => {
    if (Object.keys(rowSelection).length == 0) {
      setChangeStatusErrorMessage('SCT Data is not Selected. โปรดเลือก SCT ที่ต้องการเปลี่ยนสถานะ')
      setOpenChangeStatus(true)
      handleCloseChangeStatusMenu()
      return
    }

    if (!getValues('TABLE_CHANGE_STATUS_TO')?.SCT_STATUS_PROGRESS_ID) {
      setChangeStatusErrorMessage('SCT Status Progress is not Selected. โปรดเลือก sct status progress')
      setOpenChangeStatus(true)
      handleCloseChangeStatusMenu()
      return
    }

    setOpenConfirmModal(true)
  }

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
      setChangeStatusErrorMessage(
        'Please select at least one to export excel. โปรดเลือกอย่างน้อยหนึ่งรายการเพื่อส่งออกไฟล์ excel'
      )
      setOpenChangeStatus(true)
      handleCloseChangeStatusMenu()
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
      return (
        <ConfirmModal
          show={true}
          title='Data Price List is not Selected'
          content='Please select at least one to export excel'
        />
      )
    } else {
      setOpenPriceListModal(true)
      setIsFetchExportData(true)
    }
    //queryClient.invalidateQueries('STANDARD_COST_EXPORT_EXPORT');
  }

  const queryClient = useQueryClient()

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      if (data.data.ResultOnDb.affectedRows === 0) {
        const message = {
          title: 'SCT Data',
          message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
        }

        ToastMessageError(message)

        return
      }

      const message = {
        message: data.data.Message,
        title: 'SCT Data'
      }

      ToastMessageSuccess(message)

      setPagination({ pageIndex: 0, pageSize: getValues('searchResults.pageSize') ?? 10 })
      if (setIsEnableFetching) {
        setIsEnableFetching(true)
      }

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      //reset()
      handleClose()
      setRowSelectionStatusProgress([])
      setRowSelection({})
      handleClearAllSelected()
      setValue('TABLE_CHANGE_STATUS_TO', null)
      setAnchorSctSelection(null)
      setAnchorChangeStatus(null)
    } else {
      const message = {
        title: 'SCT Data',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    const message = {
      title: 'SCT Data',
      message: err?.response?.data?.Message ?? 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง'
    }

    ToastMessageError(message)
  }

  const changeProgressMutation = useChangeSctProgress(onMutateSuccess, onMutateError)
  // const onMutateReCalSuccess = (data: any) => {
  //   if (data.data && data.data.Status == true) {
  //     const message = {
  //       message: data.data.Message,
  //       title: 'SCT Data'
  //     }

  //     ToastMessageSuccess(message)

  //     if (setIsEnableFetching) {
  //       setIsEnableFetching(true)
  //     }
  //     queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  //     //reset()
  //     handleCloseReCal()
  //     setRowSelectionStatusProgress([])
  //     setRowSelection({})
  //   } else {
  //     const message = {
  //       title: 'SCT Data',
  //       message: data.data.Message
  //     }

  //     ToastMessageError(message)
  //   }
  // }

  // const onMutateReCalError = (err: any) => {
  //   console.log('onMutateError')
  //   console.log(err)

  //   const message = {
  //     title: 'SCT Data',
  //     message: err.Message
  //   }

  //   ToastMessageError(message)
  // }

  // const reCalMutation = useReCal(onMutateReCalSuccess, onMutateReCalError)

  const handleOpenSctSelectionMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorSctSelection(event.currentTarget)
  }

  const handleCloseSctSelectionMenu = () => {
    setAnchorSctSelection(null)
  }

  const handleOpenChangeStatusMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorChangeStatus(event.currentTarget)
  }

  const handleCloseChangeStatusMenu = () => {
    setValue('TABLE_CHANGE_STATUS_TO', null)
    setAnchorSctSelection(null)
    setAnchorChangeStatus(null)
  }

  const handleSelectAll = () => {
    setIsEnableFetching_getAllWithWhereCondition(true)
    queryClient.invalidateQueries({ queryKey: ['SelectAll_' + PREFIX_QUERY_KEY] })
  }

  const handleClearAllSelected = () => {
    setRowSelection({})
    setRowSelectionStatusProgress([])
    //setValue('isSelectedExport', '')
  }

  // useEffect(() => {
  //   setAllSctId(data?.data?.ALL_SCT_ID ?? [])
  // }, [data?.data])

  const checkPermission = useCheckPermission()

  const [showDialogError, setShowDialogError] = useState(false)

  const [countSctCalFinished, setCountSctCalFinished] = useState(0)
  const [countSctCal, setCountSctCal] = useState(0)

  return (
    <>
      <Dialog
        open={openChangeStatus}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseChangeStatus()
          }
        }}
        closeAfterTransition={false}
      >
        <DialogTitle id='alert-dialog-title'>Notification การแจ้งเตือน</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>{changeStatusErrorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleCloseChangeStatus} variant='contained'>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        maxWidth='xs'
        fullWidth={true}
        open={showDialogError}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        TransitionComponent={Transition}
        // onClose={(event, reason) => {
        //   if (reason !== 'backdropClick') {
        //     onCloseClick
        //   }
        // }}
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogContent>
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
            <img src={undraw_notify_re_65on} height={120} width={150} alt='' />
          </Box>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant='h5'>Are You Sure ?</Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'center',
            borderTop: 'none',
            mb: 4
          }}
        >
          <Button variant='tonal' color='secondary'>
            OK
          </Button>
        </DialogActions>
      </Dialog>
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
                  disabled={isLoading_getAllWithWhereCondition || isRefetching_getAllWithWhereCondition}
                >
                  Select All
                </Button>
                <Button
                  onClick={handleClearAllSelected}
                  variant='outlined'
                  className='rounded-3xl'
                  disabled={isLoading_getAllWithWhereCondition || isRefetching_getAllWithWhereCondition}
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
                      <Box sx={{ flexGrow: 0, width: '100%' }}>
                        {checkPermission(Number(import.meta.env.VITE_APPLICATION_ID), MENU_ID, 'IS_UPDATE', false) && (
                          <Button
                            sx={{
                              width: '100%',
                              justifyContent: 'start'
                            }}
                            onClick={handleOpenChangeStatusMenu}
                          >
                            Change Status
                          </Button>
                        )}
                        <Menu
                          sx={{ mt: '45px' }}
                          id='menu-appbar'
                          anchorEl={anchorChangeStatus}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                          }}
                          keepMounted
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                          }}
                          open={Boolean(anchorChangeStatus)}
                          onClose={handleCloseChangeStatusMenu}
                        >
                          <MenuItem
                            className='flex items-end'
                            // onClick={handleCloseChangeStatusMenu}
                          >
                            <Controller
                              name='TABLE_CHANGE_STATUS_TO'
                              control={control}
                              render={({ field: { ref, ...fieldProps } }) => (
                                <AsyncSelectCustom
                                  {...fieldProps}
                                  label='Change Status to'
                                  isClearable
                                  cacheOptions
                                  defaultOptions
                                  loadOptions={inputValue => {
                                    return fetchSctStatusProgressNameAndInuse({
                                      // listStatusSctProgress: Array.from(
                                      //   new Set(rowSelectionStatusProgress.map(r => r.SCT_STATUS_PROGRESS_ID))
                                      // ).map(id => ({
                                      //   SCT_STATUS_PROGRESS_ID: id
                                      // })),
                                      sctStatusProgressName: inputValue,
                                      inuse: 1
                                    })
                                  }}
                                  getOptionLabel={data => data?.SCT_STATUS_PROGRESS_NAME.toString()}
                                  getOptionValue={data => data.SCT_STATUS_PROGRESS_ID.toString()}
                                  classNamePrefix='select'
                                  placeholder='Select SCT Status Progress ...'
                                  // isOptionDisabled={option => {
                                  //   if (rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID === 1) return true

                                  //   if (rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID === 2) {
                                  //     return option?.SCT_STATUS_PROGRESS_ID !== 1
                                  //   }

                                  //   if (option?.SCT_STATUS_PROGRESS_ID === 1) return false

                                  //   if (rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID === 4) {
                                  //     return option?.SCT_STATUS_PROGRESS_ID !== 5
                                  //   } else if (rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID === 6) {
                                  //     return (
                                  //       !(
                                  //         option?.SCT_STATUS_PROGRESS_ID ===
                                  //         rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID - 2
                                  //       ) &&
                                  //       !(
                                  //         option?.SCT_STATUS_PROGRESS_ID ===
                                  //         rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID - 1
                                  //       ) &&
                                  //       !(
                                  //         option?.SCT_STATUS_PROGRESS_ID ===
                                  //         rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID + 1
                                  //       )
                                  //     )
                                  //   } else if (rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID === 7) {
                                  //     return (
                                  //       !(
                                  //         option?.SCT_STATUS_PROGRESS_ID ===
                                  //         rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID - 3
                                  //       ) &&
                                  //       !(
                                  //         option?.SCT_STATUS_PROGRESS_ID ===
                                  //         rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID - 2
                                  //       ) &&
                                  //       !(
                                  //         option?.SCT_STATUS_PROGRESS_ID ===
                                  //         rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID - 1
                                  //       ) &&
                                  //       !(
                                  //         option?.SCT_STATUS_PROGRESS_ID ===
                                  //         rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID + 1
                                  //       )
                                  //     )
                                  //   } else {
                                  //     return (
                                  //       !(
                                  //         option?.SCT_STATUS_PROGRESS_ID ===
                                  //         rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID - 1
                                  //       ) &&
                                  //       !(
                                  //         option?.SCT_STATUS_PROGRESS_ID ===
                                  //         rowSelectionStatusProgress[0]?.SCT_STATUS_PROGRESS_ID + 1
                                  //       )
                                  //     )
                                  //   }
                                  // }}
                                />
                              )}
                            />
                            <Button
                              variant='contained'
                              color='secondary'
                              className=''
                              onClick={handleCloseChangeStatusMenu}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant='contained'
                              color='primary'
                              // className='ms-2'
                              onClick={handleConfirmChangeStatus}
                            >
                              Confirm
                            </Button>
                          </MenuItem>
                        </Menu>
                      </Box>
                    </MenuItem>
                    <MenuItem
                      sx={{
                        padding: '0px'
                      }}
                    >
                      {canSeeCol && (
                        <Button
                          sx={{
                            width: '200px',
                            justifyContent: 'start'
                          }}
                          onClick={() => {
                            setOpenConfirmReCalModal(true)
                          }}
                          // disabled={(Object.keys(rowSelection) ?? []).some(sctId => {
                          //   const sctButtonStatus = reCalButtonStatus.find(item => item.SCT_ID === sctId)

                          //   if (!sctButtonStatus) return true

                          //   return !sctButtonStatus.IS_HAS_BUTTON || sctButtonStatus.IS_DISABLE
                          // })}
                        >
                          Cal / Re-Cal SCT
                        </Button>
                      )}
                    </MenuItem>
                    <Divider className='m-1' />
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

                {/* <Divider orientation='vertical' flexItem /> */}

                <Button
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    if (checkPermission(Number(import.meta.env.VITE_APPLICATION_ID), MENU_ID, 'IS_CREATE', false)) {
                      handleClickOpen()
                    }
                  }}
                  color='success'
                  className='rounded-3xl'
                >
                  Add New
                </Button>
              </div>
            </div>
          }
        />

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

        {/* {openExportModal ? (
          <ExportModal
            openExportModal={openExportModal}
            setOpenExportModal={setOpenExportModal}
            rowSelection={rowSelection}
            isFetchExportData={isFetchExportData}
            setIsFetchExportData={setIsFetchExportData}

            //setIsEnableFetchingMainTable={setIsEnableFetching}
          />
        ) : null} */}

        {openModalAdd ? (
          <StandardCostFormModal
            openModalAdd={openModalAdd}
            setOpenModalAdd={setOpenModalAdd}
            setIsEnableFetchingMainTable={setIsEnableFetching}
          />
        ) : null}

        {/* {openModalAdd ? <ProductMainModal openModal={openModalAdd} setOpenModal={setOpenModalAdd} mode='Add' /> : null} */}

        {openModalEdit ? (
          <SctForProductEditModal
            isOpenModal={openModalEdit}
            setIsOpenModal={setOpenModalEdit}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
            mode='edit'
            isCalculationAlready={is_Null_Undefined_Blank(rowSelected?.original?.SELLING_PRICE) ? false : true}
          />
        ) : null}

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

        {openModalDelete ? (
          <SctDataDeleteModal
            openModalDelete={openModalDelete}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
          />
        ) : null}

        {openConfirmModal ? (
          <ConfirmModalForSctForProduct
            show={openConfirmModal}
            setValue={setValue}
            sctStatusProgressId={getValues('TABLE_CHANGE_STATUS_TO')?.SCT_STATUS_PROGRESS_ID}
            onConfirmClick={() => {
              const dataItem = {
                SCT_ID: Object.keys(rowSelection),
                SCT_STATUS_PROGRESS_ID: getValues('TABLE_CHANGE_STATUS_TO')?.SCT_STATUS_PROGRESS_ID,
                UPDATE_BY: getUserData().EMPLOYEE_CODE,
                CANCEL_REASON: getValues('cancelReason') ?? '',
                //listStatusSctProgress: [{ SCT_STATUS_PROGRESS_ID: getValues('SCT_STATUS_PROGRESS_ID') }]
                listStatusSctProgress: rowSelectionStatusProgress.map((item: any) => {
                  return { SCT_STATUS_PROGRESS_ID: item.SCT_STATUS_PROGRESS_ID }
                })
              }

              if (getValues('TABLE_CHANGE_STATUS_TO')?.SCT_STATUS_PROGRESS_ID === 1 && !getValues('cancelReason')) {
                const message = {
                  title: 'SCT Data',
                  message: 'โปรดกรอกเหตุผลในการยกเลิก'
                }

                ToastMessageError(message)

                return
              }

              changeProgressMutation.mutate(dataItem)
            }}
            onCloseClick={() => setOpenConfirmModal(false)}
            isDelete={false}
            isLoading={changeProgressMutation.isPending}
          />
        ) : null}
        {openConfirmReCalModal ? (
          <ConfirmModal
            show={openConfirmReCalModal}
            onConfirmClick={async () => {
              try {
                setIsLoadingReCalModal(true)
                setCountSctCalFinished(0)
                setCountSctCal(0)
                let dataItem = Object.keys(rowSelection)

                if (rowSelection?.length > 0) {
                  dataItem = rowSelection
                  setCountSctCal(1)
                  const result = await StandardCostForProductServices.reCal(dataItem)
                    .then(setCountSctCalFinished(prev => prev + 1))
                    .catch(() => toast.error('Failed to reCal. Please check your data. ' + error.message))

                  if (result.data.Status === false) {
                    toast.error('Failed to reCal. Please check your data. ' + result.data.Message)
                    return
                  }
                } else {
                  dataItem = Object.keys(rowSelection)
                  setCountSctCal(dataItem.length)
                  // setCountSctCalFinished(dataItem.length)
                  // dataItem.forEach((row: string) => {
                  //   const sctDetail = (data?.data?.ResultOnDb ?? []).find(item => {
                  //     return item.SCT_ID === row
                  //   })

                  //   StandardCostForProductServices.reCal({
                  //     SCT_ID: row,
                  //     SCT_REVISION_CODE: sctDetail?.SCT_REVISION_CODE,
                  //     UPDATE_BY: getUserData().EMPLOYEE_CODE,
                  //     SCT_TAG_SETTING_ID: sctDetail?.SCT_TAG_SETTING_ID,
                  //     SCT_REASON_SETTING_ID: sctDetail?.SCT_REASON_SETTING_ID
                  //   }).then(setCountSctCalFinished(prev => prev + 1))
                  // })
                  //console.log(dataItem)

                  for (const row of dataItem) {
                    // const sctDetail = (data?.data?.ResultOnDb ?? []).find(item => {
                    //   return item.SCT_ID === row
                    // })

                    // console.log(sctDetail)

                    try {
                      const result = await StandardCostForProductServices.reCal([
                        {
                          SCT_ID: row,
                          // SCT_REVISION_CODE: sctDetail?.SCT_REVISION_CODE,
                          UPDATE_BY: getUserData().EMPLOYEE_CODE
                          // SCT_TAG_SETTING_ID: sctDetail?.SCT_TAG_SETTING_ID,
                          // SCT_REASON_SETTING_ID: sctDetail?.SCT_REASON_SETTING_ID
                        }
                      ])

                      if (result.data.Status === false) {
                        toast.error('Failed to reCal. Please check your data. ' + result.data.Message)
                        return
                      }

                      setCountSctCalFinished(prev => prev + 1)
                    } catch (error) {
                      toast.error('Failed to reCal. Please check your data. ' + error.message)
                      return
                    }
                  }
                }

                handleClearAllSelected()
                toast.success('Cal / Re-Cal SCT successfully.', {
                  autoClose: 10000
                })
              } catch (error) {
                toast.error('Failed to reCal. Please check your data.')
              } finally {
                setOpenConfirmReCalModal(false)
                setIsLoadingReCalModal(false)
                setCountSctCalFinished(0)
                setCountSctCal(0)

                setPagination({ pageIndex: 0, pageSize: getValues('searchResults.pageSize') ?? 10 })
                if (setIsEnableFetching) {
                  setIsEnableFetching(true)
                }

                queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
              }
            }}
            isLoading={isLoadingReCalModal}
            onCloseClick={() => {
              setOpenConfirmReCalModal(false)

              if (rowSelection?.length > 0) {
                setRowSelection({})
              }
            }}
            isDelete={false}
            countSctCalFinished={countSctCalFinished}
            setCountSctCalFinished={setCountSctCalFinished}
            countSctCal={countSctCal}
            setCountSctCal={setCountSctCal}
          />
        ) : null}
        {/* <AgGirdTest rowData={data?.data?.ResultOnDb || []} /> */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
            columns={columns}
            data={data?.data?.ResultOnDb || []}
            onColumnFiltersChange={setColumnFilters}
            onColumnFilterFnsChange={setColumnFilterFns}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            onColumnVisibilityChange={setColumnVisibility}
            onDensityChange={setDensity}
            onColumnPinningChange={setColumnPinning}
            onColumnOrderChange={setColumnOrder}
            rowCount={data?.data?.TotalCountOnDb ?? 0}
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
                  SCT_STATUS_PROGRESS_ID: (data?.data?.ResultOnDb || []).find(item => item.SCT_ID == key)
                    .SCT_STATUS_PROGRESS_ID
                }
              })

              setRowSelectionStatusProgress(selected)
            }}
            state={{
              columnFilters,
              pagination,
              showAlertBanner: isError,
              //showProgressBars: isRefetching,
              isLoading: isLoading, //cell skeletons and loading overlay
              showProgressBars: isRefetching, //progress bars while refetching

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
                setOpenModalEdit={setOpenModalEdit}
                setOpenModalDelete={setOpenModalDelete}
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

export default ProductMainTableData
