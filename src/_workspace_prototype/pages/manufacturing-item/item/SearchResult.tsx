import { useEffect, useMemo, useRef, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import QueueIcon from '@mui/icons-material/Queue'

import {
  Backdrop,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import type {
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'

import { useFormContext } from 'react-hook-form'

import { useUpdateEffect } from 'react-use'

// import type { CustomerInvoiceToInterface } from '@/_workspace/types/customer/CustomerInvoiceTo'
import type { ManufacturingItemI } from '@/_workspace/types/manufacturing-item/ManufacturingItem'

// Utils
import type { ParamApiSearchResultTableI_V2 } from '@libs/material-react-table/types/SearchResultTable'

import SelectCustom from '@/components/react-select/SelectCustom'
import StatusColumn from '@libs/material-react-table/components/StatusOption'
import ActionsMenu from './SearchFilters/ActionsMenu'

import ManufacturingItemModal from './modal/AddEditViewModal'
import ManufacturingItemDeleteModal from './modal/DeleteModal'

import { useCreateItemForm, useSearch } from '@/_workspace/react-query/hooks/useManufacturingItemData'

import type { FormDataPage } from './validationSchema'

import { useSettings } from '@/@core/hooks/useSettings'

import { useCheckPermission } from '@/_template/CheckPermission'
import { useDxContext } from '@/_template/DxContextProvider'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { fetchItemPrice } from '@/_workspace/react-select/async-promise-load-options/fetchItem'
import ImageItemColumn from '@/components/imgColumn/ImageColumnCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { saveAs } from 'file-saver'
import { MENU_ID } from './env'
import ImportPageItemPrice from './modal/importModal'

interface ParamApiSearchManufacturingItemI extends ParamApiSearchResultTableI_V2 {
  ITEM_CATEGORY_ID?: number | ''
  ITEM_PURPOSE_ID?: number | ''
  VENDOR_ID?: number | ''
  MAKER_ID?: number | ''
  ITEM_INTERNAL_CODE?: string
  ITEM_INTERNAL_FULL_NAME?: string
  ITEM_INTERNAL_SHORT_NAME?: string
  ITEM_EXTERNAL_CODE?: string
  ITEM_EXTERNAL_FULL_NAME?: string
  ITEM_EXTERNAL_SHORT_NAME?: string
  ITEM_CODE_FOR_SUPPORT_MES?: string
  ITEM_PROPERTY_COLOR_ID?: number | ''
  ITEM_PROPERTY_SHAPE_ID?: number | ''
}

export type SearchResultType = Required<ManufacturingItemI>

function ManufacturingItemTableData() {
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const [openImportModal, setOpenModalImport] = useState<boolean>(false)
  // react-hook-form
  const { getValues, setValue } = useFormContext<FormDataPage>()

  // States
  const [rowSelected, setRowSelected] = useState<MRT_Row<SearchResultType> | null>(null)

  const { settings } = useSettings()

  // #region States : mui-react-table

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('columnOrder') || '[]')
  })
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    getValues('searchResults.columnFilters') || []
  )

  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))

  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
  )

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize')
  })

  // #endregion

  // States : Modal
  const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const open = Boolean(anchorEl)
  const [anchorElImport, setAnchorElImport] = useState<null | HTMLElement>(null)

  const checkPermission = useCheckPermission()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const openImport = Boolean(anchorElImport)
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleClickImport = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElImport(event.currentTarget)
  }

  const handleCloseImport = () => {
    setAnchorElImport(null)
  }

  const onMutateSuccess = (data: any) => {
    const message = {
      message: 'Download Template File Success',
      title: 'Item Manufacturing Form'
    }
    ToastMessageSuccess(message)

    handleClose()
  }

  const onMutateError = (err: any) => {
    const message = {
      title: 'Download Template Form',
      message: 'Download Template Error ' + `${err}`
    }

    ToastMessageError(message)
  }

  const handleImportData = async () => {
    setOpenModalImport(true)
  }

  const { mutate: createDownloadMutation, isPending: isLoadingDownload } = useCreateItemForm(
    onMutateSuccess,
    onMutateError
  )

  const handleExportTemplate = async () => {
    createDownloadMutation({})
  }

  const handleExportCurrentPage = async () => {
    setIsExporting(true)
    try {
      const dataItem = {
        columnFilters: JSON.parse(localStorage.getItem('columnOrder') || '[]'),
        columnVisibility: getValues('searchResults.columnVisibility'),
        DataForFetch: paramForSearch,
        TYPE: 'currentPage'
      }

      const file = await fetchItemPrice(dataItem)
      // สร้าง timestamp แบบ YYYYMMDD_HHmmss
      const now = new Date()
      const pad = (n: number) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`

      // ใช้ชื่อเดียวกับฝั่ง backend ที่จะ generate เช่น ManufacturingItem_20250703_103300.xlsx
      const filename = `ManufacturingItem_${timestamp}.xlsx`
      saveAs(file, filename)
      handleClose()
    } catch (error) {
      console.error('Export current page failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAllPage = async () => {
    setIsExporting(true)
    try {
      const dataItem = {
        columnFilters: JSON.parse(localStorage.getItem('columnOrder') || '[]'),
        columnVisibility: getValues('searchResults.columnVisibility'),
        DataForFetch: paramForSearch,
        TYPE: 'AllPage'
      }

      const file = await fetchItemPrice(dataItem)
      // สร้าง timestamp แบบ YYYYMMDD_HHmmss
      const now = new Date()
      const pad = (n: number) => n.toString().padStart(2, '0')
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`

      // ใช้ชื่อเดียวกับฝั่ง backend ที่จะ generate เช่น ManufacturingItem_20250703_103300.xlsx
      const filename = `ManufacturingItem_${timestamp}.xlsx`
      saveAs(file, filename)
      handleClose()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }
  // react-query
  const paramForSearch: ParamApiSearchManufacturingItemI = {
    SearchFilters: [
      {
        id: 'ITEM_CATEGORY_ID',
        value: getValues('searchFilters.itemCategory')?.ITEM_CATEGORY_ID || ''
      },
      {
        id: 'ITEM_PURPOSE_ID',
        value: getValues('searchFilters.itemPurpose')?.ITEM_PURPOSE_ID || ''
      },
      {
        id: 'VENDOR_ID',
        value: getValues('searchFilters.vendor')?.VENDOR_ID || ''
      },

      {
        id: 'MAKER_ID',
        value: getValues('searchFilters.maker')?.MAKER_ID || ''
      },
      {
        id: 'ITEM_GROUP_ID',
        value: getValues('searchFilters.itemGroup')?.ITEM_GROUP_ID || ''
      },
      {
        id: 'ITEM_INTERNAL_CODE',
        value: getValues('searchFilters.itemInternalCode') || ''
      },
      {
        id: 'ITEM_INTERNAL_FULL_NAME',
        value: getValues('searchFilters.itemInternalFullName') || ''
      },
      {
        id: 'ITEM_INTERNAL_SHORT_NAME',
        value: getValues('searchFilters.itemInternalShortName') || ''
      },
      {
        id: 'ITEM_EXTERNAL_CODE',
        value: getValues('searchFilters.itemExternalCode') || ''
      },
      {
        id: 'ITEM_EXTERNAL_FULL_NAME',
        value: getValues('searchFilters.itemExternalFullName') || ''
      },
      {
        id: 'ITEM_EXTERNAL_SHORT_NAME',
        value: getValues('searchFilters.itemExternalShortName') || ''
      },
      {
        id: 'ITEM_CODE_FOR_SUPPORT_MES',
        value: getValues('searchFilters.itemCodeForSupportMes') || ''
      },
      {
        id: 'ITEM_PROPERTY_COLOR_ID',
        value: getValues('searchFilters.color')?.ITEM_PROPERTY_COLOR_ID || ''
      },
      {
        id: 'ITEM_PROPERTY_SHAPE_ID',
        value: getValues('searchFilters.shape')?.ITEM_PROPERTY_SHAPE_ID || ''
      },
      {
        id: 'inuseForSearch',
        value: getValues('searchFilters.status')?.value === 0 ? 0 : getValues('searchFilters.status')?.value || ''
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

  const { data, isError, isFetching } = useSearch(paramForSearch, isEnableFetching)

  useEffect(() => {
    if (isFetching === false) {
      // console.log('test')
      // setDataUnlimit(
      //   fetchManufacturingItemData(
      //     getValues('searchFilters.itemCategory')?.ITEM_CATEGORY_ID || '',
      //     getValues('searchFilters.itemPurpose')?.ITEM_PURPOSE_ID || '',
      //     getValues('searchFilters.vendor')?.VENDOR_ID || '',
      //     getValues('searchFilters.maker')?.MAKER_ID || '',
      //     getValues('searchFilters.itemGroup')?.ITEM_GROUP_ID || '',
      //     getValues('searchFilters.itemInternalCode') || '',
      //     getValues('searchFilters.itemInternalFullName') || '',
      //     getValues('searchFilters.itemInternalShortName') || '',
      //     getValues('searchFilters.itemExternalCode') || '',
      //     getValues('searchFilters.itemExternalFullName') || '',
      //     getValues('searchFilters.itemExternalShortName') || '',
      //     getValues('searchFilters.itemCodeForSupportMes') || '',
      //     getValues('searchFilters.color')?.ITEM_PROPERTY_COLOR_ID || '',
      //     getValues('searchFilters.shape')?.ITEM_PROPERTY_SHAPE_ID || '',
      //     getValues('searchFilters.status')?.value || ''
      //   )
      // )
      setIsEnableFetching(false)
    }
  }, [isFetching, setIsEnableFetching])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, columnFilterFns, sorting, pagination])])

  // react-table
  const columns = useMemo<MRT_ColumnDef<SearchResultType>[]>(
    () => [
      {
        accessorKey: 'inuseForSearch',
        header: 'Status',
        size: 200,
        Cell: ({ cell }) => (
          <Chip
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
            size='small'
            label={StatusColumn.find(dataItem => dataItem.value === cell.getValue())?.label}
            color={StatusColumn.find(dataItem => dataItem.value === cell.getValue())?.color || 'primary'}
          />
        ),
        filterSelectOptions: StatusColumn,
        filterVariant: 'multi-select',
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

                // console.log(value)

                // if (value.length === 0) {
                //   column.setFilterValue(null)
                // }

                column.setFilterValue(value)
              }}
            />
          )
        }
      },
      {
        accessorKey: 'IMAGE_PATH',
        header: 'IMAGE',
        // filterVariant: 'text',
        enableColumnFilter: false,
        enableColumnFilterModes: false,
        enableSorting: false,
        size: 150,
        Cell: ({ cell }) => (
          <Box sx={{ margin: '0 auto' }}>
            <ImageItemColumn key={cell.row.original.ITEM_ID + cell.row.original.UPDATE_DATE} cell={cell.row.original} />
          </Box>
        )
      },
      {
        accessorKey: 'ITEM_CATEGORY_NAME',
        header: 'ITEM CATEGORY NAME',
        size: 250,
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_CODE_FOR_SUPPORT_MES',
        header: 'ITEM CODE',
        size: 200,
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'VERSION_NO',
        header: 'VERSION NO',
        size: 170,
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_PURPOSE_NAME',
        header: 'ITEM PURPOSE NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },

      {
        accessorKey: 'ITEM_GROUP_NAME',
        header: 'ITEM GROUP NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'NOTE',
        header: 'NOTE',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'VENDOR_NAME',
        header: 'VENDOR NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },

      {
        accessorKey: 'MAKER_NAME',
        header: 'MAKER NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'WIDTH',
        header: 'WIDTH',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'HEIGHT',
        header: 'HEIGHT',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'DEPTH',
        header: 'DEPTH',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_PROPERTY_COLOR_NAME',
        header: 'ITEM PROPERTY COLOR NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_PROPERTY_SHAPE_NAME',
        header: 'ITEM PROPERTY SHAPE NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_INTERNAL_FULL_NAME',
        header: 'ITEM INTERNAL FULL NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_INTERNAL_SHORT_NAME',
        header: 'ITEM INTERNAL SHORT NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_EXTERNAL_CODE',
        header: 'ITEM EXTERNAL CODE',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_EXTERNAL_FULL_NAME',
        header: 'ITEM EXTERNAL FULL NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ITEM_EXTERNAL_SHORT_NAME',
        header: 'ITEM EXTERNAL SHORT NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },

      {
        accessorKey: 'PURCHASE_UNIT_RATIO',
        header: 'PURCHASE UNIT RATIO',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PURCHASE_UNIT_NAME',
        header: 'PURCHASE UNIT NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },

      {
        accessorKey: 'USAGE_UNIT_RATIO',
        header: 'USAGE UNIT RATIO',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains',
        Cell: ({ cell }) => <>{formatNumber(cell.getValue(), 7, true)}</>
      },
      {
        accessorKey: 'USAGE_UNIT_NAME',
        header: 'USAGE UNIT NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'MOQ',
        header: 'MOQ',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'LEAD_TIME',
        header: 'LEAD TIME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'SAFETY_STOCK',
        header: 'SAFETY STOCK',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },

      // {
      //   accessorKey: 'CUSTOMER_ORDER_FROM_ALPHABET',
      //   header: 'CUSTOMER ORDER FROM',

      //   filterVariant: 'text',
      //   columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //   filterFn: 'contains'
      // },
      {
        accessorKey: 'COLOR_NAME',
        header: 'THEME COLOR NAME',
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'UPDATE BY',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: 'UPDATE DATE',
        filterVariant: 'date',
        columnFilterModeOptions: [
          'equals',
          'notEquals',
          'greaterThan',
          'greaterThanOrEqualTo',
          'lessThan',
          'lessThanOrEqualTo'
        ],
        filterFn: 'equals',
        size: 250
      }
    ],
    [settings.mode]
  )
  useEffect(() => {
    if (columnOrder.length === 0) {
      setColumnOrder(columns.map((col: any) => col.accessorKey))
    }
  }, [columns])

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

  // const ExportData = async () => {
  //   const dataItem = {
  //     columnFilters: JSON.parse(localStorage.getItem('columnOrder') || '[]'),
  //     columnVisibility: getValues('searchResults.columnVisibility'),
  //     DATA: data?.data?.ResultOnDb
  //   }
  //   console.log(dataItem)

  //   const file = await fetchItemPrice(dataItem)

  //   saveAs(file, 'Item.xlsx')
  //   console.log(
  //     {
  //       pageSize: getValues('searchResults.pageSize'),
  //       columnFilters: getValues('searchResults.columnFilters'),
  //       sorting: getValues('searchResults.sorting'),
  //       density: getValues('searchResults.density'),
  //       columnVisibility: getValues('searchResults.columnVisibility'),
  //       columnPinning: getValues('searchResults.columnPinning'),
  //       columnOrder: getValues('searchResults.columnOrder'),
  //       columnFilterFns: getValues('searchResults.columnFilterFns')
  //     },
  //     'DATA',
  //     data?.data?.ResultOnDb
  //   )
  // }

  return (
    <>
      <Card>
        <CardHeader
          title='Search result'
          action={
            <>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outlined'
                  startIcon={<QueueIcon />}
                  onClick={e => {
                    if (checkPermission(Number(import.meta.env.VITE_APPLICATION_ID), MENU_ID, 'IS_CREATE')) {
                      handleClickImport(e)
                    }
                  }}
                  className='rounded-3xl'
                >
                  Import
                </Button>
                <Menu anchorEl={anchorElImport} open={openImport} onClose={handleCloseImport}>
                  <MenuItem onClick={handleImportData} disabled={isExporting}>
                    <ListItemIcon>
                      <FileUploadIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>{isExporting ? 'Exporting...' : 'Import Data'}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleExportTemplate} disabled={isExporting || isLoadingDownload}>
                    <ListItemIcon>
                      <FileDownloadIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>
                      {isExporting || isLoadingDownload ? 'Downloading...' : 'Download Template'}
                    </ListItemText>
                  </MenuItem>
                </Menu>
                <Button
                  variant='outlined'
                  color='primary'
                  startIcon={<FileDownloadIcon />}
                  onClick={handleClick}
                  className='rounded-3xl'
                >
                  Export to Excel
                </Button>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleExportCurrentPage} disabled={isExporting}>
                    <ListItemIcon>
                      <FileDownloadIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>{isExporting ? 'Exporting...' : 'Export Current Page'}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleExportAllPage} disabled={isExporting}>
                    <ListItemIcon>
                      <FileDownloadIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>{isExporting ? 'Exporting...' : 'Export All'}</ListItemText>
                  </MenuItem>
                </Menu>
                <Divider orientation='vertical' flexItem />
                <Button
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    if (checkPermission(Number(import.meta.env.VITE_APPLICATION_ID), MENU_ID, 'IS_CREATE')) {
                      handleClickOpen()
                    }
                  }}
                  color='success'
                  className='rounded-3xl'
                >
                  Add New
                </Button>
              </div>
            </>
          }
        />
        {isExporting && (
          <Backdrop open style={{ zIndex: 1300 }}>
            <CircularProgress color='inherit' />
          </Backdrop>
        )}
        {openImportModal ? (
          <ImportPageItemPrice
            openImportModal={openImportModal}
            setOpenModalImport={setOpenModalImport}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null}
        {openModalView ? (
          <ManufacturingItemModal
            openModal={openModalView}
            setOpenModal={setOpenModalView}
            mode='View'
            rowSelected={rowSelected}
          />
        ) : null}

        {openModalAdd ? (
          <ManufacturingItemModal
            openModal={openModalAdd}
            setOpenModal={setOpenModalAdd}
            setIsEnableFetching={setIsEnableFetching}
            mode='Add'
          />
        ) : null}

        {openModalEdit ? (
          <ManufacturingItemModal
            openModal={openModalEdit}
            setOpenModal={setOpenModalEdit}
            setIsEnableFetching={setIsEnableFetching}
            mode='Edit'
            rowSelected={rowSelected}
          />
        ) : null}

        {openModalDelete ? (
          <ManufacturingItemDeleteModal
            openModalDelete={openModalDelete}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null}
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
            onColumnOrderChange={newOrder => {
              setColumnOrder(newOrder)
              localStorage.setItem('columnOrder', JSON.stringify(newOrder))
            }}
            rowCount={data?.data?.TotalCountOnDb ?? 0}
            state={{
              columnFilters,
              isLoading: false,
              pagination,
              showAlertBanner: isError,
              // showProgressBars: isRefetching,
              sorting,
              density,
              columnVisibility,
              columnPinning,
              columnOrder,
              columnFilterFns
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

export default ManufacturingItemTableData
