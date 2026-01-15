// React Imports
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import { Box, Button, Card, CardContent, Grid, Tooltip, Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  type MRT_Row,
  type MRT_RowSelectionState
} from 'material-react-table'

// types Imports

// Component Imports
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import {
  fetchProductTypeByLikeProductTypeNameAndInuse,
  fetchProductTypeForSctByLikeProductTypeCodeAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'

import { PREFIX_QUERY_KEY, useSearchByProductGroup } from '@/_workspace/react-query/hooks/useProductTypeData'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import { fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'
import { fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import { FormDataPage } from './dataValidation'
import { validationSchemaPage } from './dataValidation'
import { zodResolver } from '@hookform/resolvers/zod'

interface Props {
  handleNext: () => void
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  dataProductTypeSelected: ProductTypeI[]
  setDataProductTypeSelected: Dispatch<SetStateAction<ProductTypeI[]>>
}

interface ParamApiSearchSctI {
  PRODUCT_CATEGORY_ID?: number | ''
  PRODUCT_MAIN_ID?: number | ''
  PRODUCT_SUB_ID?: number | ''
  PRODUCT_TYPE_CODE?: string | ''
  PRODUCT_TYPE_NAME?: string | ''
  ITEM_CATEGORY_ID?: number | ''
  CUSTOMER_INVOICE_TO_ID?: number | ''
  Start: number
  Limit: number
}

const getUrlParamSearch = ({
  PRODUCT_CATEGORY_ID = '',
  PRODUCT_MAIN_ID = '',
  PRODUCT_SUB_ID = '',
  PRODUCT_TYPE_CODE = '',
  PRODUCT_TYPE_NAME = '',
  ITEM_CATEGORY_ID = '',
  CUSTOMER_INVOICE_TO_ID = ''
}: ParamApiSearchSctI): object => {
  const params = {
    PRODUCT_CATEGORY_ID: PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: PRODUCT_MAIN_ID || '',
    PRODUCT_SUB_ID: PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_CODE: PRODUCT_TYPE_CODE || '',
    PRODUCT_TYPE_NAME: PRODUCT_TYPE_NAME || '',
    ITEM_CATEGORY_ID: ITEM_CATEGORY_ID || '',
    CUSTOMER_INVOICE_TO_ID: CUSTOMER_INVOICE_TO_ID || '',
    Start: 0,
    Limit: 10
  }

  //console.log(params)
  return params
}

const MultipleCreateSearch = ({ setIsEnableFetching, dataProductTypeSelected, setDataProductTypeSelected }: Props) => {
  const [isFetchData, setIsFetchData] = useState(false)
  const [dataProductType, setDataProductType] = useState<ProductTypeI[]>([])
  const [draggingRow] = useState<MRT_Row<ProductTypeI> | null>(null)
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  // const [isEnableFetching, setIsEnableFetching] = useState(false)
  const { setValue, getValues, control, handleSubmit, watch } = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    shouldFocusError: true
  })

  const paramForSearch: ParamApiSearchSctI = {
    PRODUCT_CATEGORY_ID: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID || '',
    PRODUCT_SUB_ID: getValues('searchFilters.productSub')?.PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_CODE: getValues('searchFilters.productType')?.PRODUCT_TYPE_CODE || '',
    PRODUCT_TYPE_NAME: getValues('searchFilters.productType')?.PRODUCT_TYPE_NAME || '',
    ITEM_CATEGORY_ID: getValues('searchFilters.ItemCategory')?.ITEM_CATEGORY_ID || '',
    CUSTOMER_INVOICE_TO_ID: getValues('searchFilters.customerInvoiceTo')?.CUSTOMER_INVOICE_TO_ID || '',
    Start: 0,
    Limit: 10

    //Order: querySortBy.toString().replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE')
  }

  const { data: dataFormSearch, isFetching } = useSearchByProductGroup(getUrlParamSearch(paramForSearch), isFetchData)

  useEffect(() => {
    if (isFetching === false && isFetchData) {
      setDataProductType(dataFormSearch?.data?.ResultOnDb || [])
      setIsFetchData(false)
    }
  }, [isFetching])

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsFetchData(true)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onError: SubmitErrorHandler<FormDataPage> = data => {
    console.log(data)
  }

  const columns = useMemo<MRT_ColumnDef<ProductTypeI>[]>(
    () => [
      {
        accessorKey: 'PRODUCT_TYPE_CODE',
        header: 'PRODUCT TYPE CODE'
      },
      {
        accessorKey: 'PRODUCT_TYPE_NAME',
        header: 'PRODUCT TYPE NAME'
      },
      {
        accessorKey: 'PRODUCT_SUB_NAME',
        header: 'PRODUCT SUB'
      },
      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'PRODUCT MAIN'
      },
      {
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        header: 'PRODUCT CATEGORY'
      }
    ],
    []
  )

  const commonTableProps: Partial<MRT_TableOptions<ProductTypeI>> & {
    columns: MRT_ColumnDef<ProductTypeI>[]
  } = {
    columns,
    muiTableContainerProps: {
      sx: {
        maxHeight: '400px',
        minHeight: '400px',
        overflow: 'scroll'
      }
    },

    // initialState: {
    //   columnOrder: [
    //     'mrt-row-selection',
    //     'PRODUCT_TYPE_CODE',
    //     'PRODUCT_TYPE_NAME',
    //     'PRODUCT_SUB_NAME',
    //     'PRODUCT_MAIN_NAME',
    //     'PRODUCT_CATEGORY_NAME'
    //   ]
    // },
    //onDraggingRowChange: setDraggingRow,
    state: { draggingRow, density: 'compact', rowSelection }
  }

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<ProductTypeI>) => {
    setDataProductTypeSelected(dataProductTypeSelected =>
      dataProductTypeSelected.filter(d => d.PRODUCT_TYPE_CODE !== row.original.PRODUCT_TYPE_CODE)
    )

    setDataProductType(dataProductType => [row.original, ...dataProductType])
  }

  const tableProductType = useMaterialReactTable({
    ...commonTableProps,
    enableRowDragging: false,
    enableRowActions: false,
    enableEditing: false,
    enableRowOrdering: false,
    enableSorting: true,
    enablePagination: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnFilterModes: false,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enableGlobalFilterModes: false,
    enableHiding: false,
    enableColumnActions: false,
    enableRowSelection: true,
    data: dataProductType,
    getRowId: originalRow => `table-1_${originalRow.PRODUCT_TYPE_CODE}`,
    onRowSelectionChange: setRowSelection,
    muiRowDragHandleProps: {
      onDragEnd: () => {
        if (hoveredTable === 'table-2') {
          setDataProductTypeSelected(dataProductTypeSelected => [...dataProductTypeSelected, draggingRow!.original])
          setDataProductType(dataProductType => dataProductType.filter(d => d !== draggingRow!.original))
        }

        setHoveredTable(null)
      }
    },
    muiTableBodyCellProps: row => ({
      onDoubleClick: () => {
        if (row?.row?.original !== undefined) {
          setDataProductTypeSelected(dataProductTypeSelected => [...dataProductTypeSelected, row?.row?.original])
          setDataProductType(dataProductType => dataProductType.filter(d => d !== row?.row?.original))
        }
      }
    }),
    muiTablePaperProps: {
      onDragEnter: () => setHoveredTable('table-1'),
      sx: {
        outline: hoveredTable === 'table-1' ? '2px dashed pink' : undefined
      }
    },
    muiTableContainerProps: {
      sx: {
        flex: 1,
        width: '100%',
        minHeight: '60vh',
        maxHeight: '60vh'
      }
    },
    muiTableBodyRowProps: {
      sx: {
        overflow: 'none',
        position: 'static'
      }
    },
    muiTableHeadProps: {
      sx: {
        position: 'sticky',
        top: '0',
        zIndex: '100000'
      }
    },
    positionToolbarAlertBanner: 'none',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'ACTIONS',
        size: 70,
        grow: false,
        muiTableHeadCellProps: {
          align: 'center'
        }
      }
    },
    renderTopToolbarCustomActions: () => (
      <Typography color='primary.main' component='span' variant='h5'>
        Product Type List
      </Typography>
    ),
    renderBottomToolbar: () => (
      <>
        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[18px] gap-2'>
          <Typography>Total {dataProductType?.length} entries</Typography>
        </div>
      </>
    )
  })

  const tableProductTypeSelected = useMaterialReactTable({
    ...commonTableProps,
    enableRowActions: true,
    enableEditing: false,
    enableRowOrdering: false,
    enableSorting: true,
    enablePagination: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnFilterModes: false,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enableGlobalFilterModes: false,
    enableHiding: false,
    enableColumnActions: false,
    enableRowDragging: false,
    enableRowSelection: false,
    data: dataProductTypeSelected,
    state: {
      density: 'compact',
      pagination: {
        pageIndex: 0,
        pageSize: 5000000
      }
    },
    muiTableContainerProps: {
      sx: {
        flex: 1,
        width: '100%',
        minHeight: '60vh',
        maxHeight: '60vh'
      }
    },
    getRowId: originalRow => `table-2-${originalRow.PRODUCT_TYPE_CODE}`,
    muiRowDragHandleProps: {
      onDragEnd: () => {
        if (hoveredTable === 'table-1') {
          setDataProductType(setDataProductType => [...setDataProductType, draggingRow!.original])
          setDataProductTypeSelected(setDataProductTypeSelected =>
            setDataProductTypeSelected.filter(d => d !== draggingRow!.original)
          )
        }

        setHoveredTable(null)
      }
    },
    muiTablePaperProps: {
      onDragEnter: () => setHoveredTable('table-2'),
      sx: {
        outline: hoveredTable === 'table-2' ? '2px dashed pink' : undefined
      }
    },
    positionToolbarAlertBanner: 'none',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'ACTIONS',
        size: 70,
        grow: false,
        muiTableHeadCellProps: {
          align: 'center'
        }
      }
    },
    muiTableBodyRowProps: {
      sx: {
        overflow: 'none',
        position: 'static'
      }
    },
    muiTableHeadProps: {
      sx: {
        position: 'sticky',
        top: '0',
        zIndex: '100000'
      }
    },
    renderTopToolbarCustomActions: () => (
      <Typography color='primary.main' component='span' variant='h5'>
        Selected Product Types
      </Typography>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title='Delete'>
          <IconButton color='error' onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderBottomToolbar: () => (
      <>
        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography>Total {dataProductTypeSelected?.length} entries</Typography>
          <div className='flex justify-end gap-2'>
            <Button
              sx={{}}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this data?')) {
                  setDataProductTypeSelected([])
                }
              }}
              color='warning'
              variant='outlined'
            >
              Clear all
            </Button>
          </div>
        </div>
      </>
    )
  })

  const handleCheckedProductTypeSelectList = () => {
    const productTypeSelected = Object.keys(rowSelection).map(item => {
      return item.split('_')[1]
    })

    setDataProductTypeSelected(prev => {
      let result = prev

      const productTypeSelectedDetails = dataProductType.filter(d => productTypeSelected.includes(d.PRODUCT_TYPE_CODE))

      productTypeSelectedDetails.forEach(item => {
        result = result.filter(d => d.PRODUCT_TYPE_CODE !== item.PRODUCT_TYPE_CODE)
      })

      return [...result, ...productTypeSelectedDetails]
    })

    setDataProductType(prev => {
      return prev.filter(d => !productTypeSelected.includes(d.PRODUCT_TYPE_CODE))
    })
  }

  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card
            style={{ overflow: 'visible', zIndex: 4, border: '1px solid var(--mui-palette-customColors-inputBorder)' }}
          >
            <CardContent>
              <Grid container spacing={4}>
                <Grid container item xs={12} spacing={4}>
                  <Grid item xs={12} sm={4} lg={3}>
                    <Controller
                      name='searchFilters.productCategory'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <AsyncSelectCustom
                          label='Product Category Name'
                          inputId='PRODUCT_CATEGORY'
                          isClearable
                          cacheOptions
                          defaultOptions
                          onChange={value => {
                            onChange(value)

                            setValue('searchFilters.productMain', null)
                            setValue('searchFilters.productSub', null)
                            setValue('searchFilters.productType', null)
                          }}
                          loadOptions={inputValue => {
                            return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                          }}
                          getOptionLabel={data => data.PRODUCT_CATEGORY_NAME.toString()}
                          getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
                          classNamePrefix='select'
                          placeholder='Select ...'
                          {...fieldProps}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} lg={3}>
                    <Controller
                      name='searchFilters.productMain'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <AsyncSelectCustom
                          key={watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID}
                          label='Product Main Name'
                          inputId='PRODUCT_MAIN'
                          {...fieldProps}
                          isClearable
                          cacheOptions
                          defaultOptions
                          onChange={value => {
                            onChange(value)

                            setValue('searchFilters.productSub', null)
                            setValue('searchFilters.productType', null)
                          }}
                          loadOptions={inputValue => {
                            return getValues('searchFilters.productCategory.PRODUCT_CATEGORY_ID')
                              ? fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                                  inputValue,
                                  1,
                                  getValues('searchFilters.productCategory.PRODUCT_CATEGORY_ID')
                                )
                              : fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                          }}
                          getOptionLabel={data => data.PRODUCT_MAIN_NAME.toString()}
                          getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                          classNamePrefix='select'
                          placeholder='Select ...'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} lg={3}>
                    <Controller
                      name='searchFilters.productSub'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <AsyncSelectCustom
                          label='Product Sub Name'
                          inputId='PRODUCT_SUB'
                          {...fieldProps}
                          isClearable
                          cacheOptions
                          defaultOptions
                          onChange={value => {
                            onChange(value)
                            setValue('searchFilters.productType', null)
                          }}
                          key={
                            watch('searchFilters.productMain.PRODUCT_MAIN_ID') ||
                            watch('searchFilters.productCategory.PRODUCT_CATEGORY_ID')
                          }
                          loadOptions={inputValue => {
                            return getValues('searchFilters.productMain.PRODUCT_MAIN_ID')
                              ? fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                                  inputValue,
                                  getValues('searchFilters.productMain.PRODUCT_MAIN_ID'),
                                  1
                                )
                              : getValues('searchFilters.productCategory.PRODUCT_CATEGORY_ID')
                                ? fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
                                    inputValue,
                                    getValues('searchFilters.productCategory.PRODUCT_CATEGORY_ID'),
                                    1
                                  )
                                : fetchProductSubByLikeProductSubNameAndInuse(inputValue, 1)
                          }}
                          getOptionLabel={data => data.PRODUCT_SUB_NAME.toString()}
                          getOptionValue={data => data.PRODUCT_SUB_ID.toString()}
                          classNamePrefix='select'
                          placeholder='Select ...'
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productType'
                    control={control}
                    key={`${watch('searchFilters.productSub.PRODUCT_SUB_ID')}_
                          ${watch('searchFilters.productMain.PRODUCT_MAIN_ID')}_
                          ${watch('searchFilters.productCategory.PRODUCT_CATEGORY_ID')}`}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='Product Type Code'
                        inputId='PRODUCT_TYPE'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        key={`${watch('searchFilters.productSub.PRODUCT_SUB_ID')}_
                          ${watch('searchFilters.productMain.PRODUCT_MAIN_ID')}_
                          ${watch('searchFilters.productCategory.PRODUCT_CATEGORY_ID')}`}
                        loadOptions={inputValue =>
                          fetchProductTypeForSctByLikeProductTypeCodeAndInuse(inputValue ?? '')
                        }
                        getOptionLabel={data => data.PRODUCT_TYPE_CODE.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={8} lg={6}>
                  <Controller
                    name='searchFilters.productType'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='Product Type Name'
                        inputId='PRODUCT_TYPE'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        key={`${watch('searchFilters.productSub.PRODUCT_SUB_ID')}_
                          ${watch('searchFilters.productMain.PRODUCT_MAIN_ID')}_
                          ${watch('searchFilters.productCategory.PRODUCT_CATEGORY_ID')}`}
                        loadOptions={inputValue =>
                          fetchProductTypeByLikeProductTypeNameAndInuse({
                            PRODUCT_TYPE_NAME: inputValue,
                            PRODUCT_TYPE_CODE: getValues('searchFilters.productType.PRODUCT_TYPE_CODE') || '',
                            PRODUCT_CATEGORY_ID: getValues('searchFilters.productCategory.PRODUCT_CATEGORY_ID') || '',
                            PRODUCT_MAIN_ID: getValues('searchFilters.productMain.PRODUCT_MAIN_ID') || '',
                            PRODUCT_SUB_ID: getValues('searchFilters.productSub.PRODUCT_SUB_ID') || '',
                            INUSE: 1
                          })
                        }
                        getOptionLabel={data => data.PRODUCT_TYPE_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select ...'
                      />
                    )}
                  />
                </Grid>
                <Grid container item xs={12} spacing={4}>
                  <Grid item xs={12} sm={4} lg={3}>
                    <Controller
                      name='searchFilters.ItemCategory'
                      control={control}
                      render={({ field: { ...fieldProps } }) => (
                        <AsyncSelectCustom
                          {...fieldProps}
                          label='Item Category'
                          isClearable
                          cacheOptions
                          defaultOptions
                          loadOptions={inputValue => {
                            return fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse({
                              itemCategoryName: inputValue,
                              inuse: 1
                            })
                          }}
                          getOptionLabel={data => data?.ITEM_CATEGORY_NAME.toString()}
                          getOptionValue={data => data.ITEM_CATEGORY_ID.toString()}
                          classNamePrefix='select'
                          placeholder='Select ...'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} lg={6}>
                    <Controller
                      name='searchFilters.customerInvoiceTo'
                      control={control}
                      render={({ field: { ...fieldProps } }) => (
                        <AsyncSelectCustom
                          label='Customer Invoice To Name'
                          inputId='CUSTOMER_INVOICE_TO'
                          {...fieldProps}
                          isClearable
                          cacheOptions
                          defaultOptions
                          loadOptions={inputValue => {
                            return fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse(inputValue, 1)
                          }}
                          getOptionLabel={data => data.CUSTOMER_INVOICE_TO_NAME.toString()}
                          getOptionValue={data => data.CUSTOMER_INVOICE_TO_ID.toString()}
                          classNamePrefix='select'
                          placeholder='Select ...'
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} className='flex gap-2'>
                  <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' type='button'>
                    Search
                  </Button>
                  <Button
                    variant='tonal'
                    color='secondary'
                    type='reset'
                    onClick={() => {
                      setValue('searchFilters.productType', null)
                      setValue('searchFilters.productCategory', null)
                      setValue('searchFilters.productMain', null)
                      setValue('searchFilters.productSub', null)
                      setValue('searchFilters.ItemCategory', null)
                      setValue('searchFilters.customerInvoiceTo', null)
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card
            style={{ overflow: 'visible', zIndex: 4, border: '1px solid var(--mui-palette-customColors-inputBorder)' }}
          >
            <Box
              sx={{
                p: 4,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
                gap: 2,
                alignItems: 'stretch',
                columnGap: 3
              }}
            >
              <Box sx={{ display: 'flex', minWidth: 0 }}>
                <MaterialReactTable table={tableProductType} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 1 }}>
                <Button
                  color='primary'
                  variant='tonal'
                  size='large'
                  onClick={handleCheckedProductTypeSelectList}
                  disabled={dataProductType.length === 0}
                  aria-label='move selected product type to selectList'
                >
                  <i className='tabler-chevron-right text-[30px]' />
                </Button>
              </Box>
              <Box sx={{ display: 'flex', minWidth: 0 }}>
                <MaterialReactTable table={tableProductTypeSelected} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default MultipleCreateSearch
