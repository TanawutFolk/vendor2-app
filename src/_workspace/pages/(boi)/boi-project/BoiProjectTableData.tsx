import AddIcon from '@mui/icons-material/Add'
import FilterListIcon from '@mui/icons-material/FilterList'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Chip,
  IconButton,
  MenuItem,
  Pagination,
  Tooltip,
  Typography
} from '@mui/material'
import type {
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table'

import { Controller, useFormContext } from 'react-hook-form'

import { useUpdateEffect } from 'react-use'
// import type { CustomerInvoiceToInterface } from '@/_workspace/types/customer/CustomerInvoiceTo'
import type { BoiProjectI } from '@/_workspace/types/boi/BoiProject'

import type { FormData } from './page'
// Utils

import { useSearchBoiProject } from '@/_workspace/react-query/hooks/useBoiProjectData'

import BoiProjectAddModal from './modal/BoiProjectAddModal'
import BoiProjectViewModal from './modal/BoiProjectViewModal'

import SelectCustom from '@/components/react-select/SelectCustom'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import BoiProjectDeleteModal from './modal/BoiProjectDeleteModal'
import BoiProjectUnitEditModal from './modal/BoiProjectEditModal'

import { useSettings } from '@/@core/hooks/useSettings'
import { useCheckPermission } from '@/_template/CheckPermission'
import CustomTextField from '@/components/mui/TextField'
import ActionsMenu from '@/libs/material-react-table/components/ActionsMenu'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import { ParamApiSearchResultTableI_V2 } from '@/libs/material-react-table/types/SearchResultTable'
import { MENU_ID } from './env'
//or use your library of choice here
interface ParamApiSearchBoiProjectI extends ParamApiSearchResultTableI_V2 {
  BOI_PROJECT_ID?: number | ''
  BOI_PROJECT_CODE?: string | ''
  BOI_PROJECT_NAME?: string | ''
  BOI_PRODUCT_GROUP_NAME?: string | ''
  // inuseForSearch?: string
}

// const getUrlParamSearch = ({
//   queryPageIndex,
//   queryPageSize,
//   querySortBy,
//   queryColumnFilterFns,
//   queryColumnFilters,
//   BOI_PROJECT_ID = '',
//   BOI_PROJECT_CODE = '',
//   BOI_PROJECT_NAME = '',
//   BOI_PRODUCT_GROUP_NAME = '',
//   inuseForSearch = ''
//   // INUSE = null
//   // INUSE = ''
//   // PRODUCT_CATEGORY_ID = ''
// }: ParamApiSearchBoiProjectI): any => {
//   const params = {
//     BOI_PROJECT_NAME: BOI_PROJECT_NAME.trim(),
//     BOI_PROJECT_ID: BOI_PROJECT_ID || '',
//     BOI_PROJECT_CODE: BOI_PROJECT_CODE || '',
//     BOI_PRODUCT_GROUP_NAME: BOI_PRODUCT_GROUP_NAME.trim(),
//     INUSE: is_Null_Undefined_Blank(inuseForSearch) ? '' : inuseForSearch,
//     Start: queryPageIndex,
//     Limit: queryPageSize,
//     Order: querySortBy.length > 0 ? JSON.stringify(querySortBy).replace('MODIFIED_DATE', 'UPDATE_DATE') : ''
//   }
//   // , "PRODUCT_CATEGORY_ID":"${PRODUCT_CATEGORY_ID || ''}"
//   // if (querySortBy?.length > 0) {
//   //   params.Order = JSON.stringify(querySortBy).replace('MODIFIED_DATE', 'UPDATE_DATE')
//   // }

//   // if (queryColumnFilters.length > 0) {
//   //   params += `, "ColumnFilters":[`
//   //   for (const item of queryColumnFilters) {
//   //     params += `{"columnFns":"${queryColumnFilterFns[item.id]}","column":"${item.id}","value":"${item.value}"},`
//   //   }

//   //   params = params.slice(0, -1)
//   //   params += `]`
//   // }

//   //params = `{${params}}`
//   console.log('param', params)

//   return params
// }

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
function BoiProjectTableData({ isEnableFetching, setIsEnableFetching }: Props) {
  // react-hook-form
  const { getValues, control, setValue } = useFormContext<FormData>()

  // States
  const [rowSelected, setRowSelected] = useState<MRT_Row<BoiProjectI> | null>(null)

  // States : mui-react-table
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(getValues('searchResults.columnFilters'))
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))
  const { settings } = useSettings()
  const checkPermission = useCheckPermission()
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
    pageSize: getValues('searchResults.pageSize')
  })

  // States : Modal
  const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [openModalEdit, setOpenModalEdit] = useState<boolean>(false)
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
  const [openModalView, setOpenModalView] = useState<boolean>(false)
  // react-query
  // const paramForSearch: ParamApiSearchBoiProjectI = {
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
  //   BOI_PROJECT_ID: getValues('searchFilters.boiProject')?.BOI_PROJECT_ID || '',
  //   BOI_PROJECT_NAME: getValues('searchFilters.boiProject')?.BOI_PROJECT_NAME || '',
  //   BOI_PROJECT_CODE: getValues('searchFilters.boiProjectCode')?.BOI_PROJECT_CODE || '',
  //   BOI_PRODUCT_GROUP_NAME: getValues('searchFilters.boiProductGroupName')?.BOI_PRODUCT_GROUP_NAME || '',
  //   inuseForSearch: getValues('searchFilters.status')?.value
  // }
  // react-query
  const paramForSearch: ParamApiSearchBoiProjectI = {
    SearchFilters: [
      // {
      //   id: 'BOI_PROJECT_ID',
      //   value: getValues('searchFilters.boiProject')?.BOI_PROJECT_ID || ''
      // },
      {
        id: 'BOI_PROJECT_NAME',
        value: getValues('searchFilters.boiProject')?.BOI_PROJECT_NAME || ''
      },
      {
        id: 'BOI_PROJECT_CODE',
        value: getValues('searchFilters.boiProjectCode')?.BOI_PROJECT_CODE || ''
      },
      {
        id: 'BOI_PRODUCT_GROUP_NAME',
        value: getValues('searchFilters.boiProductGroupName')?.BOI_PRODUCT_GROUP_NAME || ''
      },
      {
        id: 'inuseForSearch',
        value: getValues('searchFilters.status')?.value ?? ''
      }
    ],
    ColumnFilters: columnFilters.map(item => ({
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
  const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearchBoiProject(
    paramForSearch,
    isEnableFetching
    // setIsEnableFetching(true)
  )

  useEffect(() => {
    if (isFetching === false) {
      setIsEnableFetching(false)
    }
  }, [isFetching])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, columnFilterFns, sorting, pagination])])

  // react-table
  const columns = useMemo<MRT_ColumnDef<BoiProjectI>[]>(
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

        // filterSelectOptions: StatusColumn,
        // filterVariant: 'select',
        // enableColumnFilterModes: false,
        // filterFn: 'contains'

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

                column.setFilterValue(value)
              }}
            />
          )
        }
      },

      {
        accessorKey: 'BOI_PROJECT_NAME',
        header: 'BOI PROJECT NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },
      {
        accessorKey: 'BOI_PROJECT_CODE',
        header: 'BOI PROJECT CODE',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },

      {
        accessorKey: 'BOI_PRODUCT_GROUP_NAME',
        header: 'BOI PRODUCT GROUP NAME',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],

        filterFn: 'contains'
      },
      // {
      //   accessorKey: 'CREATE_DATE',
      //   header: 'CREATE DATE',
      //   filterFn: 'equals'
      // },
      // {
      //   accessorKey: 'CREATE_BY',
      //   header: 'CREATE BY',
      //   filterFn: 'contains'
      // },
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
    data: data?.data.ResultOnDb || [],
    manualFiltering: true, //turn off built-in client-side filtering
    manualPagination: true, //turn off built-in client-side pagination
    manualSorting: true, //turn off built-in client-side sorting
    onColumnFiltersChange: setColumnFilters,
    onColumnFilterFnsChange: setColumnFilterFns,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onDensityChange: setDensity,
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: setColumnOrder,
    rowCount: data?.data.TotalCountOnDb ?? 0,
    isMultiSortEvent: () => true,
    enableStickyHeader: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableColumnPinning: true,
    enableRowActions: true,
    enableColumnResizing: true,
    enableColumnOrdering: true,
    paginationDisplayMode: 'pages',
    state: {
      columnFilters,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
      density,
      columnVisibility,
      columnPinning,
      columnOrder,
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
        header: 'Actions', //change header text
        size: 100, //make actions column wider
        grow: false,
        muiTableHeadCellProps: {
          align: 'center' //change head cell props
        }
      },
      'mrt-row-select': {
        enableColumnActions: true,
        enableHiding: true,
        size: 100,
        muiTableHeadCellProps: {
          align: 'center' //change head cell props
        },
        muiTableBodyCellProps: {
          align: 'center' //change head cell props
        }
      }
    },
    renderToolbarInternalActions: ({ table }) => (
      <>
        {/* add your own custom print button or something */}
        {/* <IconButton onClick={() => showPrintPreview(true)}>
          <PrintIcon />
        </IconButton> */}
        {/* built-in buttons (must pass in table prop for them to work!) */}
        {/* <MRT_ToggleFiltersButton table={table} /> */}
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    ),
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
        <Tooltip arrow title='Clear All Sorting' onClick={() => table.resetSorting(true)}>
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
      </div>
    ),

    // renderBottomToolbarCustomActions: () => <>Test</>,
    renderBottomToolbar: ({ table }) => (
      <div className='flex items-center justify-end gap-2 p-3'>
        <div className='flex items-center gap-2'>
          <Typography variant='body1'>
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
            {pagination.pageIndex * pagination.pageSize + (data?.data?.ResultOnDb?.length || 0)} of{' '}
            {table.getRowCount()} entries
          </Typography>
          {/* <MRT_TablePagination table={table} showRowsPerPage={false} /> */}

          <Pagination
            count={table.getPageOptions().length}
            page={table.getState().pagination.pageIndex + 1}
            onChange={(event, value: number) => table.setPageIndex(value - 1)}
            variant='tonal'
            shape='rounded'
            color='primary'
          />
        </div>
      </div>
    ),

    // muiCircularProgressProps: {
    //   color: 'secondary',
    //   thickness: 5,
    //   size: 55
    // },
    // muiSkeletonProps: {
    //   animation: 'pulse',
    //   height: 28
    // },
    renderRowActions: ({ row }) => (
      // <div className='flex items-center justify-start gap-2 p-3'>
      //   <div className='flex items-center gap-2'>
      //     <IconButton onClick={() => console.info('Edit')}>
      //       <EditIcon />
      //     </IconButton>
      //     <IconButton onClick={() => console.info('Delete')}>
      //       <DeleteIcon />
      //     </IconButton>
      //   </div>
      // </div>
      <div className='flex items-center'>
        <IconButton onClick={() => handleClickOpenModalView(row)}>
          <i className='tabler-eye text-[22px] text-textSecondary' />
        </IconButton>
        {/* <Tooltip title='Edit'>
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip> */}
        {row?.original?.inuseForSearch === 1 ? (
          <ActionsMenu
            row={row}
            setOpenModalEdit={setOpenModalEdit}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
            MENU_ID={MENU_ID}
          />
        ) : null}

        {/* <OptionMenu
          // style={{ zIndex: 3000 }}
          iconClassName='text-[22px] text-textSecondary'
          options={[
            {
              text: 'Download',
              icon: 'tabler-download text-[22px]',
              menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
            },
            {
              text: 'Edit',
              icon: 'tabler-pencil text-[22px]',

              //href: getLocalizedUrl(`apps/invoice/edit/${row.original.id}`, locale as Locale),
              linkProps: {
                className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
              }
            },
            {
              text: 'Duplicate',
              icon: 'tabler-copy text-[22px]',
              menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
            }
          ]}
        /> */}
      </div>
    ),

    // renderRowActionMenuItems: ({ row, table }) => [
    //   <IconButton key='view'>
    //     <i className='tabler-eye text-[22px] text-textSecondary' />
    //   </IconButton>,
    //   <MRT_ActionMenuItem //or just use a normal MUI MenuItem component
    //     icon={<EditIcon />}
    //     key='edit'
    //     label='Edit'
    //     onClick={() => console.info('Edit')}
    //     table={table}
    //   />,
    //   <MRT_ActionMenuItem
    //     icon={<DeleteIcon />}
    //     key='delete'
    //     label='Delete'
    //     onClick={() => console.info('Delete')}
    //     table={table}
    //   />
    // ],
    initialState: {
      showColumnFilters: false
    },

    // muiPaginationProps: {
    //   showRowsPerPage: false
    // },
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data'
        }
      : undefined,

    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600,
        textTransform: 'uppercase',

        backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.25)'
      }
    },
    muiTableBodyProps: {
      sx: {
        //stripe the rows, make odd rows a darker color
        '& tr:nth-of-type(odd) > td': {
          backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.055)'
        }
      }
    },

    //muiTableProps
    // muiTableBodyProps: {
    //   sx: theme => ({
    //     backgroundColor: 'var(--mui-palette-background-paper)'

    //     // '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //     //   backgroundColor: darken('rgb(var(--mui-palette-primary-mainChannel))', 0.9)
    //     // },
    //     // '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //     //   backgroundColor: lighten('rgb(var(--mui-palette-background-paper))', 0.1)
    //     // }
    //   })
    // },

    muiTableBodyCellProps: {
      sx: theme => ({
        backgroundColor: 'var(--mui-palette-background-default)',
        fontSize: 15,
        borderRight:
          theme.palette.mode === 'dark'
            ? '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.2)'
            : '1px solid rgb(var(--mui-palette-primary-mainChannel) / 0.19)',
        borderBottom:
          theme.palette.mode === 'dark'
            ? '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.08)'
            : '1px solid rgb(var(--mui-palette-primary-mainChannel) / 0.19)'
      })
    },

    //   // sx: theme => ({
    //   //   '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-default)'
    //   //   },
    //   //   '& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]):hover > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-paper)'
    //   //   },
    //   //   '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-default)'
    //   //   },
    //   //   '& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]):hover > td': {
    //   //     backgroundColor: 'var(--mui-palette-background-paper)'
    //   //   }
    //   // })
    // },
    muiTopToolbarProps: {
      sx: {
        backgroundColor: 'var(--mui-palette-background-default)'
      }
    },
    muiTablePaperProps: ({ table }) => ({
      elevation: 0, //change the mui box shadow
      //customize paper styles
      style: {
        zIndex: table.getState().isFullScreen ? 2000 : undefined
      },
      sx: {
        borderRadius: '0'

        //stripe the rows, make odd rows a darker color
        // '& tr:nth-of-type(odd) > td': {
        //   backgroundColor: '#bb3535'
        // }

        //border: 'none'
      }
    })
  })

  const handleClickOpen = () => setOpenModalAdd(true)

  const handleClickOpenModalView = (row: MRT_Row<BoiProjectI>) => {
    setOpenModalView(true)
    setRowSelected(row)
  }

  return (
    <>
      <Card>
        <CardHeader
          title='Search result'
          action={
            <>
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
              {openModalAdd ? (
                <BoiProjectAddModal
                  openModalAdd={openModalAdd}
                  setOpenModalAdd={setOpenModalAdd}
                  setIsEnableFetching={setIsEnableFetching}
                />
              ) : null}
            </>
          }
        />
        {openModalEdit && (
          <BoiProjectUnitEditModal
            openModalEdit={openModalEdit}
            setOpenModalEdit={setOpenModalEdit}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        )}

        {openModalDelete ? (
          <BoiProjectDeleteModal
            openModalDelete={openModalDelete}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
            setIsEnableFetching={setIsEnableFetching}
          />
        ) : null}
        {openModalView ? (
          <BoiProjectViewModal
            openModalView={openModalView}
            setOpenModalView={setOpenModalView}
            rowSelected={rowSelected}
            setRowSelected={setRowSelected}
          />
        ) : null}

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MaterialReactTable table={table} />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default BoiProjectTableData
