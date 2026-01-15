import { useEffect, useMemo, useRef, useState } from 'react'

import { Button, Card, CardHeader, Chip } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'

import type {
  MRT_ColumnDef,
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

import { useFormContext } from 'react-hook-form'

import { useUpdateEffect } from 'react-use'

// import type { CustomerInvoiceToInterface } from '@/_workspace/types/customer/CustomerInvoiceTo'
import type { ProductMainI } from '@/_workspace/types/productGroup/product-main/ProductMain'

// Utils

import type { ParamApiSearchResultTableI_V2 } from '@libs/material-react-table/types/SearchResultTable'

import StatusColumn from '@libs/material-react-table/components/StatusOption'

import ProductMainModal from './modal/AddEditViewModal'

import { useSearch } from '@/_workspace/react-query/hooks/useProductMainData'
import ProductMainDeleteModal from './modal/DeleteModal'

import { useSettings } from '@/@core/hooks/useSettings'
import { useDxContext } from '@/_template/DxContextProvider'
import { DxMRTTable } from '@/_template/DxMRTTable'
import type { AccountDepartmentCodeI } from '@/_workspace/types/account/AccountDepartmentCode'
import type { BoiProjectI } from '@/_workspace/types/boi/BoiProject'
import type { EnvironmentCertificateI } from '@/_workspace/types/environment-certificate/EnvironmentCertificate'
import type { ProductMainBoiI } from '@/_workspace/types/productGroup/product-main/ProductMainBoi'
import type { ProductCategoryI } from '@/_workspace/types/productGroup/ProductCategory'
import SelectCustom from '@/components/react-select/SelectCustom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import ActionsMenu from './SearchFilters/ActionsMenu'
import type { FormDataPage } from './validationSchema'
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

function ProductMainTableData() {
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  // react-hook-form
  const { getValues, setValue } = useFormContext<FormDataPage>()

  // States
  const [rowSelected, setRowSelected] = useState<MRT_Row<SearchResultType> | null>(null)

  const { settings } = useSettings()

  // #region States : mui-react-table

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

  // react-query
  const paramForSearch: ParamApiSearchProductMainI = {
    SearchFilters: [
      {
        id: 'PRODUCT_CATEGORY_ID',
        value: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID || ''
      },
      {
        id: 'PRODUCT_MAIN_NAME',
        value: getValues('searchFilters.productMainName').trim()
      },
      {
        id: 'PRODUCT_MAIN_CODE',
        value: getValues('searchFilters.productMainCode').trim()
      },
      {
        id: 'PRODUCT_MAIN_ALPHABET',
        value: getValues('searchFilters.productMainAlphabet').trim()
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
    Order: sorting,
    Start: pagination.pageIndex,
    Limit: pagination.pageSize
  }

  const { isRefetching, isLoading, data, isError, isFetching, refetch } = useSearch(paramForSearch, isEnableFetching)

  useEffect(() => {
    if (isFetching === false) {
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

                column.setFilterValue(value)
              }}
            />
          )
        }
      },

      {
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        header: 'PRODUCT CATEGORY NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_MAIN_CODE',
        header: 'PRODUCT MAIN CODE',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'PRODUCT MAIN NAME',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'PRODUCT_MAIN_ALPHABET',
        header: 'PRODUCT MAIN ALPHABET',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'ACCOUNT_DEPARTMENT_CODE',
        header: 'ACCOUNT DEPARTMENT CODE',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'IS_BOI',
        header: 'BOI',
        Cell: ({ cell }) => {
          const value = cell.getValue()

          return (
            <>
              {cell.getValue() === 1 || cell.getValue() === 0 ? (
                <Chip
                  variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
                  size='small'
                  label={value === 1 ? 'Yes' : value === 0 ? 'No' : null}
                  color='default'
                />
              ) : null}
            </>
          )
        },
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      {
        accessorKey: 'BOI_PROJECT_CODE',
        header: 'BOI PROJECT CODE',

        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
        filterFn: 'contains'
      },
      // {
      //   accessorKey: 'LOC',
      //   header: 'LOC',
      //   accessorFn: (row: any) =>
      //     (row.LOC ?? []).map((x: any) => `${x.LOC_CODE ?? ''} ${x.LOC_NAME ?? ''}`.trim()).join(', '),
      //   Cell: ({ row }) => {
      //     const locs = row.original.LOC ?? []
      //     return (
      //       <Stack direction='row' flexWrap='wrap' gap={0.5}>
      //         {locs.map((l: any) => (
      //           <Chip
      //             key={l.LOC_ID}
      //             label={`${l.LOC_CODE ?? ''} ${l.LOC_NAME ?? ''}`.trim()}
      //             size='small'
      //             variant='outlined'
      //           />
      //         ))}
      //       </Stack>
      //     )
      //   },
      //   filterVariant: 'text',
      //   filterFn: (row, _columnId, filterValue) => {
      //     const v = String(filterValue ?? '').toLowerCase()
      //     const locs = row.original.LOC ?? []
      //     return locs.some((l: any) =>
      //       [l.LOC_CODE, l.LOC_NAME].some(t =>
      //         String(t ?? '')
      //           .toLowerCase()
      //           .includes(v)
      //       )
      //     )
      //   }
      // },
      // {
      //   accessorKey: 'LOC',
      //   header: 'LOC',

      //   filterVariant: 'text',
      //   columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //   filterFn: 'contains'
      // },
      // {
      //   accessorKey: 'POD',
      //   header: 'POD',

      //   filterVariant: 'text',
      //   columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
      //   filterFn: 'contains'
      // },
      // {
      //   accessorKey: 'PD',
      //   header: 'PD',

      //   filterVariant: 'text',
      //   columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals'],
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
        filterVariant: 'text',
        columnFilterModeOptions: ['endsWith', 'startsWith', 'contains', 'equals', 'notEquals']
      }
    ],
    [settings.mode]
  )

  const isFirstRender = useRef(true)

  // useUpdateEffect(() => {
  //   setValue('tableData', columns)
  // }, [isFetching])

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

  const checkPermission = useCheckPermission()

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
            </>
          }
        />

        {openModalView ? (
          <ProductMainModal
            openModal={openModalView}
            setOpenModal={setOpenModalView}
            mode='View'
            rowSelected={rowSelected}
          />
        ) : null}

        {openModalAdd ? <ProductMainModal openModal={openModalAdd} setOpenModal={setOpenModalAdd} mode='Add' /> : null}

        {openModalEdit ? (
          <ProductMainModal
            openModal={openModalEdit}
            setOpenModal={setOpenModalEdit}
            rowSelected={rowSelected}
            mode='Edit'
          />
        ) : null}

        {openModalDelete ? (
          <ProductMainDeleteModal
            openModalDelete={openModalDelete}
            setOpenModalDelete={setOpenModalDelete}
            rowSelected={rowSelected}
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
            onColumnOrderChange={setColumnOrder}
            rowCount={data?.data?.TotalCountOnDb ?? 0}
            state={{
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
                isNeedEditDelete={true}
                isProductMain={true}
                // isNeedEditDelete={false}
                MENU_ID={MENU_ID}
              />
            )}
            refetch={refetch}
          />
        </LocalizationProvider>
      </Card>
    </>
  )
}

export default ProductMainTableData
