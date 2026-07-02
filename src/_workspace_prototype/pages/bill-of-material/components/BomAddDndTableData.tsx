import { useEffect, useMemo, useState } from 'react'
//import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useMachineSystemInProcessData'
import {
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  type MRT_Row,
  useMaterialReactTable,
  MRT_TableOptions
} from 'material-react-table'
import {
  Alert,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  useColorScheme
} from '@mui/material'
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormContext, useFormState } from 'react-hook-form'

//import type { ProductMainInterface } from '@/types/ProductMain'

import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import RefreshIcon from '@mui/icons-material/Refresh'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import FilterListIcon from '@mui/icons-material/FilterList'

type User = {
  id: string
}

// Third-party Imports
import { toast } from 'react-toastify'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import CustomTextField from '@/components/mui/TextField'
import {
  InferInput,
  maxLength,
  minLength,
  minValue,
  nonEmpty,
  nonNullable,
  nullable,
  number,
  object,
  pipe,
  record,
  string,
  transform,
  type Input
} from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import ConfirmModal from '@/components/ConfirmModal'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { on } from 'process'
import SelectCustom from '@/components/react-select/SelectCustom'
import {
  fetchItemCategoryByItemCategoryNameAndInuse,
  fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse,
  ItemCategoryOption
} from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import {
  fetchItemCodeByItemCodeNameAndInuse_NotFG,
  ItemOption
} from '@/_workspace/react-select/async-promise-load-options/fetchItem'
import { FormData } from '../modal/BomAddModal'
import ViewItemModal from './ViewItemModal'
import SelectingItemModal from '../modal/ItemSelectModal/00.BackUp/SelectingItemModal'
import ItemSelectModal from '../modal/ItemSelectModal/ItemSelectModal'

const BomAddDndTableData = ({ data, setData, isMessageError, setIsMessageError, open, setOpen, isLockedBom }: any) => {
  // const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({})
  const [confirmModal, setConfirmModal] = useState(false)

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>({
    EMPLOYEE_CODE: 'contains'
  })

  const [rowSelected, setRowSelected] = useState<FormData>(null)
  const [rowIdSelected, setRowIdSelected] = useState<string>('')

  const [isOpenViewItemModal, setIsOpenViewItemModal] = useState(false)
  const [isOpenSelectingItemModal, setIsOpenSelectingItemModal] = useState(false)

  const { control, getValues, watch, setValue, unregister } = useFormContext<FormData>()

  const { errors } = useFormState({ control })

  // const onSubmit: SubmitHandler<FormData> = () => {
  //   setConfirmModal(true)
  // }

  const handleAddDataRow: SubmitHandler<FormData> = () => {
    setData(
      (prev: any) =>
        [
          ...prev,
          {
            id: (Math.random() + 1).toString(36).substring(7)
          }
        ] as FormData[]
    )
  }

  const handleCreate = () => {
    setConfirmModal(false)

    console.log('DATA-PROFILE', data)
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Profile Data'
      }

      ToastMessageSuccess(message)
      setData({})
    } else {
      const message = {
        title: 'Add Profile Data',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Profile Data' : data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  const handleClose = () => setOpen(false)

  const openDeleteConfirmModal = (row: MRT_Row<FormData>) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setData((prevUsers: any) => prevUsers?.filter((user: User) => user.id !== row.original.id))
      // unregister(`${row.original.id}.process`)
      // unregister(`${row.original.id}.itemCategory`)
      // unregister(`${row.original.id}.itemCode`)
      // unregister(`${row.original.id}.qty`)
      unregister(`ITEM.${row.original.id}`)
    }
  }

  const updateItemById = (id: number, key: string, newValue: any) => {
    setData(prevItems => prevItems.map(item => (item.id === id ? { ...item, [key]: newValue } : item)))
  }

  const columns = useMemo<MRT_ColumnDef<FormData>[]>(
    () => [
      {
        accessorKey: 'PROCESS',
        header: 'PROCESS NAME',
        size: 250,
        enableColumnFilter: true,
        Filter: ({ column, header, table }) => {
          return (
            <>
              <CustomTextField
                size='small'
                placeholder={`Search ${column.columnDef.header}...`}
                onChange={e => {
                  column.setFilterValue(e.target.value)
                }}
              />
            </>
          )
        },
        filterFn: (row, id, filterValue) => {
          const rowData = getValues(`ITEM.${row.original.id}`)

          if (!rowData?.PROCESS) {
            return false
          }

          return filterValue ? rowData?.PROCESS?.label?.toLowerCase().includes(filterValue.toLowerCase()) : null
        },
        Cell: ({ renderedCellValue, row, cell }) => {
          const processMap = getValues('PROCESS').map((item: any) => {
            return {
              value: item.PROCESS_ID,
              label: item.PROCESS_NAME
            }
          })

          return (
            <>
              <Controller
                key={row.original.id}
                control={control}
                name={`ITEM.${row.original.id}.PROCESS`}
                render={({ field: { onChange, ref, ...fieldProps } }) => (
                  <SelectCustom
                    label=''
                    {...fieldProps}
                    onChange={value => {
                      onChange(value)

                      updateItemById(row.original.id, 'PROCESS', value)
                    }}
                    isClearable
                    cacheOptions
                    defaultOptions
                    options={processMap}
                    innerRef={ref}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...((errors?.ITEM?.[row.original.id]?.PROCESS ||
                      errors?.ITEM?.[row.original.id]?.PROCESS?.value) && {
                      error: true,
                      helperText:
                        errors?.ITEM?.[row.original.id]?.PROCESS?.message ||
                        errors?.ITEM?.[row.original.id]?.PROCESS?.value?.message
                    })}
                    isDisabled={isLockedBom}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'ITEM_CATEGORY',
        header: 'ITEM CATEGORY',
        size: 180,
        enableColumnFilter: true,
        Filter: ({ column, header, table }) => {
          return (
            <>
              <CustomTextField
                size='small'
                placeholder={`Search ${column.columnDef.header}...`}
                onChange={e => {
                  column.setFilterValue(e.target.value)
                }}
              />
            </>
          )
        },
        filterFn: (row, id, filterValue) => {
          const rowData = getValues(`ITEM.${row.original.id}`)

          if (!rowData?.ITEM) {
            return false
          }

          return filterValue
            ? rowData?.ITEM?.ITEM_CATEGORY_NAME?.toLowerCase().includes(filterValue.toLowerCase())
            : null
        },
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`ITEM.${row.original.id}.ITEM_CATEGORY`}
                control={control}
                render={({ field: { ref, onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom<ItemCategoryOption>
                    label=''
                    {...fieldProps}
                    onChange={value => {
                      onChange(value)
                    }}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse(
                        inputValue
                      )
                    }}
                    innerRef={ref}
                    getOptionLabel={data => data.ITEM_CATEGORY_NAME}
                    getOptionValue={data => data.ITEM_CATEGORY_ID}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...((errors?.ITEM?.[row.original.id]?.ITEM_CATEGORY ||
                      errors?.ITEM?.[row.original.id]?.ITEM_CATEGORY?.ITEM_CATEGORY_ID) && {
                      error: true,
                      helperText:
                        errors?.ITEM?.[row.original.id]?.ITEM_CATEGORY?.message ||
                        errors?.ITEM?.[row.original.id]?.ITEM_CATEGORY?.ITEM_CATEGORY_ID?.message
                    })}
                    isDisabled={
                      ![4, 5, 6].includes(watch(`ITEM.${row.original.id}.ITEM.ITEM_CATEGORY_ID`)) || isLockedBom
                    }
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'ITEM',
        header: 'ITEM CODE',
        size: 350,
        enableColumnFilter: true,
        Filter: ({ column, header, table }) => {
          return (
            <>
              <CustomTextField
                size='small'
                placeholder={`Search ${column.columnDef.header}...`}
                onChange={e => {
                  column.setFilterValue(e.target.value)
                }}
              />
            </>
          )
        },
        filterFn: (row, id, filterValue) => {
          const rowData = getValues(`ITEM.${row.original.id}`)

          if (!rowData?.ITEM) {
            return false
          }

          return filterValue
            ? rowData?.ITEM?.ITEM_CODE_FOR_SUPPORT_MES?.toLowerCase().includes(filterValue.toLowerCase())
            : null
        },
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`ITEM.${row.original.id}.ITEM`}
                control={control}
                render={({ field: { ref, onChange, ...fieldProps } }) => (
                  <>
                    <ButtonGroup
                      variant='text'
                      sx={{
                        width: '100%'
                      }}
                    >
                      <Button
                        variant='text'
                        size='small'
                        sx={{
                          borderRight: '0 !important'
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            setRowSelected(fieldProps.value)

                            setIsOpenViewItemModal(true)
                          }}
                        >
                          <i className='tabler-eye text-[16px] text-textPrimary' />
                        </IconButton>
                      </Button>
                      <Button
                        variant='text'
                        size='small'
                        sx={{
                          borderRight: '0 !important'
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            setRowIdSelected(fieldProps.name)

                            setIsOpenSelectingItemModal(true)
                          }}
                        >
                          <i className='tabler-list-details text-[16px] text-textPrimary' />
                        </IconButton>
                      </Button>

                      <AsyncSelectCustom<ItemOption>
                        label=''
                        {...fieldProps}
                        onChange={value => {
                          onChange(value)
                          if (value) {
                            setValue(`ITEM.${row.original.id}.ITEM_CATEGORY`, {
                              ITEM_CATEGORY_ID: value?.ITEM_CATEGORY_ID,
                              ITEM_CATEGORY_NAME: value?.ITEM_CATEGORY_NAME,
                              ITEM_CATEGORY_ALPHABET: value?.ITEM_CATEGORY_ALPHABET
                            })
                          } else {
                            setValue(`ITEM.${row.original.id}.ITEM_CATEGORY`, null)
                          }
                        }}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchItemCodeByItemCodeNameAndInuse_NotFG(inputValue)
                        }}
                        innerRef={ref}
                        getOptionLabel={data => data.ITEM_CODE_FOR_SUPPORT_MES}
                        getOptionValue={data => data.ITEM_ID}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...((errors?.ITEM?.[row.original.id]?.ITEM ||
                          errors?.ITEM?.[row.original.id]?.ITEM?.ITEM_ID) && {
                          error: true,
                          helperText:
                            errors?.ITEM?.[row.original.id]?.ITEM?.message ||
                            errors?.ITEM?.[row.original.id]?.ITEM?.ITEM_ID?.message
                        })}
                        isDisabled={isLockedBom}
                        className='w-52'
                      />
                    </ButtonGroup>
                  </>
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'ITEM_NAME',
        header: 'ITEM NAME',
        size: 250,
        enableColumnFilter: true,
        Filter: ({ column, header, table }) => {
          return (
            <>
              <CustomTextField
                className='text-nowrap'
                size='small'
                placeholder={`Search ${column.columnDef.header}...`}
                onChange={e => {
                  column.setFilterValue(e.target.value)
                }}
              />
            </>
          )
        },
        filterFn: (row, id, filterValue) => {
          const rowData = getValues(`ITEM.${row.original.id}`)

          if (!rowData?.ITEM) {
            return false
          }

          return filterValue
            ? rowData?.ITEM?.ITEM_INTERNAL_FULL_NAME?.toLowerCase().includes(filterValue.toLowerCase())
            : null
        },
        Cell: ({ renderedCellValue, row, cell }) => {
          return <>{watch(`ITEM.${row.original.id}.ITEM.ITEM_INTERNAL_FULL_NAME`)}</>
        }
      },
      {
        accessorKey: 'USAGE_QTY',
        header: 'USAGE QTY',
        enableColumnFilter: true,
        Filter: ({ column, header, table }) => {
          return (
            <>
              <CustomTextField
                size='small'
                placeholder={`Search ${column.columnDef.header}...`}
                onChange={e => {
                  column.setFilterValue(e.target.value)
                }}
              />
            </>
          )
        },
        filterFn: (row, id, filterValue) => {
          const rowData = getValues(`ITEM.${row.original.id}`)

          if (!rowData?.USAGE_QUANTITY) {
            return false
          }

          return filterValue ? rowData?.USAGE_QUANTITY?.toLowerCase().includes(filterValue.toLowerCase()) : null
        },
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                control={control}
                name={`ITEM.${row.original.id}.USAGE_QUANTITY`}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label=''
                    fullWidth
                    placeholder='Enter Qty'
                    autoComplete='off'
                    {...(errors?.ITEM?.[row.original.id]?.USAGE_QUANTITY && {
                      error: true,
                      helperText: errors?.ITEM?.[row.original.id]?.USAGE_QUANTITY.message
                    })}
                    disabled={isLockedBom}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'USAGE_UNIT',
        header: 'USAGE UNIT',
        size: 40,
        enableColumnFilter: true,
        Filter: ({ column, header, table }) => {
          return (
            <>
              <CustomTextField
                size='small'
                placeholder={`Search ${column.columnDef.header}...`}
                onChange={e => {
                  column.setFilterValue(e.target.value)
                }}
              />
            </>
          )
        },
        filterFn: (row, id, filterValue) => {
          const rowData = getValues(`ITEM.${row.original.id}`)

          if (!rowData?.ITEM) {
            return false
          }

          return filterValue
            ? rowData?.ITEM?.UNIT_OF_MEASUREMENT_NAME?.toLowerCase().includes(filterValue.toLowerCase())
            : null
        },
        Cell: ({ row }) => {
          return <>{watch(`ITEM.${row.original.id}.ITEM.UNIT_OF_MEASUREMENT_NAME`)}</>
        }
      }
    ],
    [errors, watch()]
  )

  const table = useMaterialReactTable({
    // autoResetPageIndex: false,
    // columns,
    // data: data,
    enableEditing: true,
    //enableRowOrdering: isLockedBom ? false : true,
    enableRowOrdering: true,
    enableSorting: true,
    enablePagination: false,
    enableRowNumbers: true,
    //enableColumnResizing: true,
    // // onColumnFiltersChange: setColumnFilters,
    // // onColumnFilterFnsChange: setColumnFilterFns,
    // state: {
    //   columnFilters,
    //   columnFilterFns
    // },
    // // muiRowDragHandleProps: ({ table }) => ({
    // //   onDragEnd: () => {
    // //     const { draggingRow, hoveredRow } = table.getState()

    // //     if (hoveredRow && draggingRow) {
    // //       // const newData = [...data]
    // //       // newData.splice(draggingRow.index, 1)
    // //       // newData.splice(hoveredRow.index, 0, data.splice(draggingRow.index, 1)[0])

    // //       data.splice(hoveredRow.index, 0, data.splice(draggingRow.index, 1)[0])

    // //       // setData(newData)
    // //       setData([...data])
    // //     }
    // //   }
    // // }),
    enableStickyHeader: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: '40vh',
        minHeight: '40vh',
        overflow: 'scroll'
      }
    },
    // muiTableBodyCellProps: {
    //   sx: {
    //     overflow: 'none',
    //     position: 'static'
    //   }
    // },
    // muiTableBodyRowProps: {
    //   sx: {
    //     position: 'static'
    //   }
    // },
    // muiTopToolbarProps: {
    //   sx: {
    //     zIndex: 0
    //   }
    // },
    // muiTableHeadProps: {
    //   sx: {
    //     position: 'sticky',
    //     top: 0,
    //     zIndex: 1
    //   }
    // },
    autoResetPageIndex: false,
    columns,
    data,
    // enableRowOrdering: true,
    // enableSorting: false,
    muiRowDragHandleProps: ({ table }) => ({
      onDragEnd: () => {
        const { draggingRow, hoveredRow } = table.getState()
        if (hoveredRow && draggingRow) {
          data.splice((hoveredRow as MRT_Row<Person>).index, 0, data.splice(draggingRow.index, 1)[0])
          setData([...data])
        }
      }
    }),
    renderRowActions: ({ row, table, cell }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <>
          <Tooltip title='Delete'>
            <IconButton
              disabled={isLockedBom}
              color='error'
              onClick={() => {
                openDeleteConfirmModal(row)
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <>
        <div className='flex gap-1'>
          <Button
            variant='contained'
            startIcon={<i className='tabler-plus' />}
            onClick={() => handleAddDataRow()}
            disabled={!!columnFilters?.length || isLockedBom || watch('PROCESS').length <= 0}
          >
            Add New
          </Button>
          <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
            <IconButton>
              <Badge badgeContent={columnFilters?.length ?? 0} color='primary'>
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </div>
      </>
    ),
    renderBottomToolbar: ({ table }) => (
      <>
        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography>Total {data?.length} entries</Typography>

          <div className='flex justify-end gap-2'>
            <Button
              disabled={!!columnFilters?.length}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this item?')) {
                  setData({})

                  for (const key of Object.keys(getValues('ITEM'))) {
                    unregister(`ITEM.${key}`)
                  }
                }
              }}
              color='secondary'
              variant='tonal'
            >
              Clear all
            </Button>
          </div>
        </div>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleCreate}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </>
    )
  })

  return (
    <>
      {isMessageError ? (
        <Dialog
          maxWidth='sm'
          fullWidth={true}
          disableEscapeKeyDown
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
          onClose={handleClose}
          open={open}
          sx={{
            '& .MuiDialog-paper': { overflow: 'visible' },
            '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
          }}
          PaperProps={{ sx: { top: 30, m: 0 } }}
        >
          <DialogTitle className='flex flex-col gap-2 text-center' id='customized-dialog-title'>
            <DialogCloseButton onClick={handleClose} disableRipple>
              <i className='tabler-x' />
            </DialogCloseButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
              <img className='mb-4' width={145} src={'/img/icons/doc.png'} height={145} alt={'Enterprise'} />
            </Box>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant='h4' sx={{ mb: 1 }}>
                You want to change product main?
              </Typography>
              <Typography variant='h5' sx={{ color: 'text.secondary' }}>
                คุณต้องการเปลี่ยน product main?
              </Typography>
              <Typography variant='h5' sx={{ color: 'text.secondary' }}>
                ถ้าใช่! ข้อมูล Material ที่ใส่ข้อมูลไปจะถูกลบออกทั้งหมด
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              justifyContent: 'center',
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <Button
              size='large'
              variant='contained'
              color='primary'
              onClick={() => {
                setData({})
                setOpen(false)
                // unregister(`searchFilters.productMain`)
                // unregister(`searchFilters.itemCodeForSupportMES`)
                // unregister(`searchFilters.usageQty`)
              }}
            >
              OK
            </Button>

            <Button size='large' variant='contained' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
      {/* {JSON.stringify(data)} */}
      <MaterialReactTable table={table} />
      {/* <DevTool control={control} /> */}
      {isOpenViewItemModal && (
        <ViewItemModal
          rowSelected={rowSelected}
          setRowSelected={setRowSelected}
          isOpenViewItemModal={isOpenViewItemModal}
          setIsOpenViewItemModal={setIsOpenViewItemModal}
        />
      )}
      {/* {isOpenSelectingItemModal && (
        <SelectingItemModal
          rowIdSelected={rowIdSelected}
          setRowIdSelected={setRowIdSelected}
          isOpenSelectingItemModal={isOpenSelectingItemModal}
          setIsOpenSelectingItemModal={setIsOpenSelectingItemModal}
          setValue={setValue}
        />
      )} */}
      {isOpenSelectingItemModal && (
        <ItemSelectModal
          rowIdSelected={rowIdSelected}
          setRowIdSelected={setRowIdSelected}
          isOpenSelectingItemModal={isOpenSelectingItemModal}
          setIsOpenSelectingItemModal={setIsOpenSelectingItemModal}
          setValue={setValue}
        />
      )}
    </>
  )
}

export default BomAddDndTableData
