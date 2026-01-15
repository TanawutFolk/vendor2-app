// React Imports
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useEffect, useMemo, useState } from 'react'

// MUI Imports
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  SlideProps,
  Tooltip,
  Typography
} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { useQueryClient } from '@tanstack/react-query'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_RowSelectionState,
  type MRT_TableOptions
} from 'material-react-table'

// types Imports
import type { FormData } from '../index'

// Component Imports
import type { ProductCategoryOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import type { ProductMainOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import type { ProductSubOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import type { ProductTypeOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import { fetchProductTypeByLikeProductTypeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

import { PREFIX_QUERY_KEY, useSearchByProductGroup } from '@/_workspace/react-query/hooks/useProductTypeData'
import { useCreateYieldRateExport } from '@/_workspace/react-query/hooks/useYieldRateData'
import { fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'
import { fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import ConfirmModal from '@/components/ConfirmModal'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import type { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  openExportModal: boolean
  setOpenModalExport: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  dataProductTypeSelected: ProductTypeI[]
  setDataProductTypeSelected: Dispatch<SetStateAction<ProductTypeI[]>>
}

interface ParamApiSearchSctI extends ParamApiSearchResultTableI {
  PRODUCT_CATEGORY_ID?: number | ''
  PRODUCT_MAIN_ID?: number | ''
  PRODUCT_SUB_ID?: number | ''
  PRODUCT_TYPE_CODE?: string | ''
  PRODUCT_TYPE_NAME?: string | ''
  ITEM_CATEGORY_ID?: number | ''
  CUSTOMER_INVOICE_TO_ID?: number | ''
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

const ExportPage = ({
  openExportModal,
  setOpenModalExport,
  setIsEnableFetching,
  dataProductTypeSelected,
  setDataProductTypeSelected
}: Props) => {
  const [isFetchData, setIsFetchData] = useState(false)
  const [dataProductType, setDataProductType] = useState<ProductTypeI[]>([])
  const [draggingRow, setDraggingRow] = useState<MRT_Row<ProductTypeI> | null>(null)
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  // const [isEnableFetching, setIsEnableFetching] = useState(false)
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const paramForSearch: any = {
    PRODUCT_CATEGORY_ID: watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
    PRODUCT_SUB_ID: watch('PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_CODE: watch('PRODUCT_TYPE')?.PRODUCT_TYPE_CODE || '',
    PRODUCT_TYPE_NAME: watch('PRODUCT_TYPE')?.PRODUCT_TYPE_NAME || '',
    ITEM_CATEGORY_ID: watch('ITEM_CATEGORY')?.ITEM_CATEGORY_ID || '',
    CUSTOMER_INVOICE_TO_ID: watch('CUSTOMER_INVOICE_TO')?.CUSTOMER_INVOICE_TO_ID || ''

    //Order: querySortBy.toString().replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE')
  }

  const {
    isRefetching,
    isLoading,
    data: dataFormSearch,
    isError,
    refetch,
    isFetching,
    isSuccess
  } = useSearchByProductGroup(getUrlParamSearch(paramForSearch), isFetchData)

  useEffect(() => {
    if (isFetching == false) {
      //console.log(dataFormSearch?.data?.ResultOnDb || [])
      setDataProductType(dataFormSearch?.data?.ResultOnDb || [])
      setIsFetchData(false)
    }
  }, [isFetching])

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onSubmit: SubmitHandler<FormData> = () => {
    setIsFetchData(true)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onError: SubmitErrorHandler<FormData> = data => {
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

    //end
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

    initialState: {
      columnOrder: [
        'mrt-row-actions',
        'PRODUCT_TYPE_CODE',
        'PRODUCT_TYPE_NAME',
        'PRODUCT_SUB_NAME',
        'PRODUCT_MAIN_NAME',
        'PRODUCT_CATEGORY_NAME'
      ]
    },
    onDraggingRowChange: setDraggingRow,
    state: { draggingRow, density: 'compact', rowSelection }
  }

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<ProductTypeI>) => {
    setDataProductTypeSelected(dataProductTypeSelected =>
      dataProductTypeSelected.filter(d => d.PRODUCT_TYPE_CODE !== row.original.PRODUCT_TYPE_CODE)
    )
    setDataProductType(dataProductType => [row.original, ...dataProductType])
  }

  const openDeleteClearAllConfirmModal = () => {
    setDataProductType(dataProductType => [...dataProductTypeSelected, ...dataProductType])
    setDataProductTypeSelected([])
    // setDataProductType([])
  }

  const handleClose = () => {
    onResetFormSearch()
    setDataProductTypeSelected([])
    setOpenModalExport(false)
    // reset()
  }

  const tableProductType = useMaterialReactTable({
    ...commonTableProps,
    enableRowDragging: true,
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
    enableRowSelection: true,

    data: dataProductType,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Actions',
        size: 70,
        grow: false,
        muiTableHeadCellProps: {
          align: 'center'
        }
      }
      // 'mrt-row-select': {
      //   enableColumnActions: true,
      //   enableHiding: true,
      //   // size: 100,
      //   muiTableHeadCellProps: {
      //     align: 'center'
      //   },
      //   muiTableBodyCellProps: {
      //     align: 'center'
      //   }
      // }
    },
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
      onDoubleClick: event => {
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
      sx: { minWidth: '650px', maxWidth: '660px', maxHeight: '420px', minHeight: '420px', overflow: 'scroll' }
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
    // displayColumnDefOptions: {
    //   'mrt-row-actions': {
    //     header: 'ACTIONS',
    //     size: 70,
    //     grow: false,
    //     muiTableHeadCellProps: {
    //       align: 'center'
    //     }
    //   }
    // },
    muiTableHeadCellProps: {
      //no useTheme hook needed, just use the `sx` prop with the theme callback
      // sx: theme => ({
      //   color: theme.palette.primary.main
      // })
    },
    renderTopToolbarCustomActions: () => (
      <Typography color='primary.main' component='span' variant='h5'>
        List Product Type
      </Typography>
    ),
    renderBottomToolbar: () => (
      <>
        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography>
            Total {dataProductType?.length} entries | Selected {tableProductType.getSelectedRowModel().rows.length ?? 0}{' '}
            entries
          </Typography>
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

    // defaultColumn: {
    //   size: 100
    // },
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
    muiTableHeadCellProps: {
      //no useTheme hook needed, just use the `sx` prop with the theme callback
      // sx: theme => ({
      //   color: theme.palette.primary.main
      // })
    },
    positionToolbarAlertBanner: 'none',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Actions',
        size: 70,
        grow: false,
        muiTableHeadCellProps: {
          align: 'center'
        }
      }
    },
    muiTableContainerProps: {
      sx: { minWidth: '650px', maxWidth: '660px', maxHeight: '420px', minHeight: '420px', overflow: 'scroll' }
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
        Product Type Selected
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
                  openDeleteClearAllConfirmModal()
                }
              }}
              color='secondary'
              variant='tonal'
            >
              Clear all
            </Button>
          </div>
        </div>
      </>
    )
  })

  const onResetFormSearch = () => {
    setValue('PRODUCT_CATEGORY', null)
    setValue('PRODUCT_MAIN', null)
    setValue('PRODUCT_SUB', null)
    setValue('PRODUCT_TYPE', null)
    setValue('ITEM_CATEGORY', null)
    setValue('CUSTOMER_INVOICE_TO', null)
  }

  const handleCheckedProductTypeSelectList = (): any => {
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

    //setRowSelection({})
  }

  const onMutateSuccess = (data: any) => {
    const message = {
      title: 'Yield Rate And Go Straight Form',
      message: 'ส่งออกข้อมูลสำเร็จ  exported Successfully'
    }
    ToastMessageSuccess(message)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleClose()
  }

  const onMutateError = (err: any) => {
    const message = {
      title: 'Yield Rate And Go Straight Form',
      message: 'ส่งออกข้อมูลไม่สำเร็จ Export failed' + `${err}`
    }

    ToastMessageError(message)
  }

  const { mutate: createExportMutation, isPending: isLoadingExportFile } = useCreateYieldRateExport(
    onMutateSuccess,
    onMutateError
  )

  const handleExport = () => {
    const listData: any = []

    if (dataProductTypeSelected.length === 0) {
      ToastMessageError({
        title: 'Sct Form',
        message: 'Please select product type first'
      })
      return
    }

    for (let i = 0; i < dataProductTypeSelected.length; i++) {
      const element = dataProductTypeSelected[i]

      const data = {
        PRODUCT_TYPE_ID: element?.PRODUCT_TYPE_ID || ''
      }

      listData.push(data)
    }

    const dataItem = {
      LIST_ID: listData
    }

    //  console.log('EXPORT', dataItem)

    createExportMutation(dataItem)
  }

  return (
    <>
      <Dialog
        maxWidth='xl'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openExportModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Export Form |
          </Typography>
          <Typography variant='h5' component='span' color='primary'>
            {' '}
            Yield Rate & Go Straight Rate
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card
                style={{
                  overflow: 'visible',
                  zIndex: 4,
                  border: '1px solid var(--mui-palette-customColors-inputBorder)'
                }}
              >
                <CardContent>
                  <Grid
                    container
                    spacing={4}
                    // sx={{
                    //   paddingBottom: '4px'
                    // }}
                  >
                    <Grid container item spacing={4}>
                      <Grid item xs={12} sm={4} lg={3}>
                        <Controller
                          name='PRODUCT_CATEGORY'
                          control={control}
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <AsyncSelectCustom<ProductCategoryOption>
                              label='Product Category'
                              inputId='PRODUCT_CATEGORY'
                              {...fieldProps}
                              isClearable
                              cacheOptions
                              defaultOptions
                              value={getValues('PRODUCT_CATEGORY')}
                              onChange={value => {
                                onChange(value)

                                setValue('PRODUCT_MAIN', null)
                                setValue('PRODUCT_SUB', null)
                                setValue('PRODUCT_TYPE', null)
                              }}
                              loadOptions={inputValue => {
                                return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                              }}
                              getOptionLabel={data => data.PRODUCT_CATEGORY_NAME.toString()}
                              getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
                              classNamePrefix='select'
                              placeholder='Select ...'
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} lg={3}>
                        <Controller
                          name='PRODUCT_MAIN'
                          control={control}
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <AsyncSelectCustom<ProductMainOption>
                              label='Product Main'
                              inputId='PRODUCT_MAIN'
                              {...fieldProps}
                              isClearable
                              cacheOptions
                              defaultOptions
                              value={getValues('PRODUCT_MAIN')}
                              onChange={value => {
                                onChange(value)

                                setValue('PRODUCT_SUB', null)
                                setValue('PRODUCT_TYPE', null)
                              }}
                              key={watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}
                              loadOptions={inputValue => {
                                return getValues('PRODUCT_CATEGORY')
                                  ? fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                                      inputValue,
                                      1,
                                      getValues('PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID
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
                          name='PRODUCT_SUB'
                          control={control}
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <AsyncSelectCustom<ProductSubOption>
                              label='Product Sub'
                              inputId='PRODUCT_SUB'
                              {...fieldProps}
                              isClearable
                              cacheOptions
                              defaultOptions
                              value={getValues('PRODUCT_SUB')}
                              onChange={value => {
                                onChange(value)

                                setValue('PRODUCT_TYPE', null)
                              }}
                              key={
                                watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                              }
                              loadOptions={inputValue => {
                                return getValues('PRODUCT_MAIN')
                                  ? fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                                      inputValue,
                                      getValues('PRODUCT_MAIN').PRODUCT_MAIN_ID,
                                      1
                                    )
                                  : getValues('PRODUCT_CATEGORY')
                                    ? fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
                                        inputValue,
                                        getValues('PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID,
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
                    <Grid container item spacing={4}>
                      <Grid item xs={12} sm={4} lg={3}>
                        <Controller
                          name='PRODUCT_TYPE'
                          control={control}
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <AsyncSelectCustom<ProductTypeOption>
                              label='Product Type Code'
                              inputId='PRODUCT_TYPE'
                              {...fieldProps}
                              isClearable
                              cacheOptions
                              defaultOptions
                              value={getValues('PRODUCT_TYPE')}
                              onChange={value => {
                                onChange(value)
                              }}
                              key={
                                watch('PRODUCT_SUB')?.PRODUCT_SUB_ID ||
                                watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID ||
                                watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                              }
                              loadOptions={inputValue =>
                                fetchProductTypeByLikeProductTypeNameAndInuse({
                                  PRODUCT_TYPE_NAME: '',
                                  PRODUCT_TYPE_CODE: inputValue,
                                  PRODUCT_CATEGORY_ID: getValues('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
                                  PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
                                  PRODUCT_SUB_ID: getValues('PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
                                  INUSE: 1
                                })
                              }
                              getOptionLabel={data => data.PRODUCT_TYPE_CODE.toString()}
                              getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                              classNamePrefix='select'
                              placeholder='Select ...'
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <Controller
                          name='PRODUCT_TYPE'
                          control={control}
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <AsyncSelectCustom<ProductTypeOption>
                              label='Product Type Name'
                              inputId='PRODUCT_TYPE'
                              {...fieldProps}
                              isClearable
                              cacheOptions
                              defaultOptions
                              value={getValues('PRODUCT_TYPE')}
                              onChange={value => {
                                onChange(value)
                              }}
                              key={
                                watch('PRODUCT_SUB')?.PRODUCT_SUB_ID ||
                                watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID ||
                                watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID
                              }
                              loadOptions={inputValue =>
                                fetchProductTypeByLikeProductTypeNameAndInuse({
                                  PRODUCT_TYPE_NAME: inputValue,
                                  PRODUCT_TYPE_CODE: '',
                                  PRODUCT_CATEGORY_ID: getValues('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
                                  PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
                                  PRODUCT_SUB_ID: getValues('PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
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
                    </Grid>

                    <Grid item xs={12} sm={4} lg={3}>
                      <Controller
                        name='ITEM_CATEGORY'
                        control={control}
                        render={({ field: { ref, ...fieldProps } }) => (
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
                            getOptionValue={data => data?.ITEM_CATEGORY_ID.toString()}
                            classNamePrefix='select'
                            placeholder='Select ...'
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6}>
                      <Controller
                        name='CUSTOMER_INVOICE_TO'
                        control={control}
                        render={({ field: { ref, ...fieldProps } }) => (
                          <AsyncSelectCustom
                            label='Customer Invoice To'
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

                  <Grid container className='mbs-0' spacing={6}>
                    <Grid item xs={12} className='flex gap-3'>
                      <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' type='button'>
                        Search
                      </Button>
                      <Button variant='tonal' color='secondary' type='reset' onClick={onResetFormSearch}>
                        Clear
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ marginTop: '4px' }}>
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
                    <Grid container direction='column' sx={{ alignItems: 'center' }}>
                      <Button
                        // sx={{ my: 0.5 }}
                        color='primary'
                        variant='tonal'
                        size='large'
                        onClick={handleCheckedProductTypeSelectList}
                        disabled={dataProductType.length === 0}
                        aria-label='move selected product type to selectList'
                      >
                        <i className='tabler-chevron-right text-[30px]' />
                      </Button>
                    </Grid>
                  </Box>
                  <Box sx={{ display: 'flex', minWidth: 0 }}>
                    <MaterialReactTable table={tableProductTypeSelected} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isLoadingExportFile}
            onClick={() => handleSubmit(handleExport, onError)()}
            variant='contained'
            color='success'
          >
            {isLoadingExportFile ? (
              <>
                <CircularProgress sx={{ mr: 2, color: '#fff' }} size={20} />
                <span className='ms-50'>Loading...</span>
              </>
            ) : (
              <>Export Form </>
            )}
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          //onConfirmClick={handleAddDepartment}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default ExportPage
