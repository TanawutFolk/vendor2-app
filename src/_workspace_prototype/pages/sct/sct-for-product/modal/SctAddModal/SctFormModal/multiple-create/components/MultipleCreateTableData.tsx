import { useEffect, useMemo, useState } from 'react'

import {
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography
} from '@mui/material'

import { styled } from '@mui/material/styles'
import type { ListProps } from '@mui/material/List'
import { Controller, useFormContext } from 'react-hook-form'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import FolderIcon from '@mui/icons-material/Folder'
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined'

import {
  MaterialReactTable,
  MRT_Row,
  MRT_TableOptions,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState
} from 'material-react-table'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import CustomTextField from '@/components/mui/TextField'
import { fetchProcessByLikeProcessAndInuse } from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProcess'
import { fetchItemCodeForSupportMesAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemManufacturing'

import type { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import {
  PREFIX_QUERY_KEY,
  useSearchSctBySctSelectedWithCondition
} from '@/_workspace/react-query/hooks/useStandardCostData'

// Type Imports
import type { ThemeColor } from '@core/types'

import { ToastMessageError } from '@/components/ToastMessage'
import { useGetBomDetailByBomId } from '@/_workspace/react-query/hooks/useBomData'
import { useSearchProductTypeByProductGroup } from '@/_workspace/react-query/hooks/useProductTypeData'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import SelectCustom from '@/components/react-select/SelectCustom'
import { fetchBomByLikeProductTypeIdAndCondition } from '@/_workspace/react-select/async-promise-load-options/fetchBom'
import { toast } from 'react-toastify'

const MultipleCreateTableData = ({ isEnableFetching, setIsEnableFetching, dataProductTypeSelected }: any) => {
  // States
  const { control, handleSubmit, getValues, watch, reset, setValue, unregister, trigger } = useFormContext<FormData>()
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [dataList, setDataList] = useState<[]>([])

  const queryClient = useQueryClient()

  const getUrlParamSearch = (): object => {
    const params = {
      PRODUCT_TYPE_NAME: watch('PRODUCT_TYPE_NAME') || '',
      PRODUCT_TYPE_CODE: watch('PRODUCT_TYPE_CODE') || '',
      PRODUCT_CATEGORY_ID: watch('PRODUCT_CATEGORY') || '',
      PRODUCT_MAIN_ID: watch('PRODUCT_MAIN') || '',
      PRODUCT_SUB_ID: watch('PRODUCT_SUB') || ''
    }

    return params
  }

  // const { isRefetching, isLoading, data, isError, refetch, isFetching } = useSearchProductTypeByProductGroup(
  //   getUrlParamSearch(),
  //   isEnableFetching
  // )

  // useEffect(() => {
  //   if (isFetching === false) {
  //     setIsEnableFetching(false)
  //   }
  // }, [isFetching])

  const handleEditSwitch = async (e: any) => {
    // console.log(e.target);
    // console.log(refRowSelected.current);

    const [NAME, PRODUCT_TYPE_ID] = e.target.name.split('-')

    const dataItem = {
      PRODUCT_TYPE_ID: PRODUCT_TYPE_ID,
      CONDITION: NAME
    }

    await fetchBomByLikeProductTypeIdAndCondition(dataItem).then(responseJson => {
      switch (NAME) {
        case 'BOM_ACTUAL':
          if (responseJson) {
            setValue(`BOM_ACTUAL-${Number(PRODUCT_TYPE_ID)}`, e.target.checked)
            setValue(`BOM_THEN-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`MES-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`BUDGET-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`PRICE-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`BOM_ACTUAL-${Number(PRODUCT_TYPE_ID)}-BOM-CODE`, responseJson?.BOM_CODE)
          } else {
            toast.error('Data BOM Actual Not Found')
            setValue(`BOM_ACTUAL-${Number(PRODUCT_TYPE_ID)}`, !e.target.checked)
          }

          break

        case 'BOM_THEN':
          if (responseJson) {
            setValue(`BOM_ACTUAL-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`BOM_THEN-${Number(PRODUCT_TYPE_ID)}`, e.target.checked)
            setValue(`MES-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`BUDGET-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`PRICE-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`BOM_THEN-${Number(PRODUCT_TYPE_ID)}-BOM-CODE`, responseJson?.BOM_CODE)
          } else {
            toast.error('Data BOM Then Not Found')
            setValue(`BOM_THEN-${Number(PRODUCT_TYPE_ID)}`, !e.target.checked)
          }
          break

        case 'MES':
          if (responseJson) {
            setValue(`BOM_THEN-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`MES-${Number(PRODUCT_TYPE_ID)}`, e.target.checked)
            setValue(`BUDGET-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`PRICE-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`MES-${Number(PRODUCT_TYPE_ID)}-BOM-CODE`, responseJson?.BOM_CODE)
            setValue(`BOM_ACTUAL-${Number(PRODUCT_TYPE_ID)}`, 0)
          } else {
            toast.error('Data MES Not Found')
            setValue(`MES-${Number(PRODUCT_TYPE_ID)}`, !e.target.checked)
          }
          break

        case 'BUDGET':
          if (responseJson) {
            setValue(`BOM_ACTUAL-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`BOM_THEN-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`MES-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`BUDGET-${Number(PRODUCT_TYPE_ID)}`, e.target.checked)
            setValue(`PRICE-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`BUDGET-${Number(PRODUCT_TYPE_ID)}-BOM-CODE`, responseJson?.BOM_CODE)
          } else {
            toast.error('Data Budget Not Found')
            setValue(`BUDGET-${Number(PRODUCT_TYPE_ID)}`, !e.target.checked)
          }
          break

        case 'PRICE':
          if (responseJson) {
            setValue(`BOM_ACTUAL-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`BOM_THEN-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`MES-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`BUDGET-${Number(PRODUCT_TYPE_ID)}`, 0)
            setValue(`PRICE-${Number(PRODUCT_TYPE_ID)}`, e.target.checked)
            setValue(`PRICE-${Number(PRODUCT_TYPE_ID)}-BOM-CODE`, responseJson?.BOM_CODE)
          } else {
            toast.error('Data Price Not Found')
            setValue(`PRICE-${Number(PRODUCT_TYPE_ID)}`, !e.target.checked)
          }
          break
      }
    })
    // setValue(`BOM-ACTUAL-${Number(PRODUCT_TYPE_ID)}-NAME`, 'TEST')
  }

  const columns = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    () => [
      {
        // id: 'employee', //id used to define `group` column
        header: 'Product Group',
        columns: [
          {
            accessorKey: 'PRODUCT_TYPE_CODE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'Product Type Code'
          },
          {
            accessorKey: 'PRODUCT_TYPE_NAME', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'Product Type Name'
          },
          {
            accessorKey: 'PRODUCT_SUB_NAME', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'Product Sub'
          },
          {
            accessorKey: 'PRODUCT_MAIN_NAME', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'Product Main'
          },
          {
            accessorKey: 'PRODUCT_CATEGORY_NAME', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'Product Category'
          }
        ]
      },
      {
        header: 'Create From BOM',
        columns: [
          {
            accessorKey: 'BOM', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'BOM Actual',
            // Header: <Switch color='success' size='medium' />,
            // Cell: ({ row }) => <Checkbox checked={row.original.bomActual} />
            Cell: ({ renderedCellValue, row, cell }) => {
              return (
                <>
                  <Controller
                    control={control}
                    name={`BOM_ACTUAL-${Number(row.original.PRODUCT_TYPE_ID)}`}
                    defaultValue={false}
                    render={({ field: { ref, value, onChange, ...fieldProps } }) => {
                      return (
                        <>
                          <FormControlLabel
                            control={
                              <Switch
                                style={{
                                  cursor: 'pointer'
                                }}
                                color='success'
                                checked={value == 1 ? true : false}
                                size='medium'
                                innerRef={ref}
                                onChange={e => {
                                  onChange(e.target.checked)
                                  e.target.name = `BOM_ACTUAL-${Number(row.original.PRODUCT_TYPE_ID)}`
                                  handleEditSwitch(e)
                                }}
                                {...fieldProps}
                              />
                            }
                            label={
                              value == true && (
                                <>
                                  <div className='flex items-center'>
                                    <IconButton
                                    // onClick={() => handleClickOpenModalView(row)}
                                    >
                                      <i className='tabler-eye text-[22px] text-textSecondary' />
                                    </IconButton>
                                    <Typography>
                                      {watch(`BOM_ACTUAL-${Number(row.original.PRODUCT_TYPE_ID)}-BOM-CODE`)?.toString()}
                                    </Typography>
                                  </div>
                                </>
                              )
                            }
                          />
                        </>
                      )
                    }}
                  />
                </>
              )
            }
          },
          {
            accessorKey: 'BOM_THEN', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'BOM Then',
            Cell: ({ renderedCellValue, row, cell }) => {
              return (
                <>
                  <Controller
                    control={control}
                    name={`BOM_THEN-${Number(row.original.PRODUCT_TYPE_ID)}`}
                    defaultValue={false}
                    render={({ field: { ref, value, onChange, ...fieldProps } }) => {
                      return (
                        <>
                          <FormControlLabel
                            control={
                              <Switch
                                style={{
                                  cursor: 'pointer'
                                }}
                                color='success'
                                checked={value == 1 ? true : false}
                                size='medium'
                                innerRef={ref}
                                onChange={e => {
                                  onChange(e.target.checked)
                                  e.target.name = `BOM_THEN-${Number(row.original.PRODUCT_TYPE_ID)}`
                                  handleEditSwitch(e)
                                }}
                                {...fieldProps}
                              />
                            }
                            label={
                              value == true && (
                                <>
                                  <div className='flex items-center'>
                                    <IconButton
                                    // onClick={() => handleClickOpenModalView(row)}
                                    >
                                      <i className='tabler-eye text-[22px] text-textSecondary' />
                                    </IconButton>
                                    <Typography>
                                      {watch(`BOM_THEN-${Number(row.original.PRODUCT_TYPE_ID)}-BOM-CODE`)?.toString()}
                                    </Typography>
                                  </div>
                                </>
                              )
                            }
                          />
                        </>
                      )
                    }}
                  />
                </>
              )
            }
          }
        ]
      }
      // {
      //   header: 'Create From SCT Tag',
      //   columns: [
      //     {
      //       accessorKey: 'MES', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
      //       header: 'MES',
      //       Cell: ({ renderedCellValue, row, cell }) => {
      //         return (
      //           <>
      //             <Controller
      //               control={control}
      //               name={`MES-${Number(row.original.PRODUCT_TYPE_ID)}`}
      //               defaultValue={false}
      //               render={({ field: { ref, value, onChange, ...fieldProps } }) => {
      //                 return (
      //                   <>
      //                     <FormControlLabel
      //                       control={
      //                         <Switch
      //                           style={{
      //                             cursor: 'pointer'
      //                           }}
      //                           color='success'
      //                           checked={value == 1 ? true : false}
      //                           size='medium'
      //                           innerRef={ref}
      //                           onChange={e => {
      //                             onChange(e.target.checked)
      //                             e.target.name = `MES-${Number(row.original.PRODUCT_TYPE_ID)}`
      //                             handleEditSwitch(e)
      //                           }}
      //                           {...fieldProps}
      //                         />
      //                       }
      //                       label={
      //                         value == true && (
      //                           <>
      //                             <div className='flex items-center'>
      //                               <IconButton
      //                               // onClick={() => handleClickOpenModalView(row)}
      //                               >
      //                                 <i className='tabler-eye text-[22px] text-textSecondary' />
      //                               </IconButton>
      //                               <Typography>
      //                                 {watch(`MES-${Number(row.original.PRODUCT_TYPE_ID)}-BOM-CODE`)?.toString()}
      //                               </Typography>
      //                             </div>
      //                           </>
      //                         )
      //                       }
      //                     />
      //                   </>
      //                 )
      //               }}
      //             />
      //           </>
      //         )
      //       }
      //     },
      //     {
      //       accessorKey: 'BUDGET', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
      //       header: 'Budget',
      //       Cell: ({ renderedCellValue, row, cell }) => {
      //         return (
      //           <>
      //             <Controller
      //               control={control}
      //               name={`BUDGET-${Number(row.original.PRODUCT_TYPE_ID)}`}
      //               defaultValue={false}
      //               render={({ field: { ref, value, onChange, ...fieldProps } }) => {
      //                 return (
      //                   <>
      //                     <FormControlLabel
      //                       control={
      //                         <Switch
      //                           style={{
      //                             cursor: 'pointer'
      //                           }}
      //                           color='success'
      //                           checked={value == 1 ? true : false}
      //                           size='medium'
      //                           innerRef={ref}
      //                           onChange={e => {
      //                             onChange(e.target.checked)
      //                             e.target.name = `BUDGET-${Number(row.original.PRODUCT_TYPE_ID)}`
      //                             handleEditSwitch(e)
      //                           }}
      //                           {...fieldProps}
      //                         />
      //                       }
      //                       label={
      //                         value == true && (
      //                           <>
      //                             <div className='flex items-center'>
      //                               <IconButton
      //                               // onClick={() => handleClickOpenModalView(row)}
      //                               >
      //                                 <i className='tabler-eye text-[22px] text-textSecondary' />
      //                               </IconButton>
      //                               <Typography>
      //                                 {watch(`BUDGET-${Number(row.original.PRODUCT_TYPE_ID)}-BOM-CODE`)?.toString()}
      //                               </Typography>
      //                             </div>
      //                           </>
      //                         )
      //                       }
      //                     />
      //                   </>
      //                 )
      //               }}
      //             />
      //           </>
      //         )
      //       }
      //     },
      //     {
      //       accessorKey: 'PRICE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
      //       header: 'Price',
      //       Cell: ({ renderedCellValue, row, cell }) => {
      //         return (
      //           <>
      //             <Controller
      //               control={control}
      //               name={`PRICE-${Number(row.original.PRODUCT_TYPE_ID)}`}
      //               defaultValue={false}
      //               render={({ field: { ref, value, onChange, ...fieldProps } }) => {
      //                 return (
      //                   <>
      //                     <FormControlLabel
      //                       control={
      //                         <Switch
      //                           style={{
      //                             cursor: 'pointer'
      //                           }}
      //                           color='success'
      //                           checked={value == 1 ? true : false}
      //                           size='medium'
      //                           innerRef={ref}
      //                           onChange={e => {
      //                             onChange(e.target.checked)
      //                             e.target.name = `PRICE-${Number(row.original.PRODUCT_TYPE_ID)}`
      //                             handleEditSwitch(e)
      //                           }}
      //                           {...fieldProps}
      //                         />
      //                       }
      //                       label={
      //                         value == true && (
      //                           <>
      //                             <div className='flex items-center'>
      //                               <IconButton
      //                               // onClick={() => handleClickOpenModalView(row)}
      //                               >
      //                                 <i className='tabler-eye text-[22px] text-textSecondary' />
      //                               </IconButton>
      //                               <Typography>
      //                                 {watch(`PRICE-${Number(row.original.PRODUCT_TYPE_ID)}-BOM-CODE`)?.toString()}
      //                               </Typography>
      //                             </div>
      //                           </>
      //                         )
      //                       }
      //                     />
      //                   </>
      //                 )
      //               }}
      //             />
      //           </>
      //         )
      //       }
      //     }
      //   ]
      // },
      // {
      //   header: 'Create From Other',
      //   columns: [
      //     {
      //       accessorKey: 'SCT_LAST_UPDATE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
      //       header: 'SCT Last Update Date',
      //       Cell: ({ row }) => <TextField type='date' value={row.original.sctLastUpdateDate} onChange={() => {}} />
      //     },
      //     {
      //       accessorKey: 'SCT_OTHER', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
      //       header: 'SCT Other (Select By Yourself)',
      //       Cell: ({ row }) => (
      //         <Select value={row.original.sctOther}>
      //           <MenuItem value='option1'>Option 1</MenuItem>
      //           <MenuItem value='option2'>Option 2</MenuItem>
      //           <MenuItem value='option3'>Option 3</MenuItem>
      //         </Select>
      //       )
      //     }
      //   ]
      // }
    ],
    []
  )

  const onClickCheck = (): any => {
    console.log('---DATA---', dataList)
  }

  const table = useMaterialReactTable({
    columns,
    enableRowActions: false,
    enableEditing: false,
    enableRowOrdering: false,
    enableSorting: false,
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
    data: dataProductTypeSelected || [],
    onRowSelectionChange: setRowSelection,

    //getRowId: originalRow => `table_${originalRow.SCT_CODE}`,
    muiTableBodyRowProps: ({ row }) => ({
      sx: { cursor: 'pointer', overflow: 'none', position: 'static' }
    }),

    muiTableContainerProps: {
      // sx: { minWidth: '650px', maxWidth: '660px', maxHeight: '420px', minHeight: '420px', overflow: 'scroll' }
    },
    muiTableHeadProps: {
      sx: {
        position: 'sticky',
        top: '0',
        zIndex: '100000',
        borderLeftColor: 'var(--bs-primary)',
        borderRightColor: 'var(--bs-primary)'
      }
    },
    muiTableHeadCellProps: {
      sx: {
        // borderColor: '1px solid var(--bs-primary)'
        borderWidth: '0.5px'
      }
    },

    renderBottomToolbar: () => (
      <>
        {/* <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography>Total {dataProductTypeSelected?.length} entries</Typography>
        </div> */}
      </>
    )
  })

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Grid className='mt-3'>
            <MaterialReactTable table={table} />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default MultipleCreateTableData
