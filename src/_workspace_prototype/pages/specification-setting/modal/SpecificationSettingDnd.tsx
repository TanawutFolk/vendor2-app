import { useMemo, useState } from 'react'
import {
  MaterialReactTable,

  // createRow,
  type MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  type MRT_Row,
  useMaterialReactTable,
  MRT_ColumnOrderState,
  MRT_SortingState,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton
} from 'material-react-table'
import { Badge, Box, Button, DialogContent, Grid, IconButton, Tooltip, Typography } from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormContext, useFormState } from 'react-hook-form'
//
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage,
  uppercaseFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import RefreshIcon from '@mui/icons-material/Refresh'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import FilterListIcon from '@mui/icons-material/FilterList'
import type { Input, value } from 'valibot'
import {
  object,
  string,
  nullable,
  number,
  unknown,
  array,
  boolean,
  picklist,
  optional,
  record,
  minLength,
  maxLength,
  nullish,
  pipe,
  nonEmpty,
  regex
} from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import AsyncCreatableSelectCustom from '@/components/react-select/AsyncCreatableSelectCustom'
import { fetchProductMainByLikeProductMainNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import CustomTextField from '@/components/mui/TextField'
import { fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerOrderFrom'
import ConfirmModal from '@/components/ConfirmModal'
import { FormData } from './SpecificationSettingAddModal'
import AddIcon from '@mui/icons-material/Add'
import { css } from '@emotion/react'
import { fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/specification-setting/fetchSpecificationType'
import ProductTypeDndForSearch from '../../(productGroup)/product-type/modal/ProductTypeDndForSearch'

//export type FormData = Input<typeof schema>
type User = {
  id: string
}

const SpecificationSettingDnd = ({ setIsEnableFetching, data, setData, open, setOpen }: any) => {
  // State
  //const [dataRow, setData] = useState<FormFields[]>([])
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>([])
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [sorting, setSorting] = useState<MRT_SortingState>([])

  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>({})
  const [confirmModal, setConfirmModal] = useState(false)
  // Hooks
  // Hooks : react-hook-form

  // const { resetField, setValue, getValues, control, handleSubmit, watch, unregister } = useFormContext<FormFields>()
  const { control, handleSubmit, getValues, watch, reset, setValue, unregister, trigger } = useFormContext<FormData>()

  const { isLoading, errors } = useFormState({ control })

  const onSubmit: SubmitHandler<FormData> = () => {
    setConfirmModal(true)
  }
  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  const handleCreate = () => {
    setConfirmModal(false)
    console.log('DATA-PROFILE', data)
    console.log('original', `productMain.${row.original.id}`)
  }

  const openDeleteConfirmModal = (row: MRT_Row<FormData>) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setData((prevUsers: any) => prevUsers?.filter((user: User) => user.id !== row.original.id))
      unregister(`searchFilters.specification.${row.original.id}`)
      unregister(`searchFilters.productMain.${row.original.id}`)
      unregister(`searchFilters.customerOrderFrom.${row.original.id}`)
      unregister(`searchFilters.specificationSettingNumber.${row.original.id}`)
      unregister(`searchFilters.specificationSettingVersionRevision.${row.original.id}`)
      unregister(`searchFilters.partNumber.${row.original.id}`)
    }
    console.log('original', row.original.searchFilters)
  }

  console.log(Object.keys(errors))

  const columns = useMemo<MRT_ColumnDef<FormData>[]>(
    () => [
      {
        header: 'Product Main (optional)',
        accessorKey: 'PRODUCT_MAIN_NAME',
        size: 200,

        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`searchFilters.productMain.${row.original.id}`}
                defaultValue={
                  row.original.PRODUCT_MAIN_ID
                    ? {
                        PRODUCT_MAIN_ID: row.original.PRODUCT_MAIN_ID,
                        PRODUCT_MAIN_NAME: row.original.PRODUCT_MAIN_NAME
                      }
                    : null
                }
                control={control}
                render={({ field: { ref, onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Product Main'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    classNamePrefix='select'
                    onChange={value => {
                      onChange(value)
                      console.log('Main', value)

                      // setData(prev =>
                      //   prev?.map(prevUser =>
                      //     prevUser.PRODUCT_SPECIFICATION_SETTING_ID === row.original.PRODUCT_SPECIFICATION_SETTING_ID
                      //       ? { ...row.original, workElement: value }
                      //       : prevUser
                      //   )
                      // )
                    }}
                    // loadOptions={inputValue => {
                    //   return fetchProductMainByLikeProductMainNameAndInuse(inputValue, '1')
                    // }}
                    loadOptions={inputValue =>
                      fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1).then(response =>
                        response.map(item => ({
                          PRODUCT_MAIN_ID: item.PRODUCT_MAIN_ID,
                          PRODUCT_MAIN_NAME: item.PRODUCT_MAIN_NAME
                        }))
                      )
                    }
                    getOptionLabel={data => data.PRODUCT_MAIN_NAME}
                    getOptionValue={data => data.PRODUCT_MAIN_ID?.toString()}
                    {...(errors?.searchFilters?.productMain?.[row.original.id] && {
                      error: true,
                      helperText: errors?.searchFilters.productMain?.[row.original.id].message
                    })}
                  />
                )}
              />
            </>
          )
        }
      },
      // {
      //   // accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
      //   header: 'Column ID',
      //   size: 80,
      //   Cell: ({ renderedCellValue, row, cell }) => {
      //     return (
      //       <>
      //         <Controller
      //           key={row.original.id}
      //           name={`searchFilters.columnId.${row.original.id}`}
      //           control={control}
      //           rules={{ required: true }}
      //           render={({ field: { ...fieldProps } }) => (
      //             <CustomTextField
      //               label='Column ID'
      //               defaultValue={row.original?.id || ''}
      //               {...fieldProps}
      //               fullWidth
      //               // label='Customer Order From Alphabet'
      //               // placeholder='Enter Customer Order From Alphabet'
      //               autoComplete='off'
      //               // {...(errors.specificationSetting?.row?.original?.id && {
      //               //   error: true,
      //               //   helperText: errors.specificationSetting?.row?.original?.id?.message
      //               // })}
      //               {...(errors?.searchFilters?.specificationSetting?.[row.original.id] && {
      //                 error: true,
      //                 helperText: errors?.searchFilters?.specificationSetting?.[row.original.id].message
      //               })}
      //             />
      //           )}
      //         />
      //       </>
      //     )
      //   }
      // },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
        header: 'Product Specification Document Setting Name',
        size: 80,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`searchFilters.specificationSetting.${row.original.id}`}
                control={control}
                rules={{ required: true }}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    label='Product Specification Setting Name'
                    defaultValue={row.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME || ''}
                    {...fieldProps}
                    fullWidth
                    // label='Customer Order From Alphabet'
                    // placeholder='Enter Customer Order From Alphabet'
                    autoComplete='off'
                    // {...(errors.specificationSetting?.row?.original?.id && {
                    //   error: true,
                    //   helperText: errors.specificationSetting?.row?.original?.id?.message
                    // })}
                    {...(errors?.searchFilters?.specificationSetting?.[row.original.id] && {
                      error: true,
                      helperText: errors?.searchFilters?.specificationSetting?.[row.original.id].message
                    })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER',
        header: 'Product Specification Document Setting Number',
        size: 80,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`searchFilters.specificationSettingNumber.${row.original.id}`}
                control={control}
                rules={{ required: true }}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    defaultValue={row.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER || ''}
                    label='Product Specification Setting Number'
                    {...fieldProps}
                    fullWidth
                    autoComplete='off'
                    // {...(errors.specificationSettingNumber && {
                    //   error: true,
                    //   helperText: errors.specificationSettingNumber.message
                    // })}
                    {...(errors?.searchFilters?.specificationSettingNumber?.[row.original.id] && {
                      error: true,
                      helperText: errors?.searchFilters?.specificationSettingNumber?.[row.original.id]?.message
                    })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION',
        header: 'Product Specification Document Setting Version Revision',
        size: 80,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`searchFilters.specificationSettingVersionRevision.${row.original.id}`}
                control={control}
                rules={{ required: true }}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    defaultValue={row.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION || ''}
                    label='Product Specification Setting Version Revision'
                    {...fieldProps}
                    fullWidth
                    autoComplete='off'
                    // {...(errors.searchFilters.specificationSettingVersionRevision && {
                    //   error: true,
                    //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
                    // })}
                    {...(errors?.searchFilters?.specificationSettingVersionRevision?.[row.original.id] && {
                      error: true,
                      helperText: errors?.searchFilters?.specificationSettingVersionRevision?.[row.original.id].message
                    })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_PART_NUMBER',
        header: 'Product Part Number',
        size: 80,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`searchFilters.partNumber.${row.original.id}`}
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <CustomTextField
                    defaultValue={row.original?.PRODUCT_PART_NUMBER || ''}
                    label='Product Part Number'
                    {...fieldProps}
                    fullWidth
                    onChange={value => {
                      onChange(value)

                      // setValue('process', null)
                      // console.log('PartNum', value)
                    }}
                    // label='Customer Order From Alphabet'
                    // placeholder='Enter Customer Order From Alphabet'
                    autoComplete='off'
                    // {...(errors.searchFilters?.partNumber && {
                    //   error: true,
                    //   helperText: errors.searchFilters?.partNumber.message
                    // })}
                    {...(errors?.searchFilters?.partNumber?.[row.original.id] && {
                      error: true,
                      helperText: errors?.searchFilters?.partNumber?.[row.original.id].message
                    })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_MODEL_NUMBER',
        header: 'Product Model Number',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`searchFilters.modelNumber.${row.original.id}`}
                control={control}
                rules={{ required: true }}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    defaultValue={row.original?.PRODUCT_MODEL_NUMBER || ''}
                    label='Product Model Number'
                    {...fieldProps}
                    fullWidth
                    // onChange={value => {
                    //   onChange(value)
                    //   // setValue('process', null)
                    //   // console.log('PartNum', value)
                    // }}
                    // label='Customer Order From Alphabet'
                    // placeholder='Enter Customer Order From Alphabet'
                    autoComplete='off'
                    // {...(errors.searchFilters?.partNumber && {
                    //   error: true,
                    //   helperText: errors.searchFilters?.partNumber.message
                    // })}
                    {...(errors?.searchFilters?.modelNumber?.[row.original.id] && {
                      error: true,
                      helperText: errors?.searchFilters?.modelNumber?.[row.original.id].message
                    })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'CUSTOMER_ORDER_FROM_NAME',
        header: 'Customer (in specification)',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row?.original.id}
                name={`searchFilters.customerOrderFrom.${row?.original.id}`}
                control={control}
                defaultValue={
                  row.original.PRODUCT_MAIN_ID
                    ? {
                        CUSTOMER_ORDER_FROM_ID: row.original.CUSTOMER_ORDER_FROM_ID,
                        CUSTOMER_ORDER_FROM_NAME: row.original.CUSTOMER_ORDER_FROM_NAME
                      }
                    : null
                }
                render={({ field: { onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Customer (in specification)'
                    {...fieldProps}
                    onChange={value => {
                      onChange(value)
                      // console.log('orderFrom', value)
                    }}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse(inputValue, '1')
                    }}
                    getOptionLabel={data => data?.CUSTOMER_ORDER_FROM_NAME}
                    getOptionValue={data => data?.CUSTOMER_ORDER_FROM_ID?.toString()}
                    classNamePrefix='select'
                    placeholder='Select...'
                    // {...(errors.searchFilters.customerOrderFrom && { error: true, helperText: errors.searchFilters.customerOrderFrom.message })}
                    {...(errors?.searchFilters?.customerOrderFrom?.[row.original.id] && {
                      error: true,
                      helperText: errors?.searchFilters?.customerOrderFrom?.[row.original.id].message
                    })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_TYPE_NAME',
        header: 'Product Specification Type',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row?.original.id}
                name={`searchFilters.productSpecificationType.${row?.original.id}`}
                defaultValue={
                  row.original.PRODUCT_SPECIFICATION_TYPE_ID
                    ? {
                        PRODUCT_SPECIFICATION_TYPE_ID: row.original.PRODUCT_SPECIFICATION_TYPE_ID,
                        PRODUCT_SPECIFICATION_TYPE_NAME: row.original.PRODUCT_SPECIFICATION_TYPE_NAME
                      }
                    : null
                }
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Product Specification Type'
                    {...fieldProps}
                    onChange={value => {
                      onChange(value)
                      // console.log('orderFrom', value)
                    }}
                    isClearable
                    cacheOptions
                    defaultOptions
                    // loadOptions={inputValue => {
                    //   return fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse(inputValue, 1)
                    // }}

                    loadOptions={inputValue =>
                      fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse(inputValue, 1).then(
                        response =>
                          response.map(item => ({
                            PRODUCT_SPECIFICATION_TYPE_ID: item.PRODUCT_SPECIFICATION_TYPE_ID,
                            PRODUCT_SPECIFICATION_TYPE_NAME: item.PRODUCT_SPECIFICATION_TYPE_NAME
                          }))
                      )
                    }
                    getOptionLabel={data => data?.PRODUCT_SPECIFICATION_TYPE_NAME}
                    getOptionValue={data => data?.PRODUCT_SPECIFICATION_TYPE_ID?.toString()}
                    classNamePrefix='select'
                    placeholder='Select...'
                    // {...(errors.searchFilters.customerOrderFrom && { error: true, helperText: errors.searchFilters.customerOrderFrom.message })}
                    {...(errors?.searchFilters?.productSpecificationType?.[row.original.id] && {
                      error: true,
                      helperText: errors?.searchFilters?.productSpecificationType?.[row.original.id].message
                    })}
                  />
                )}
              />
            </>
          )
        }
      }
    ],
    [errors]
  )

  const table = useMaterialReactTable({
    autoResetPageIndex: false,
    columns,
    data: data,
    enableEditing: true,
    enableRowOrdering: false,
    enableColumnFilterModes: false,
    enableSorting: false,
    enablePagination: false,
    enableRowNumbers: true,
    enableColumnOrdering: true,
    enableHiding: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    onColumnFiltersChange: setColumnFilters,
    onColumnFilterFnsChange: setColumnFilterFns,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnFilterFns,
      columnOrder
    },
    muiRowDragHandleProps: ({ table }) => ({
      onDragEnd: () => {
        const { draggingRow, hoveredRow } = table.getState()
        if (hoveredRow && draggingRow) {
          data.splice((hoveredRow as MRT_Row<FormData>).index, 0, data.splice(draggingRow.index, 1)[0])
          setData([...data])
        }
      }
    }),
    muiTableContainerProps: {
      sx: {
        minHeight: '600px',
        maxHeight: '600px'
      }
    },
    renderRowActions: ({ row, table, cell }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <>
          <Tooltip title='Delete'>
            <IconButton color='error' onClick={() => openDeleteConfirmModal(row)}>
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
            startIcon={<AddIcon />}
            variant='contained'
            onClick={() => {
              setData(
                (prevUsers: any) =>
                  [
                    ...prevUsers,
                    {
                      id: (Math.random() + 1).toString(36).substring(7)
                    }
                  ] as FormData[]
              )
            }}
            disabled={!!columnFilters.length}
          >
            Add New
          </Button>
          {/* <Tooltip arrow title='Clear All Sorting' onClick={() => table.resetSorting(true)}>
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
          </Tooltip> */}
        </div>
      </>
    ),
    renderToolbarInternalActions: ({ table }) => (
      <>
        {/* add your own custom print button or something */}
        {/* <IconButton onClick={() => showPrintPreview(true)}>
          <PrintIcon />
        </IconButton> */}
        {/* built-in buttons (must pass in table prop for them to work!) */}
        {/* <MRT_ToggleFiltersButton table={table} disabled />
        <MRT_ShowHideColumnsButton table={table} disabled />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} /> */}
      </>
    ),

    renderBottomToolbar: ({ table }) => (
      <>
        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography>Total {data?.length} entries</Typography>
          {/* <Button
            onClick={() => {
              setData(
                (prevUsers: any) =>
                  [
                    ...prevUsers,
                    {
                      ...{ productCategory: '' },
                      id: (Math.random() + 1).toString(36).substring(7)
                    }
                  ] as FormFields[]
              )
            }}
            variant='contained'
          >
            Add New
          </Button> */}
          <div className='flex justify-end gap-2'>
            {/* <Button
              disabled={!!columnFilters.length}
              onClick={() => handleSubmit(onSubmit, onError)()}
              color='success'
              variant='contained'
            >
              Save
            </Button> */}
            <Button
              disabled={!!columnFilters.length}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this user?')) {
                  setData([])
                  unregister(`searchFilters.specificationSetting`)
                  unregister(`searchFilters.productMain`)
                  unregister(`searchFilters.customerOrderFrom`)
                  unregister(`searchFilters.specificationSettingNumber`)
                  unregister(`searchFilters.specificationSettingVersionRevision`)
                }
              }}
              color='secondary'
              variant='tonal'
            >
              Clear all
            </Button>
            <ConfirmModal
              show={confirmModal}
              onConfirmClick={handleCreate}
              onCloseClick={() => setConfirmModal(false)}
              isDelete={false}
            />
          </div>
        </div>
      </>
    )
  })

  return (
    <>
      {/* {JSON.stringify(data)} */}
      {/* {JSON.stringify(watch())} */}

      <MaterialReactTable table={table} />
      {/* <DevTool control={control} /> */}
    </>
  )
}

export default SpecificationSettingDnd
