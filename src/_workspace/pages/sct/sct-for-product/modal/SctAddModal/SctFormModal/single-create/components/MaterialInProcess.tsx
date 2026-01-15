import { useEffect, useMemo, useState } from 'react'

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
  fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse,
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
  const [isLockedMiP, setIsLockedMiP] = useState(true)
  const [globalFilter, setGlobalFilter] = useState<any>('')

  const { watch, setValue, unregister, getValues, control, trigger } = useFormContext<FormData>()

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
      unregister(`MATERIAL_IN_PROCESS.${row.original.id}`)

      setValue(
        'MATERIAL_IN_PROCESS_ID',
        getValues('MATERIAL_IN_PROCESS_ID').filter((item: any) => item.id !== row.original.id)
      )

      setValue('IS_EDIT_BOM', true)
    }
  }

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'PROCESS',
        header: 'PROCESS NAME',
        size: 210,
        enableColumnFilter: true,
        sortingFn: (rowA, rowB, columnId) => {
          const rowAId = rowA.original.id
          const rowBId = rowB.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          const materialA = materials[rowAId]
          const materialB = materials[rowBId]

          return materialA?.PROCESS?.label < materialB?.PROCESS?.label ? 1 : -1
        },
        filterFn: (row, id, filterValue) => {
          const rowId = row.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          return materials[rowId]?.PROCESS?.label?.toLowerCase().includes(filterValue.toLowerCase())
        },
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
                    isDisabled={getValues('mode') === 'view' || isLockedMiP}
                    onChange={value => {
                      onChange(value)

                      setValue('IS_EDIT_BOM', true)
                    }}
                    // isClearable
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
        sortingFn: (rowA, rowB, columnId) => {
          const rowAId = rowA.original.id
          const rowBId = rowB.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          const materialA = materials[rowAId]
          const materialB = materials[rowBId]

          return materialA?.ITEM_CATEGORY?.ITEM_CATEGORY_NAME < materialB?.ITEM_CATEGORY?.ITEM_CATEGORY_NAME ? 1 : -1
        },
        filterFn: (row, id, filterValue) => {
          const rowId = row.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          return materials[rowId]?.ITEM_CATEGORY?.ITEM_CATEGORY_NAME?.toLowerCase().includes(filterValue.toLowerCase())
        },
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
                    // isClearable
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
                    {...((errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM_CATEGORY ||
                      errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM_CATEGORY?.ITEM_CATEGORY_ID) && {
                      error: true,
                      helperText:
                        errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM_CATEGORY?.message ||
                        errors?.MATERIAL_IN_PROCESS?.[row.original.id]?.ITEM_CATEGORY?.ITEM_CATEGORY_ID?.message
                    })}
                    isDisabled={
                      ![4, 5, 6].includes(watch(`MATERIAL_IN_PROCESS.${row.original.id}.ITEM.ITEM_CATEGORY_ID`)) ||
                      getValues('mode') === 'view' ||
                      isLockedMiP
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
        sortingFn: (rowA, rowB, columnId) => {
          const rowAId = rowA.original.id
          const rowBId = rowB.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          const materialA = materials[rowAId]
          const materialB = materials[rowBId]

          return materialA?.ITEM?.ITEM_CODE_FOR_SUPPORT_MES < materialB?.ITEM?.ITEM_CODE_FOR_SUPPORT_MES ? 1 : -1
        },
        filterFn: (row, id, filterValue) => {
          const rowId = row.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          return materials[rowId]?.ITEM?.ITEM_CODE_FOR_SUPPORT_MES?.toLowerCase().includes(filterValue.toLowerCase())
        },
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
                    isDisabled={getValues('mode') === 'view' || isLockedMiP}
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

                      trigger(`MATERIAL_IN_PROCESS.${row.original.id}.ITEM_CATEGORY`)

                      setValue('IS_EDIT_BOM', true)
                    }}
                    // isClearable
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
        size: 300,
        sortingFn: (rowA, rowB, columnId) => {
          const rowAId = rowA.original.id
          const rowBId = rowB.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          const materialA = materials[rowAId]
          const materialB = materials[rowBId]

          return materialA?.ITEM?.ITEM_INTERNAL_FULL_NAME < materialB?.ITEM?.ITEM_INTERNAL_FULL_NAME ? 1 : -1
        },
        filterFn: (row, id, filterValue) => {
          const rowId = row.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          return materials[rowId]?.ITEM?.ITEM_INTERNAL_FULL_NAME?.toLowerCase().includes(filterValue.toLowerCase())
        },
        Cell: ({ renderedCellValue, row, cell }) => {
          return <>{watch(`MATERIAL_IN_PROCESS.${row.original.id}.ITEM.ITEM_INTERNAL_FULL_NAME`)}</>
        }
      },
      {
        accessorKey: 'USAGE_QTY',
        header: 'USAGE QTY',
        sortingFn: (rowA, rowB, columnId) => {
          const rowAId = rowA.original.id
          const rowBId = rowB.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          const materialA = materials[rowAId]
          const materialB = materials[rowBId]

          return Number(materialA?.USAGE_QUANTITY ?? 0) < Number(materialB?.USAGE_QUANTITY ?? 0) ? 1 : -1
        },
        filterFn: (row, id, filterValue) => {
          const rowId = row.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          return Number(materials[rowId]?.USAGE_QUANTITY) === Number(filterValue)
        },
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
                    disabled={getValues('mode') === 'view' || isLockedMiP}
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
        size: 200,
        sortingFn: (rowA, rowB, columnId) => {
          const rowAId = rowA.original.id
          const rowBId = rowB.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          const materialA = materials[rowAId]
          const materialB = materials[rowBId]

          return materialA?.ITEM?.UNIT_OF_MEASUREMENT_NAME < materialB?.ITEM?.UNIT_OF_MEASUREMENT_NAME ? 1 : -1
        },
        filterFn: (row, id, filterValue) => {
          const rowId = row.original.id

          const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

          return materials[rowId]?.ITEM?.UNIT_OF_MEASUREMENT_NAME?.toLowerCase().includes(filterValue.toLowerCase())
        },
        Cell: ({ renderedCellValue, row, cell }) => {
          return <>{watch(`MATERIAL_IN_PROCESS.${row.original.id}.ITEM.UNIT_OF_MEASUREMENT_NAME`)}</>
        }
      }
    ],
    [errors, watch('MATERIAL_IN_PROCESS'), watch('MATERIAL_IN_PROCESS')?.length, isLockedMiP]
  )

  const customFilterFn = (rows, columnId, filterValue) => {
    return (
      rows?.filter(row => {
        const rowId = row.original.id

        const materials = getValues('MATERIAL_IN_PROCESS') ?? {}

        return (
          materials[rowId]?.PROCESS?.label?.toLowerCase().includes(filterValue.toLowerCase()) ||
          materials[rowId]?.ITEM_CATEGORY?.ITEM_CATEGORY_NAME?.toLowerCase().includes(filterValue.toLowerCase()) ||
          materials[rowId]?.ITEM?.ITEM_CODE_FOR_SUPPORT_MES?.toLowerCase().includes(filterValue.toLowerCase()) ||
          materials[rowId]?.ITEM?.ITEM_INTERNAL_FULL_NAME?.toLowerCase().includes(filterValue.toLowerCase()) ||
          materials[rowId]?.USAGE_QUANTITY?.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
          materials[rowId]?.ITEM?.UNIT_OF_MEASUREMENT_NAME?.toLowerCase().includes(filterValue.toLowerCase())
        )
      }) ?? []
    )
  }

  const table = useMaterialReactTable({
    autoResetPageIndex: false,
    columns,
    data: watch('MATERIAL_IN_PROCESS_ID') ?? [],
    enableEditing: true,
    // enableRowOrdering: true,
    enableRowOrdering: getValues('mode') !== 'view' && !isLockedMiP,
    enableSorting: true,
    enablePagination: false,
    enableRowNumbers: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableColumnOrdering: true,
    // onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: customFilterFn,
    // state: {
    //   // globalFilter: globalFilter
    //   // globalFilterFn: customFilterFn
    // },
    muiRowDragHandleProps: ({ table }) => ({
      onDragEnd: () => {
        const { draggingRow, hoveredRow } = table.getState()

        if (hoveredRow && draggingRow) {
          let data = getValues('MATERIAL_IN_PROCESS_ID') ?? []

          data.splice(hoveredRow.index, 0, data.splice(draggingRow.index, 1)[0])

          setValue('MATERIAL_IN_PROCESS_ID', [...data])
        }
      }
    }),
    muiTableContainerProps: {
      sx: {
        maxHeight: '60vh',
        minHeight: '60vh',
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
    renderRowActions: ({ row, table, cell }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <>
          <Tooltip title='Delete'>
            <IconButton
              disabled={getValues('mode') === 'view' || isLockedMiP}
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
            disabled={getValues('mode') === 'view' || isLockedMiP}
            variant='contained'
            startIcon={<i className='tabler-plus' />}
            onClick={() => handleAddDataRow()}
            // disabled={!!columnFilters?.length || isLockedBom}
          >
            Add New
          </Button>
          {isLockedMiP ? (
            <i
              className='tabler-lock'
              style={{
                color: 'var(--mui-palette-error-main)',
                cursor: 'pointer',
                alignSelf: 'center',
                marginLeft: '0.25rem'
              }}
              // onClick={() => {
              //   setIsLockedMiP(false)
              // }}
            />
          ) : (
            <i
              className='tabler-lock-open-2'
              style={{
                color: 'var(--mui-palette-success-main)',
                cursor: 'pointer',
                alignSelf: 'center',
                marginLeft: '0.25rem'
              }}
              // onClick={() => {
              //   setIsLockedMiP(true)
              // }}
            />
          )}
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
