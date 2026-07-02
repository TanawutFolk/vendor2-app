import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import type {
  MRT_RowSelectionState,
  MRT_TableOptions,
  MRT_ColumnDef,
  MRT_Row,
  MRT_ColumnOrderState
} from 'material-react-table'

import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormContext, useFormState } from 'react-hook-form'

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography
} from '@mui/material'

import classNames from 'classnames'

import DeleteIcon from '@mui/icons-material/Delete'

import FolderIcon from '@mui/icons-material/Folder'

import SearchIcon from '@mui/icons-material/Search'

import type { ListProps } from '@mui/material/List'

import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import { RowSelection } from '@tanstack/react-table'

import type {
  SearchResultTableI,
  ParamApiSearchResultTableI
} from '@/libs/material-react-table/types/SearchResultTable'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'
import StatusOption from '@/libs/react-select/option/StatusOption'

// types Imports
// import type { FormData } from './page'
import type { FormData } from './validationSchema'

// React Query Imports
// import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProfileData'

// import { MENU_ID } from './env'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'

import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import {
  fetchProductTypeByLikeProductTypeNameAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'

import { PREFIX_QUERY_KEY, useSearchSct } from '@/_workspace/react-query/hooks/useStandardCostData'
import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import type { StandardCostI } from '@/_workspace/types/sct/StandardCostType'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>

  // sctSelectList: Dispatch<SetStateAction<string>>
  // setSctSelectList: Dispatch<SetStateAction<string>>
}

const initState: SearchResultTableI = {
  queryPageIndex: 0,
  queryPageSize: 10,
  totalCount: 0,
  querySortBy: [],
  withRowBorders: true,
  withTableBorder: false,
  withColumnBorders: false,
  striped: true
}

interface ParamApiSearchSctI extends ParamApiSearchResultTableI {
  PRODUCT_CATEGORY_ID?: number | ''
  PRODUCT_MAIN_ID?: number | ''
  PRODUCT_SUB_ID?: number | ''
  PRODUCT_TYPE_ID?: number | ''
  ITEM_CODE_FOR_SUPPORT_MES?: number | ''
  FLOW_ID?: number | ''
  PROCESS_NAME?: string | ''
  BOM_ID?: string | ''
}

const getUrlParamSearch = ({
  PRODUCT_CATEGORY_ID = '',
  PRODUCT_MAIN_ID = '',
  PRODUCT_SUB_ID = '',
  PRODUCT_TYPE_ID = '',
  ITEM_CODE_FOR_SUPPORT_MES = '',
  PROCESS_NAME = '',
  FLOW_ID = '',
  BOM_ID = ''
}: ParamApiSearchSctI): object => {
  const params = {
    PRODUCT_CATEGORY_ID: PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: PRODUCT_MAIN_ID || '',
    PRODUCT_SUB_ID: PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_ID: PRODUCT_TYPE_ID || '',
    ITEM_CODE_FOR_SUPPORT_MES: ITEM_CODE_FOR_SUPPORT_MES || '',
    FLOW_ID: FLOW_ID || '',
    BOM_ID: BOM_ID || '',
    PROCESS_NAME: PROCESS_NAME || '',
    Start: 0,
    Limit: 10
  }

  //console.log(params)
  return params
}

const BatchChangeMaterialStepOne = ({ setIsEnableFetching, data2, setData2 }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, watch, handleSubmit } = useFormContext<FormData>()
  const [isFetchData, setIsFetchData] = useState(false)
  const [checked, setChecked] = useState<StandardCostI[]>([])
  const [sctList, setSctList] = useState<StandardCostI[]>([])
  const [data1, setData1] = useState<StandardCostI[]>([])
  const [draggingRow, setDraggingRow] = useState<MRT_Row<StandardCostI> | null>(null)
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      productCategory: null,
      productMain: null,
      productSub: null,
      productType: null,
      itemCodeForSupportMes: null,
      process: '',
      bom: '',
      flow: ''
    })

    // setSctList([])
    // setSctSelectedList([])
  }

  const paramForSearch: any = {
    PRODUCT_CATEGORY_ID: watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: watch('searchFilters.productMain')?.PRODUCT_MAIN_ID || '',
    PRODUCT_SUB_ID: watch('searchFilters.productSub')?.PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_ID: watch('searchFilters.productType')?.PRODUCT_TYPE_ID || '',
    PROCESS_NAME: watch('searchFilters.process') || '',
    BOM_CODE: watch('searchFilters.bom') || '',
    FLOW_NAME: watch('searchFilters.fow') || '',
    ITEM_FOR_SUPPORT_MES: watch('searchFilters.itemCodeForSupportMes') || ''

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
  } = useSearchSct(getUrlParamSearch(paramForSearch), isFetchData)

  useEffect(() => {
    if (isFetching === false) {
      //console.log(dataFormSearch?.data?.ResultOnDb || [])

      setData1(dataFormSearch?.data?.ResultOnDb || [])
      setIsFetchData(false)
    }
  }, [isFetching])

  // Function : react-hook-form
  const onSubmit: SubmitHandler<FormData> = data => {
    setIsFetchData(true)
    console.log('KEY', PREFIX_QUERY_KEY)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  const columns = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    () => [
      {
        accessorKey: 'SCT_CODE_FOR_SUPPORT_MES',
        header: 'SCT CODE'
      },
      {
        accessorKey: 'FISCAL_YEAR',
        header: 'FISCAL YEAR'
      },
      {
        accessorKey: 'ITEM_CATEGORY_NAME',
        header: 'ITEM CATEGORY NAME'
      },
      {
        accessorKey: 'SCT_CODE',
        header: 'SCT REVISION CODE'
      }
    ],
    []
  )

  // const [data1, setData1] = useState<StandardCostI[]>(() => data.slice(0, 3))
  // const [data2, setData2] = useState<StandardCostI[]>(() => data.slice(3, 5))

  const commonTableProps: Partial<MRT_TableOptions<StandardCostI>> & {
    columns: MRT_ColumnDef<StandardCostI>[]
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
      columnOrder: ['SCT_CODE_FOR_SUPPORT_MES', 'FISCAL_YEAR', 'ITEM_CATEGORY_NAME', 'mrt-row-actions']
    },
    onDraggingRowChange: setDraggingRow,
    state: { draggingRow, density: 'compact', rowSelection }
  }

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<StandardCostI>) => {
    setData2(data2 => data2.filter(d => d.SCT_ID !== row.original.SCT_ID))
  }

  const table1 = useMaterialReactTable({
    ...commonTableProps,
    enableRowDragging: true,
    enableRowSelection: true,
    data: data1,
    getRowId: originalRow => `table-1_${originalRow.SCT_CODE}`,
    onRowSelectionChange: setRowSelection,
    muiRowDragHandleProps: {
      onDragEnd: () => {
        if (hoveredTable === 'table-2') {
          setData2(data2 => [...data2, draggingRow!.original])
          setData1(data1 => data1.filter(d => d !== draggingRow!.original))
        }

        setHoveredTable(null)
      }
    },
    muiTableBodyCellProps: row => ({
      onDoubleClick: event => {
        // console.log('DATA', row?.row?.original)
        if (row?.row?.original !== undefined) {
          setData2(data2 => [...data2, row?.row?.original])
          setData1(data1 => data1.filter(d => d !== row?.row?.original))
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
    muiTableHeadCellProps: {
      //no useTheme hook needed, just use the `sx` prop with the theme callback
      sx: theme => ({
        color: theme.palette.primary.main
      })
    },
    renderTopToolbarCustomActions: () => (
      <Typography color='primary.main' component='span' variant='h5'>
        Standard Cost List
      </Typography>
    ),
    renderBottomToolbar: () => (
      <>
        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography>Total {data1?.length} entries</Typography>
        </div>
      </>
    )
  })

  const table2 = useMaterialReactTable({
    ...commonTableProps,
    enableRowDragging: false,
    enableRowActions: true,
    enableRowSelection: false,
    data: data2,
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
    getRowId: originalRow => `table-2-${originalRow.SCT_CODE_FOR_SUPPORT_MES}`,
    muiRowDragHandleProps: {
      onDragEnd: () => {
        if (hoveredTable === 'table-1') {
          setData1(data1 => [...data1, draggingRow!.original])
          setData2(data2 => data2.filter(d => d !== draggingRow!.original))
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
      sx: theme => ({
        color: theme.palette.success.main
      })
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
      <Typography color='success.main' component='span' variant='h5'>
        Standard Cost For Batch BOM List
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
          <Typography>Total {data2?.length} entries</Typography>
          <div className='flex justify-end gap-2'>
            <Button
              sx={{}}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this data?')) {
                  setData2([])
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

  const handleCheckedSctSelectList = (): any => {
    const sctCodeSelected = Object.keys(rowSelection).map(item => {
      return item.split('_')[1]
    })

    setData2(prev => {
      let result = prev

      const sctCodeSelectedDetails = data1.filter(d => sctCodeSelected.includes(d.SCT_CODE))

      sctCodeSelectedDetails.forEach(item => {
        result = result.filter(d => d.SCT_ID !== item.SCT_ID)
      })

      return [...result, ...sctCodeSelectedDetails]
    })

    setData1(prev => {
      return prev.filter(d => !sctCodeSelected.includes(d.SCT_CODE))
    })

    setRowSelection({})

    // setData2(data2 => [...data2, row?.row?.original])
    // setData1(data1 => data1.filter(d => d !== row?.row?.original))
  }

  return (
    <>
      <Grid item xs={12}>
        {/* <Divider textAlign='sctList'> */}
        <Chip label='Product Group' sx={{ color: ' var(--primary-color)' }} variant='tonal' size='small' />
        {/* </Divider> */}
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={3} lg={3}>
          <Controller
            name='searchFilters.productCategory'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom
                {...fieldProps}
                isClearable
                cacheOptions
                defaultOptions
                loadOptions={inputValue => {
                  return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                }}
                onChange={value => {
                  onChange(value)
                  setValue('searchFilters.productMain', null)
                  setValue('searchFilters.productSub', null)
                  setValue('searchFilters.productType', null)
                }}
                getOptionLabel={data => data?.PRODUCT_CATEGORY_NAME || ''}
                getOptionValue={data => data?.PRODUCT_CATEGORY_ID?.toString() || ''}
                classNamePrefix='select'
                label='Product Category'
                placeholder='Enter Product Category'

                // autoComplete='off'
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3} lg={3}>
          <Controller
            name='searchFilters.productMain'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom
                {...fieldProps}
                isClearable
                cacheOptions
                defaultOptions
                key={watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID}
                // value={watch('searchFilters.productMain')?.PRODUCT_MAIN_ID}
                loadOptions={inputValue => {
                  if (getValues('searchFilters.productCategory')) {
                    return fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                      inputValue,
                      1,
                      watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID
                    )
                  } else {
                    return fetchProductMainByLikeProductMainNameAndInuse(inputValue || '', 1)
                  }
                }}
                onChange={value => {
                  onChange(value)
                  setValue('searchFilters.productSub', null)
                  setValue('searchFilters.productType', null)

                  // setValue('searchFilters.process', null)
                }}
                getOptionLabel={data => data?.PRODUCT_MAIN_NAME || ''}
                getOptionValue={data => data?.PRODUCT_MAIN_ID?.toString() || ''}
                classNamePrefix='select'
                label='Product Main'
                placeholder='Enter Product Main'

                // autoComplete='off'
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3} lg={3}>
          <Controller
            name='searchFilters.productSub'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom
                {...fieldProps}
                isClearable
                cacheOptions
                defaultOptions
                key={
                  watch('searchFilters.productMain')?.PRODUCT_MAIN_ID ||
                  watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID
                }
                loadOptions={(value, callback) =>
                  watch('searchFilters.productCategory') && !watch('searchFilters.productMain')
                    ? callback(null)
                    : watch('searchFilters.productMain')
                      ? fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                          value || '',
                          1,
                          watch('searchFilters.productMain').PRODUCT_MAIN_ID
                        )
                      : fetchProductSubByLikeProductSubNameAndInuse(value || '', 1)
                }
                onChange={value => {
                  onChange(value)
                  setValue('searchFilters.productType', null)
                }}
                getOptionLabel={data => data?.PRODUCT_SUB_NAME || ''}
                getOptionValue={data => data?.PRODUCT_SUB_ID?.toString() || ''}
                classNamePrefix='select'
                label='Product Sub'
                placeholder='Enter Product Sub'

                // autoComplete='off'
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3} lg={3}>
          <Controller
            name='searchFilters.productType'
            control={control}
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom
                {...fieldProps}
                isClearable
                cacheOptions
                defaultOptions
                key={
                  watch('searchFilters.productSub')?.PRODUCT_SUB_ID ||
                  watch('searchFilters.productMain')?.PRODUCT_MAIN_ID ||
                  watch('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID
                }
                loadOptions={(value, callback) =>
                  watch('searchFilters.productSub')
                    ? fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse(
                        value || '',
                        watch('searchFilters.productSub').PRODUCT_SUB_ID
                      )
                    : watch('searchFilters.productCategory') || watch('searchFilters.productMain')
                      ? callback(null)
                      : fetchProductTypeByLikeProductTypeNameAndInuse(value || '')
                }
                onChange={value => {
                  onChange(value)
                }}
                getOptionLabel={data => data?.PRODUCT_TYPE_NAME || ''}
                getOptionValue={data => data?.PRODUCT_TYPE_ID?.toString() || ''}
                classNamePrefix='select'
                label='Product Type'
                placeholder='Enter Product Type'

                // autoComplete='off'
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Chip label='Standard Cost' sx={{ color: ' var(--primary-color)' }} variant='tonal' size='small' />
        </Grid>
        <Grid item xs={12} sm={3} lg={3}>
          <Controller
            control={control}
            name='searchFilters.itemCodeForSupportMes'
            render={({ field: { ...fieldProps } }) => (
              <CustomTextField
                label='Item Code'
                {...fieldProps}
                fullWidth
                placeholder='Enter Item Code'
                autoComplete='off'
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3} lg={3}>
          <Controller
            control={control}
            name='searchFilters.process'
            render={({ field: { ...fieldProps } }) => (
              <CustomTextField
                label='Process Name'
                {...fieldProps}
                fullWidth
                placeholder='Enter Process Name'
                autoComplete='off'
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3} lg={3}>
          <Controller
            control={control}
            name='searchFilters.bom'
            render={({ field: { ...fieldProps } }) => (
              <CustomTextField label='BOM' {...fieldProps} fullWidth placeholder='Enter BOM' autoComplete='off' />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={3} lg={3}>
          <Controller
            control={control}
            name='searchFilters.flow'
            render={({ field: { ...fieldProps } }) => (
              <CustomTextField label='Flow' {...fieldProps} fullWidth placeholder='Enter Flow' autoComplete='off' />
            )}
          />
        </Grid>
      </Grid>
      <Grid container className='mbs-0' spacing={6}>
        <Grid item xs={12} className='flex gap-4'>
          <Button
            onClick={() => handleSubmit(onSubmit, onError)()}
            variant='contained'
            type='button'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <CircularProgress size='sm' />
                <span className='ms-50'>Searching...</span>
              </>
            ) : (
              <>Search</>
            )}
          </Button>
          <Button variant='tonal' color='secondary' type='reset' onClick={onResetFormSearch}>
            Clear
          </Button>
        </Grid>
      </Grid>
      <>
        <div className='mt-3'>
          <Grid container spacing={6} sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <Grid item>
              <MaterialReactTable table={table1} />
            </Grid>
            <Grid item>
              <Grid container direction='column' sx={{ alignItems: 'center' }}>
                <Button
                  sx={{ my: 0.5 }}
                  color='primary'
                  variant='tonal'
                  size='large'
                  onClick={handleCheckedSctSelectList}
                  disabled={data1.length === 0}
                  aria-label='move selected sctSelectList'
                >
                  <i className='tabler-chevron-right  text-[30px]' />
                </Button>
              </Grid>
            </Grid>
            <Grid item>
              <MaterialReactTable table={table2} />
            </Grid>
          </Grid>
        </div>
      </>
    </>
  )
}

export default BatchChangeMaterialStepOne
