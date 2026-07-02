import { useEffect, useMemo } from 'react'

import { Box, Button, Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import { MaterialReactTable, MRT_ColumnDef, MRT_Row, useMaterialReactTable } from 'material-react-table'

import { Controller, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

import SelectCustom from '@/components/react-select/SelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import CustomTextField from '@/components/mui/TextField'

import {
  array,
  maxLength,
  minLength,
  nonEmpty,
  nonNullable,
  nullable,
  number,
  object,
  optional,
  pipe,
  record,
  string,
  transform,
  //@ts-ignore
  type Input
} from 'valibot'

import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import {
  fetchItemCategoryByItemCategoryNameAndInuse,
  ItemCategoryOption
} from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import {
  fetchItemCodeByItemCodeNameAndInuse,
  ItemOption
} from '@/_workspace/react-select/async-promise-load-options/fetchItem'

// Schema with Valibot
const schema = object({
  MATERIAL_IN_PROCESS: record(
    string(),
    object(
      {
        PROCESS: object(
          {
            label: string(),
            value: number()
          },
          'Process is required'
        ),
        ITEM_CATEGORY: object(
          {
            ITEM_CATEGORY_ID: nullable(number()),
            ITEM_CATEGORY_NAME: nullable(string())
          },
          'Item Category is required'
        ),
        ITEM: object(
          {
            ITEM_ID: nullable(number()),
            ITEM_CODE_FOR_SUPPORT_MES: nullable(string())
          },
          'Item is required'
        ),
        USAGE_QUANTITY: pipe(
          string(requiredFieldMessage({ fieldName: 'Usage Quantity' })),
          // nonEmpty('Usage Quantity is required'),
          transform((value: string) => {
            return parseFloat(value)
          })
        )
      },
      'Usage Quantity is required'
    )
  )
})

export type FormData = Input<typeof schema>

const MaterialInProcess = () => {
  const { watch, setValue, unregister, getValues, control } = useFormContext<FormData>()

  const { isLoading, errors } = useFormState({ control })

  const handleAddDataRow: SubmitHandler<FormData> = () => {
    setValue('MATERIAL_IN_PROCESS_ID', [
      ...getValues('MATERIAL_IN_PROCESS_ID'),
      {
        id: (Math.random() + 1).toString(36).substring(7)
      }
    ] as FormData[])
  }

  const openDeleteConfirmModal = (row: MRT_Row<any>) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setValue('MATERIAL_IN_PROCESS', (prevUsers: any) => prevUsers?.filter((item: any) => item.id !== row.original.id))
      // unregister(`${row.original.id}.process`)
      // unregister(`${row.original.id}.itemCategory`)
      // unregister(`${row.original.id}.itemCode`)
      // unregister(`${row.original.id}.qty`)
      unregister(`MATERIAL_IN_PROCESS.${row.original.id}`)
    }
  }

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'PROCESS',
        header: 'PROCESS NAME',
        size: 300,
        enableColumnFilter: true,
        Cell: ({ renderedCellValue, row, cell }) => {
          const processMap = getValues('FLOW_PROCESS').map((item: any) => {
            return {
              no: item.NO,
              value: item.PROCESS_ID,
              label: item.PROCESS_NAME
            }
          })

          return (
            <>
              <Controller
                key={row.original.id}
                control={control}
                name={`MATERIAL_IN_PROCESS.${row.original.id}.PROCESS`}
                render={({ field: { onChange, ref, ...fieldProps } }) => (
                  <SelectCustom
                    label=''
                    {...fieldProps}
                    isDisabled={getValues('mode') === 'view'}
                    onChange={value => {
                      onChange(value)

                      setValue('IS_EDIT_BOM', true)
                    }}
                    isClearable
                    cacheOptions
                    defaultOptions
                    options={processMap}
                    innerRef={ref}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...((errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.PROCESS ||
                      errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.PROCESS?.value) && {
                      error: true,
                      helperText:
                        errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.PROCESS?.message ||
                        errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.PROCESS?.value?.message
                    })}
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
        size: 250,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`MATERIAL_IN_PROCESS.${row.original.id}.ITEM_CATEGORY`}
                control={control}
                render={({ field: { ref, onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom<ItemCategoryOption>
                    label=''
                    {...fieldProps}
                    onChange={value => {
                      onChange(value)

                      setValue('IS_EDIT_BOM', true)
                    }}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchItemCategoryByItemCategoryNameAndInuse(inputValue)
                    }}
                    innerRef={ref}
                    getOptionLabel={data => data.ITEM_CATEGORY_NAME}
                    getOptionValue={data => data.ITEM_CATEGORY_ID}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...((errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM_CATEGORY ||
                      errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM_CATEGORY?.ITEM_CATEGORY_ID) && {
                      error: true,
                      helperText:
                        errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM_CATEGORY?.message ||
                        errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM_CATEGORY?.ITEM_CATEGORY_ID?.message
                    })}
                    isDisabled={
                      ![4, 5, 6].includes(watch(`MATERIAL_IN_PROCESS.${row.original.id}.ITEM.ITEM_CATEGORY_ID`)) ||
                      getValues('mode') === 'view'
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
        size: 250,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`MATERIAL_IN_PROCESS.${row.original.id}.ITEM`}
                control={control}
                render={({ field: { ref, onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom<ItemOption>
                    label=''
                    {...fieldProps}
                    isDisabled={getValues('mode') === 'view'}
                    onChange={value => {
                      onChange(value)
                      if (value) {
                        setValue(`MATERIAL_IN_PROCESS.${row.original.id}.ITEM_CATEGORY`, {
                          ITEM_CATEGORY_ID: value?.ITEM_CATEGORY_ID,
                          ITEM_CATEGORY_NAME: value?.ITEM_CATEGORY_NAME,
                          ITEM_CATEGORY_ALPHABET: value?.ITEM_CATEGORY_ALPHABET
                        })
                      } else {
                        setValue(`MATERIAL_IN_PROCESS.${row.original.id}.ITEM_CATEGORY`, null)
                      }

                      setValue('IS_EDIT_BOM', true)
                    }}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchItemCodeByItemCodeNameAndInuse(inputValue)
                    }}
                    innerRef={ref}
                    getOptionLabel={data => data.ITEM_CODE_FOR_SUPPORT_MES}
                    getOptionValue={data => data.ITEM_ID}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...((errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM ||
                      errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM?.ITEM_ID) && {
                      error: true,
                      helperText:
                        errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM?.message ||
                        errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM?.ITEM_ID?.message
                    })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'ITEM_NAME',
        header: 'ITEM NAME',
        size: 40,
        Cell: ({ renderedCellValue, row, cell }) => {
          return <>{watch(`MATERIAL_IN_PROCESS.${row.original.id}.ITEM.ITEM_INTERNAL_FULL_NAME`)}</>
        }
      },
      {
        accessorKey: 'USAGE_QTY',
        header: 'USAGE QTY',
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                control={control}
                name={`MATERIAL_IN_PROCESS.${row.original.id}.USAGE_QUANTITY`}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    disabled={getValues('mode') === 'view'}
                    label=''
                    fullWidth
                    placeholder='Enter Qty'
                    autoComplete='off'
                    onChange={value => {
                      fieldProps.onChange(value)

                      setValue('IS_EDIT_BOM', true)
                    }}
                    {...(errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.USAGE_QUANTITY && {
                      error: true,
                      helperText: errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.USAGE_QUANTITY.message
                    })}
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
        Cell: ({ renderedCellValue, row, cell }) => {
          return <>{watch(`MATERIAL_IN_PROCESS.${row.original.id}.ITEM.UNIT_OF_MEASUREMENT_NAME`)}</>
        }
      }
    ],
    [errors, watch('MATERIAL_IN_PROCESS'), watch('MATERIAL_IN_PROCESS')?.length]
  )

  const table = useMaterialReactTable({
    autoResetPageIndex: false,
    columns,
    data: watch('MATERIAL_IN_PROCESS_ID') ?? [],
    enableEditing: true,
    // enableRowOrdering: true,
    enableRowOrdering: getValues('mode') !== 'view',
    enableSorting: false,
    enablePagination: false,
    enableRowNumbers: true,
    enableColumnFilters: false,

    muiRowDragHandleProps: ({ table }) => ({
      onDragEnd: () => {
        const { draggingRow, hoveredRow } = table.getState()

        if (hoveredRow && draggingRow) {
          let data = watch('MATERIAL_IN_PROCESS') ?? []

          const newData = [...data]
          newData.splice(draggingRow.index, 1)
          newData.splice(hoveredRow.index, 0, data.splice(draggingRow.index, 1)[0])

          setValue('MATERIAL_IN_PROCESS', newData)
        }
      }
    }),
    muiTableContainerProps: {
      sx: {
        maxHeight: '40vh',
        minHeight: '40vh',
        overflow: 'scroll'
      }
    },
    muiTableBodyCellProps: {
      sx: {
        overflow: 'none',
        position: 'static'
      }
    },
    muiTableBodyRowProps: {
      sx: {
        position: 'static'
      }
    },
    renderRowActions: ({ row, table, cell }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <>
          <Tooltip title='Delete'>
            <IconButton
              disabled={getValues('mode') === 'view'}
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
            disabled={getValues('mode') === 'view'}
            variant='contained'
            startIcon={<i className='tabler-plus' />}
            onClick={() => handleAddDataRow()}
            // disabled={!!columnFilters?.length || isLockedBom}
          >
            Add New
          </Button>
          {/* <Tooltip arrow title='Clear All Filters' onClick={() => table.resetColumnFilters(true)}>
            <IconButton>
              <Badge badgeContent={columnFilters?.length ?? 0} color='primary'>
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip> */}
        </div>
      </>
    )
    // renderBottomToolbar: ({ table }) => (
    //   <>
    //     <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
    //       <Typography>Total {data?.length} entries</Typography>

    //       <div className='flex justify-end gap-2'>
    //         <Button
    //           disabled={!!columnFilters?.length}
    //           onClick={() => {
    //             if (window.confirm('Are you sure you want to delete this item?')) {
    //               setData({})

    //               for (const key of Object.keys(getValues('ITEM'))) {
    //                 unregister(`ITEM.${key}`)
    //               }
    //             }
    //           }}
    //           color='secondary'
    //           variant='tonal'
    //         >
    //           Clear all
    //         </Button>
    //       </div>
    //     </div>
    //     <ConfirmModal
    //       show={confirmModal}
    //       onConfirmClick={handleCreate}
    //       onCloseClick={() => setConfirmModal(false)}
    //       isDelete={false}
    //     />
    //   </>
    // )
  })

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader title='Material in Process' />
      <CardContent>
        <MaterialReactTable table={table} />
      </CardContent>
    </Card>
  )
}

export default MaterialInProcess
