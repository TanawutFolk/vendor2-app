import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  useMaterialReactTable
} from 'material-react-table'
import { Badge, Box, Button, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import { Controller, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'
import { addFormData, viewFormData } from './StandardPriceModal'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import CustomTextField from '@/components/mui/TextField'
import FilterListIcon from '@mui/icons-material/FilterList'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  fetchItemCodeByLikeItemCodeAndInuseAndNotFGSemiFGSubAs,
  ItemOption,
  ItemOptionForStandardPrice
} from '@/_workspace/react-select/async-promise-load-options/fetchItem'
import { fetchStandardPrice } from '@/_workspace/react-select/async-promise-load-options/fetchStandardPrice'
import {
  CurrencyOption,
  fetchCurrencySymbolByCurrencySymbolAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchCurrency'

import { saveAs } from 'file-saver'
import * as xlsx from 'xlsx'

interface Props {
  mode: 'add' | 'view'
  setIsExcel: Dispatch<SetStateAction<boolean>>
  setIsManual: Dispatch<SetStateAction<boolean>>
  isExcel: boolean
  isManual: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
}

import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PublishIcon from '@mui/icons-material/Publish'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { toast } from 'react-toastify'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useStandardPrice'
import LoadingButton from '@mui/lab/LoadingButton'

const StandardPriceDndAddTableData = ({
  mode,
  setIsExcel,
  setIsManual,
  isExcel,
  isManual,
  setIsEnableFetching,
  setOpenModalAdd
}: Props) => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>({})
  const [file, setFile] = useState<any>(null)

  const { control, watch, getValues, setValue, trigger } = useFormContext<addFormData | viewFormData>()

  const { errors } = useFormState({ control })

  const hiddenFileInput = useRef(null)

  const reader = new FileReader()
  const queryClient = useQueryClient()

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Manufacturing Item Price'
      }

      ToastMessageSuccess(message)

      if (mode === 'add') setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      setLoadingImportDataFile(false)
      setOpenModalAdd(false)
    } else {
      const message = {
        title: 'Add Manufacturing Item Price',
        message: data.data.Message
      }

      ToastMessageError(message)
      setLoadingImportDataFile(false)
    }
  }

  const onMutateError = (err: any) => {
    console.log(err)
    console.log('onMutateError')

    const message = {
      title: 'Add Manufacturing Item Price',
      message: err?.response?.data?.Message ?? 'An error occurred'
    }

    ToastMessageError(message)
    setLoadingImportDataFile(false)
  }

  const mutation = useCreate(onMutateSuccess, onMutateError)

  const [loadingImportDataFile, setLoadingImportDataFile] = useState<boolean>(false)

  useEffect(() => {
    reader.onload = e => {
      try {
        const data = e.target.result

        const workbook = xlsx.read(data, { type: 'array' })

        const itemSheet = workbook.Sheets['Item']
        const currencySheet = workbook.Sheets['Currency']
        const standardPriceSheet = workbook.Sheets['Standard Price']

        const itemJson: ItemOption[] = xlsx.utils.sheet_to_json(itemSheet)
        const currencyJson: CurrencyOption[] = xlsx.utils.sheet_to_json(currencySheet)
        const standardPriceJson: addFormData[] = xlsx.utils.sheet_to_json(standardPriceSheet)

        // standardPriceJson = standardPriceJson
        //   // .filter(item => {
        //   //   if (
        //   //     !item['Item Code'] ||
        //   //     item['Item Internal Full Name'] === 'Please enter Item Code' ||
        //   //     item['Item Internal Full Name'] === 'Item Code Not Found'
        //   //   ) {
        //   //     toast.error('Please check data and try again')
        //   //     return false
        //   //   }

        //   //   return true
        //   // })
        //   .map(item => {
        //     return {
        //       ITEM_ID: itemJson.find(i => {
        //         return i.ITEM_CODE === item['Item Code']
        //       })?.ITEM_ID,
        //       PURCHASE_PRICE: item['Purchase Price'].toString(),
        //       PURCHASE_PRICE_CURRENCY_ID: currencyJson.find(c => {
        //         return c.CURRENCY_SYMBOL === item['Purchase Price Currency']
        //       })?.CURRENCY_ID,
        //       PURCHASE_UNIT_ID: itemJson.find(i => {
        //         return i.ITEM_CODE === item['Item Code']
        //       })?.PURCHASE_UNIT_ID
        //     }
        //   })

        // let data = getValues('DATA')

        // data = data.map((item: addFormData) => {
        //   return {
        //     ITEM_ID: item.ITEM_CODE.ITEM_ID,
        //     PURCHASE_PRICE: item.PURCHASE_PRICE,
        //     PURCHASE_PRICE_CURRENCY_ID: item.PURCHASE_PRICE_CURRENCY.CURRENCY_ID,
        //     PURCHASE_PRICE_UNIT_ID: item.ITEM_CODE.PURCHASE_UNIT_ID
        //   }
        // })

        const dataItem = {
          DATA: standardPriceJson
            .filter(item => {
              if (
                !item['Item Code'] ||
                item['Item Internal Full Name'] === 'Please enter Item Code' ||
                item['Item Internal Full Name'] === 'Item Code Not Found'
              ) {
                // throw new Error('Please check data and try again')
                return false
              }

              return true
            })
            .map(item => {
              return {
                ITEM_ID: itemJson.find(i => {
                  return i.ITEM_CODE === item['Item Code']
                })?.ITEM_ID,
                ITEM_CODE_FOR_SUPPORT_MES: item['Item Code'].toString(),
                PURCHASE_PRICE: item['Purchase Price'].toString(),
                PURCHASE_PRICE_CURRENCY_ID: currencyJson.find(c => {
                  return c.CURRENCY_SYMBOL === item['Purchase Price Currency']
                })?.CURRENCY_ID,
                PURCHASE_PRICE_UNIT_ID: itemJson.find(i => {
                  return i.ITEM_CODE === item['Item Code']
                })?.PURCHASE_UNIT_ID
              }
            }),
          CREATE_BY: getUserData().EMPLOYEE_CODE,
          FISCAL_YEAR: getValues('FISCAL_YEAR').value,
          SCT_PATTERN_ID: getValues('SCT_PATTERN').SCT_PATTERN_ID,
          ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID: 1, // Excel
          ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: 1 // Excel
        }

        mutation.mutate(dataItem)

        // setValue('DATA', standardPriceJson)

        // setFile(null)
        // setIsManual(false)

        // if (standardPriceJson.length > 0) {
        //   setIsExcel(true)
        // } else {
        //   setIsExcel(false)
        // }
      } catch (error) {
        toast.error(error?.message ?? 'Please check data and try again')
        setLoadingImportDataFile(false)
      }
    }

    if (file) {
      setLoadingImportDataFile(true)
      reader.readAsArrayBuffer(file)
    }
  }, [file])

  const handleChangeFile = (e: any) => {
    const fileUploaded = e.target.files[0]

    if (fileUploaded) {
      setFile(fileUploaded)
    }
  }

  const handleUploadFile = () => {
    if (!getValues('FISCAL_YEAR')?.value || !getValues('SCT_PATTERN')?.SCT_PATTERN_ID) {
      toast.error('Please select Fiscal Year and SCT Pattern')
      return
    } else {
      hiddenFileInput?.current?.click()
    }
  }

  const handleAddDataRow: SubmitHandler<addFormData | viewFormData> = () => {
    setValue('DATA', [
      ...getValues('DATA'),
      {
        ITEM_CODE: null,
        PURCHASE_PRICE: '',
        PURCHASE_PRICE_CURRENCY: null,
        PURCHASE_UNIT: ''
      }
    ])

    setIsManual(true)
  }

  const handleDownloadImportFile = async () => {
    const file = await fetchStandardPrice()

    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const filename = `MANUFACTURING-ITEM-PRICE-${year}${month}${day}-${hours}-${minutes}-${seconds}.xlsx`

    saveAs(file, filename)
  }

  const columns = useMemo<MRT_ColumnDef<addFormData>[]>(() => {
    return [
      {
        accessorKey: 'ITEM_CODE_FOR_SUPPORT_MES',
        header: 'Item Code',
        enableColumnFilter: false,
        size: 305,
        Cell: ({ row }) => {
          return (
            <>
              <Controller
                key={row.index}
                name={`DATA[${row.index}].ITEM_CODE`}
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    // onChange={value => {
                    //   onChange(value)

                    //   setValue(`DATA[${row.index}].M_CODE_NAME`, value?.ITEM_INTERNAL_SHORT_NAME ?? '')
                    //   setValue(`DATA[${row.index}].PURCHASE_UNIT`, {
                    //     PURCHASE_UNIT_ID: value?.PURCHASE_UNIT_ID,
                    //     PURCHASE_UNIT: value?.PURCHASE_UNIT
                    //   })

                    //   trigger(`DATA[${row.index}].M_CODE_NAME`)
                    //   trigger(`DATA[${row.index}].PURCHASE_UNIT`)
                    // }}
                    // value={getValues(`DATA[${row.index}].ITEM_CODE`)}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchItemCodeByLikeItemCodeAndInuseAndNotFGSemiFGSubAs(inputValue)
                    }}
                    innerRef={ref}
                    getOptionLabel={data => data.ITEM_CODE_FOR_SUPPORT_MES}
                    getOptionValue={data => data.ITEM_ID}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...((errors?.DATA?.[row.index]?.ITEM_CODE || errors?.DATA?.[row.index]?.ITEM_CODE?.ITEM_ID) && {
                      error: true,
                      helperText:
                        errors?.DATA?.[row.index]?.ITEM_CODE?.message ||
                        errors?.DATA?.[row.index]?.ITEM_CODE?.ITEM_ID?.message
                    })}
                    isDisabled={mode === 'view'}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'PURCHASE_PRICE',
        header: 'Purchase Price',
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <>
              <Controller
                key={row.index}
                name={`DATA[${row.index}].PURCHASE_PRICE`}
                control={control}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    disabled={mode === 'view'}
                    fullWidth
                    autoComplete='off'
                    {...(errors?.DATA?.[row.index]?.PURCHASE_PRICE && {
                      error: true,
                      helperText: errors?.DATA?.[row.index]?.PURCHASE_PRICE.message
                    })}
                  />
                )}
              />
            </>
          )
        },
        size: 200
      },
      {
        accessorKey: 'PURCHASE_PRICE_CURRENCY',
        header: 'Purchase Currency',
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <>
              <Controller
                key={row.index}
                name={`DATA[${row.index}].PURCHASE_PRICE_CURRENCY`}
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    // value={getValues(`DATA[${row.index}].PURCHASE_PRICE_CURRENCY`)}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchCurrencySymbolByCurrencySymbolAndInuse(inputValue)
                    }}
                    innerRef={ref}
                    getOptionLabel={data => data.CURRENCY_SYMBOL}
                    getOptionValue={data => data.CURRENCY_ID}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...((errors?.DATA?.[row.index]?.PURCHASE_PRICE_CURRENCY ||
                      errors?.DATA?.[row.index]?.PURCHASE_PRICE_CURRENCY?.CURRENCY_ID) && {
                      error: true,
                      helperText:
                        errors?.DATA?.[row.index]?.PURCHASE_PRICE_CURRENCY?.message ||
                        errors?.DATA?.[row.index]?.PURCHASE_PRICE_CURRENCY?.CURRENCY_ID?.message
                    })}
                    isDisabled={mode === 'view'}
                  />
                )}
              />
            </>
          )
        },
        size: 250
      },

      {
        accessorKey: 'PURCHASE_UNIT',
        header: 'Purchase Unit Code',
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <>
              <Typography>{watch(`DATA[${row.index}].ITEM_CODE`)?.PURCHASE_UNIT_CODE}</Typography>
            </>
          )
        },
        size: 250
      },
      // Purchase Unit Code	Usage Unit Ratio	Usage Unit Code	Version No.
      {
        accessorKey: 'USAGE_UNIT_RATIO',
        header: 'Usage Unit Ratio',
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <>
              <Typography>{watch(`DATA[${row.index}].ITEM_CODE`)?.USAGE_UNIT_RATIO}</Typography>
            </>
          )
        },
        size: 220
      },
      {
        accessorKey: 'USAGE_UNIT_CODE',
        header: 'Usage Unit Code',
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <>
              <Typography>{watch(`DATA[${row.index}].ITEM_CODE`)?.USAGE_UNIT_CODE}</Typography>
            </>
          )
        },
        size: 250
      },
      {
        accessorKey: 'VERSION_NO',
        header: 'Version No.',
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <>
              <Typography>{watch(`DATA[${row.index}].ITEM_CODE`)?.VERSION_NO}</Typography>
            </>
          )
        },
        size: 200
      },
      {
        accessorKey: 'ITEM_CATEGORY_NAME',
        header: 'ITEM CATEGORY NAME',
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <>
              <Typography>{watch(`DATA[${row.index}].ITEM_CODE`)?.ITEM_CATEGORY_NAME}</Typography>
            </>
          )
        },
        size: 300
      },
      {
        accessorKey: 'ITEM_INTERNAL_FULL_NAME',
        header: 'Item Internal Full Name',
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <>
              <Typography>{watch(`DATA[${row.index}].ITEM_CODE`)?.ITEM_INTERNAL_FULL_NAME}</Typography>
            </>
          )
        },
        size: 350
      },
      {
        accessorKey: 'ITEM_INTERNAL_SHORT_NAME',
        header: 'Item Internal Short Name',
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <>
              <Typography>{watch(`DATA[${row.index}].ITEM_CODE`)?.ITEM_INTERNAL_SHORT_NAME}</Typography>
            </>
          )
        },
        size: 400
      }
    ]
  }, [errors, JSON.stringify(watch('DATA'))])

  // const table = useMaterialReactTable({
  //   autoResetPageIndex: false,
  //   columns,
  //   data: watch('DATA'),
  //   enableEditing: true,
  //   // enableRowOrdering:true,
  //   enableSorting: false,
  //   enablePagination: false,
  //   enableRowNumbers: true,
  //   onColumnFiltersChange: setColumnFilters,
  //   onColumnFilterFnsChange: setColumnFilterFns,
  //   state: {
  //     columnFilters,
  //     columnFilterFns
  //   },
  //   initialState: {
  //     density: 'compact'
  //   },
  //   // muiRowDragHandleProps: ({ table }) => ({
  //   //   onDragEnd: () => {
  //   //     const { draggingRow, hoveredRow } = table.getState()

  //   //     if (hoveredRow && draggingRow) {
  //   //       const data = getValues('DATA')

  //   //       const newData = [...data]
  //   //       newData.splice(draggingRow.index, 1)
  //   //       newData.splice(hoveredRow.index, 0, data.splice(draggingRow.index, 1)[0])

  //   //       setValue('DATA', newData)
  //   //     }
  //   //   }
  //   // }),
  //   muiTableContainerProps: {
  //     sx: {
  //       maxHeight: '65vh',
  //       minHeight: '65vh',
  //       overflow: 'scroll'
  //     }
  //   },
  //   muiTableBodyCellProps: {
  //     sx: {
  //       overflow: 'none',
  //       position: 'static'
  //     }
  //   },
  //   muiTableBodyRowProps: {
  //     sx: {
  //       position: 'static'
  //     }
  //   },
  //   renderRowActions: ({ row, table, cell }) => (
  //     <>
  //       {mode === 'add' && (
  //         <Box sx={{ display: 'flex', gap: '1rem' }}>
  //           <>
  //             <Tooltip title='Delete'>
  //               <IconButton
  //                 color='error'
  //                 onClick={() => {
  //                   if (window.confirm('Are you sure you want to delete this row?')) {
  //                     setValue(
  //                       'DATA',
  //                       getValues('DATA').filter((_data: any, index: number) => {
  //                         return index !== row.index
  //                       })
  //                     )
  //                   }
  //                 }}
  //               >
  //                 <DeleteIcon />
  //               </IconButton>
  //             </Tooltip>
  //           </>
  //         </Box>
  //       )}
  //     </>
  //   ),
  //   renderTopToolbarCustomActions: ({ table }) => (
  //     <>
  //       <div className='flex gap-3'>
  //         {mode === 'add' && (
  //           <>
  //             <Button
  //               className='rounded-3xl'
  //               variant='contained'
  //               startIcon={<i className='tabler-plus' />}
  //               onClick={() => handleAddDataRow()}
  //               disabled={isExcel}
  //             >
  //               Add New
  //             </Button>
  //             <Divider orientation='vertical' flexItem />
  //             {/* <Button
  //               variant='text'
  //               color='success'
  //               startIcon={<i className='tabler-download' />}
  //               onClick={() => handleDownloadImportFile()}
  //               className='ms-3'
  //               disabled={isManual}
  //             >
  //               Download Import File
  //             </Button>
  //             <Button
  //               variant='tonal'
  //               color='success'
  //               startIcon={<i className='tabler-upload' />}
  //               onClick={handleUploadFile}
  //               className='ms-3'
  //               disabled={isManual}
  //             >
  //               Import File
  //             </Button> */}

  //             <Button
  //               className='rounded-3xl'
  //               variant='contained'
  //               startIcon={<PublishIcon />}
  //               onClick={handleUploadFile}
  //               color='success'
  //             >
  //               Import Data
  //             </Button>
  //             <Button
  //               className='rounded-3xl'
  //               variant='contained'
  //               startIcon={<FileDownloadIcon />}
  //               onClick={() => handleDownloadImportFile()}
  //               color='success'
  //             >
  //               Export Form
  //             </Button>

  //             <input type='file' ref={hiddenFileInput} style={{ display: 'none' }} onChange={handleChangeFile} />
  //           </>
  //         )}

  //         {/* <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
  //           <IconButton>
  //             <Badge badgeContent={columnFilters?.length ?? 0} color='primary'>
  //               <FilterListIcon />
  //             </Badge>
  //           </IconButton>
  //         </Tooltip> */}
  //       </div>
  //     </>
  //   ),
  //   renderBottomToolbar: ({ table }) => (
  //     <>
  //       <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
  //         <Typography>Total {watch('DATA')?.length} entries</Typography>

  //         <div className='flex justify-end gap-2'>
  //           <Button
  //             disabled={!!columnFilters?.length}
  //             onClick={() => {
  //               if (window.confirm('Are you sure you want to delete all rows?')) {
  //                 setValue('DATA', [])

  //                 setIsExcel(false)
  //                 setIsManual(false)
  //               }
  //             }}
  //             color='secondary'
  //             variant='tonal'
  //           >
  //             Clear all
  //           </Button>
  //         </div>
  //       </div>
  //     </>
  //   )
  // })

  return (
    <>
      {/* <MaterialReactTable table={table} /> */}

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DxMRTTable
          displayColumnDefOptions={{
            'mrt-row-numbers': {
              // muiTableHeadCellProps: {
              //   align: 'center'
              // },
              muiTableBodyCellProps: {
                align: 'center'
              }
            },
            'mrt-row-actions': {
              // muiTableHeadCellProps: {
              //   align: 'center'
              // },
              muiTableBodyCellProps: {
                align: 'center'
              }
            }
          }}
          autoResetPageIndex={false}
          enableRowNumbers={true}
          isError={false}
          columns={columns}
          data={watch('DATA') ?? []}
          onColumnFiltersChange={setColumnFilters}
          onColumnFilterFnsChange={setColumnFilterFns}
          // onPaginationChange={setPagination}
          // onSortingChange={setSorting}
          // onColumnVisibilityChange={setColumnVisibility}
          // onDensityChange={setDensity}
          // onColumnPinningChange={setColumnPinning}
          // onColumnOrderChange={setColumnOrder}
          rowCount={watch('DATA')?.length ?? 0}
          state={{
            columnFilters,
            // isLoading,
            // pagination,
            // showAlertBanner: isError,
            // showProgressBars: isRefetching,
            // sorting,
            // density,
            // columnVisibility,
            // columnPinning,
            // columnOrder,
            columnFilterFns
          }}
          initialState={{
            density: 'compact'
          }}
          renderRowActions={({ row }) =>
            mode === 'add' && (
              <Box sx={{ display: 'flex', gap: '1rem' }}>
                <>
                  <Tooltip title='Delete'>
                    <IconButton
                      color='error'
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this row?')) {
                          setValue(
                            'DATA',
                            getValues('DATA').filter((_data: any, index: number) => {
                              return index !== row.index
                            })
                          )
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              </Box>
            )
          }
          renderBottomToolbar={() => (
            <>
              <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
                <Typography>Total {watch('DATA')?.length} entries</Typography>

                <div className='flex justify-end gap-2'>
                  <Button
                    disabled={!!columnFilters?.length}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete all rows?')) {
                        setValue('DATA', [])

                        setIsExcel(false)
                        setIsManual(false)
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
          )}
          renderTopToolbarCustomActions={({ table }) => (
            <>
              <div className='flex gap-3'>
                {mode === 'add' && (
                  <>
                    <Button
                      className='rounded-3xl'
                      variant='contained'
                      startIcon={<i className='tabler-plus' />}
                      onClick={() => handleAddDataRow()}
                      disabled={isExcel || mutation.isPending || loadingImportDataFile}
                    >
                      Add New
                    </Button>
                    <Divider orientation='vertical' flexItem />
                    <LoadingButton
                      className='rounded-3xl'
                      loading={mutation.isPending || loadingImportDataFile}
                      loadingPosition='start'
                      startIcon={<PublishIcon />}
                      variant='outlined'
                      onClick={handleUploadFile}
                      color='success'
                      disabled={isManual}
                    >
                      Import Data
                    </LoadingButton>
                    {/* <Button
                      className='rounded-3xl'
                      variant='tonal'
                      startIcon={<PublishIcon />}
                      onClick={handleUploadFile}
                      color='success'
                    >
                      Import Data
                    </Button> */}
                    {/* <LoadingButton
                      loading={mutation.isPending}
                      loadingPosition='start'
                      startIcon={<PublishIcon />}
                      variant='outlined'
                    >
                      Import Data
                    </LoadingButton> */}
                    <Button
                      className='rounded-3xl'
                      // variant='tonal'
                      startIcon={<FileDownloadIcon />}
                      onClick={() => handleDownloadImportFile()}
                      //disabled={isManual || mutation.isPending}
                      variant='outlined'
                      color='success'
                    >
                      Export Form
                    </Button>
                    <input type='file' ref={hiddenFileInput} style={{ display: 'none' }} onChange={handleChangeFile} />
                  </>
                )}
              </div>
            </>
          )}
        />
      </LocalizationProvider>
    </>
  )
}

export default StandardPriceDndAddTableData
