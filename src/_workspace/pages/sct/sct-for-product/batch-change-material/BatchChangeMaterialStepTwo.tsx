import { fetchItemCodeForSupportMesAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemManufacturing'
import { fetchProcessByLikeProcessAndInuse } from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProcess'
import CustomTextField from '@/components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ListProps } from '@mui/material/List'
import { Controller, set, useFormContext } from 'react-hook-form'
// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import FolderIcon from '@mui/icons-material/Folder'
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined'
import { useEffect, useMemo, useState } from 'react'
import {
  MaterialReactTable,
  MRT_Row,
  MRT_TableOptions,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState
} from 'material-react-table'
import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import {
  PREFIX_QUERY_KEY,
  useSearchSctBySctSelectedWithCondition
} from '@/_workspace/react-query/hooks/useStandardCostData'
// Type Imports
import type { ThemeColor } from '@core/types'
import { get } from 'http'
import { ToastMessageError } from '@/components/ToastMessage'
import { useGetBomDetailByBomId } from '@/_workspace/react-query/hooks/useBomData'
import { fetchBomDetailsByListBomId } from '@/_workspace/react-select/async-promise-load-options/fetchBom'

const StyledList = styled(List)<ListProps>(({ theme }) => ({
  '& .MuiListItem-container': {
    border: '1px solid var(--mui-palette-divider)',
    '&:first-of-type': {
      borderTopLeftRadius: 'var(--mui-shape-borderRadius)',
      borderTopRightRadius: 'var(--mui-shape-borderRadius)'
    },
    '&:last-child': {
      borderBottomLeftRadius: 'var(--mui-shape-borderRadius)',
      borderBottomRightRadius: 'var(--mui-shape-borderRadius)'
    },
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '& .MuiListItemText-root': {
      marginTop: 0,
      '& .MuiTypography-root': {
        fontWeight: 500
      }
    }
  }
}))

const BatchChangeMaterialStepTwo = ({ data2, dataForBatchChange, setDataForBatchChange }: any) => {
  // States
  const { control, handleSubmit, getValues, watch, reset, setValue, unregister, trigger } = useFormContext<FormData>()
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [isSearching, setIsSearching] = useState(false)
  const [sctSelectedList, setSctSelectedList] = useState<StandardCostI[]>([])
  const [dataInitial, setDataInitial] = useState<any[]>([])
  const [conditionList, setConditionList] = useState<any[]>([])
  const [dataList, setDataList] = useState<[]>([])
  const [isFetchingData, setIsFetchingData] = useState(false)
  let dataDuplicate: any[] = []
  const queryClient = useQueryClient()

  const getUrlParamSearch = (sctSelectedFromTable: StandardCostI): object => {
    let sctList = []

    for (let i = 0; i < sctSelectedFromTable.length; i++) {
      const element = sctSelectedFromTable[i]['SCT_ID']
      let dataItem = {
        SCT_ID: element
      }
      sctList.push(dataItem)
    }

    const params = {
      PROCESS_NAME: getValues('searchFilters.process-before')?.PROCESS_NAME || '',
      ITEM_CODE_FOR_SUPPORT_MES: getValues('searchFilters.material-before')?.ITEM_CODE_FOR_SUPPORT_MES,
      LIST_SCT: sctList
    }

    return params
  }

  const getUrlParamSearchBomDetail = (dataBom: StandardCostI): object => {
    let bomList = []

    for (let i = 0; i < dataBom?.length; i++) {
      const element = dataBom[i]

      let dataItem = {
        // SCT_CODE_FOR_SUPPORT_MES: element['SCT_CODE_FOR_SUPPORT_MES'],
        BOM_ID: element['BOM_ID'],
        SCT_ID: element['SCT_ID']
      }
      bomList.push(dataItem)
    }

    const params = {
      LIST_DATA: bomList
    }

    return params
  }

  // Set hook useEffect
  useEffect(() => {
    setValue('searchFilters.action', resultAction())
    setIsSearching(false)
    setDataInitial([])
  }, [
    watch('searchFilters.material-before')?.ITEM_CODE_FOR_SUPPORT_MES,
    watch('searchFilters.material-after')?.ITEM_CODE_FOR_SUPPORT_MES,
    watch('searchFilters.process-before')?.PROCESS_ID,
    watch('searchFilters.process-after')?.PROCESS_ID,
    watch('searchFilters.usage-after')
  ])

  useEffect(() => {
    if (isSearching == true) {
    }
  }, [isSearching])

  const {
    isRefetching,
    isLoading,
    data: dataFormSearch,
    isError,
    refetch,
    isFetching,
    isSuccess
  } = useSearchSctBySctSelectedWithCondition(getUrlParamSearch(data2), isSearching, getValues('searchFilters.action'))

  // useEffect(() => {
  //   if (isSuccess == true) {
  //     setDataInitial(dataFormSearch.data.ResultOnDb)
  //   } else {
  //     setDataInitial([])
  //   }
  // }, [resultAction()])

  const resultAction = () => {
    const beforeMaterial = watch('searchFilters.material-before')?.ITEM_CODE_FOR_SUPPORT_MES
    const beforeProcess = watch('searchFilters.process-before')?.PROCESS_ID
    const afterMaterial = watch('searchFilters.material-after')?.ITEM_CODE_FOR_SUPPORT_MES
    const afterProcess = watch('searchFilters.process-after')?.PROCESS_ID
    const afterUsage = watch('searchFilters.usage-after') ? watch('searchFilters.usage-after') : undefined

    const isAllEmpty = () =>
      beforeMaterial == null &&
      beforeProcess == null &&
      afterMaterial == null &&
      afterProcess == null &&
      afterUsage == null

    const isBeforeEmpty = () => beforeMaterial == null && beforeProcess == null
    const isBeforeNotEmpty = () => beforeMaterial != null || beforeProcess != null
    const isAfterNotEmpty = () => afterMaterial != null && afterProcess != null && afterUsage != null
    const isAfterAllSet = () => afterMaterial == null && afterProcess == null && afterUsage == null
    const isAfterMaterialSet = () => afterMaterial != null && afterProcess == null && afterUsage == null
    const isAfterUsageSet = () => afterMaterial == null && afterProcess == null && afterUsage != null
    const isAfterUsageEmpty = () => afterMaterial != null && afterProcess != null && afterUsage == null

    if (isAllEmpty()) {
      return ''
    }
    // ** Condition 1: Check if before values are empty
    if (isBeforeEmpty()) {
      if (isAfterNotEmpty()) return 'Add M-Code'
      // return isAfterAllSet() ? 'Add-Mode' : ''
    }

    // ** Condition 2-8: Check if before values are not empty
    if (isBeforeNotEmpty()) {
      // ** Conditions 2, 3, 8: beforeMaterial is set, beforeProcess is null
      if (beforeMaterial != null && beforeProcess == null) {
        if (isAfterAllSet()) return 'Remove M-Code' // Condition 2
        if (isAfterMaterialSet()) return 'Change M-Code' // Condition 3
        if (isAfterUsageSet()) return 'Change Usage' // Condition 8
        return ''
      }

      // ** Conditions 4, 5, 6, 7: both beforeMaterial and beforeProcess are set
      else if (beforeMaterial != null && beforeProcess != null) {
        if (isAfterUsageEmpty()) {
          if (beforeProcess === afterProcess) {
            return ''
          }
          return beforeMaterial === afterMaterial ? 'Change Process' : 'Change M-Code/Process' // Condition 4, 5
        } else if (isAfterNotEmpty()) {
          return 'Change M-Code/Process/Usage' // Condition 6
        } else if (isAfterUsageSet())
          return 'Change Usage in Process' // Condition 7
        else {
          return ''
        }
      }
    }
    return ''
  }

  const onResetFormSearch = () => {
    setDataInitial([])
    setValue('searchFilters.material-before', null)
    setValue('searchFilters.process-before', null)
    setValue('searchFilters.material-after', null)
    setValue('searchFilters.process-after', null)
    setValue('searchFilters.bom-before', null)
    setValue('searchFilters.bom-after', null)
    setValue('searchFilters.unit-before', null)
    setValue('searchFilters.unit-after', null)
    setValue('searchFilters.usage-after', null)
  }

  const handleClickSearch = () => {
    // * Condition
    if (resultAction() == 'Add M-Code') {
      setIsSearching(true)
      setDataInitial(data2)
    } else {
      setIsSearching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      if (isSuccess == true && dataFormSearch?.data?.ResultOnDb?.length > 0) {
        setDataInitial(dataFormSearch.data.ResultOnDb)
      } else {
        setDataInitial([])
      }
    }
  }

  const handleRemoveCondition = (index): any => {
    setConditionList(prev => {
      const result = prev.filter((x, i) => i !== index)
      return result
    })

    setSctSelectedList(prev => {
      let prevFilter = prev.filter((x, i) => x.condition_no !== index + 1)

      prevFilter = prevFilter.map((x, i) => {
        return { ...x, condition_no: x.condition_no > index + 1 ? x.condition_no - 1 : x.condition_no }
      })

      return prevFilter
    })
  }

  const openDeleteConfirmModal = (row: MRT_Row<FormData>) => {
    setSctSelectedList(prev => {
      return prev?.filter((x, i) => {
        // console.log(x?.SCT_CODE !== row?.original?.SCT_CODE && x?.condition_no !== row?.original?.condition_no)

        return !(x?.SCT_CODE == row?.original?.SCT_CODE && x?.condition_no == row?.original?.condition_no)
      })
    })

    if (sctSelectedList.length === 1) {
      setConditionList([])
    }
  }

  async function hasDuplicates(array: any) {
    console.log('array', array)
    return array.some((value, index, self) => index !== self.findIndex(t => t.condition_name === value.condition_name))
    //return false
  }

  const onClickCheck = (): any => {
    for (let i = 0; i < dataForBatchChange?.length; i++) {
      let dataBCM = dataForBatchChange[i]

      let bomFlowProcess = dataBCM['bom_flow_process'][0]['FLOW_PROCESS']

      console.log('COUNT ROW ---- ', i)
      console.log('DATA -BCM ---- ', dataBCM)
      console.log('DATA-BOM', bomFlowProcess)

      // if (dataBCM['condition_name'] == 'Remove M-Code') {
      //   let dataPrev = dataBCM['bom_flow_process'][0]['FLOW_PROCESS']

      //   let index = dataPrev.findIndex(e => e.ITEM_CODE_FOR_SUPPORT_MES == dataBCM['MATERIAL_BEFORE']) ?? -1

      //   console.log('CHECK-INDEX', index)
      //   console.log('CHECK-DUPLICATE', bomFlowProcess[index])
      //   if (bomFlowProcess[index]?.DATA_PREVIOUS?.ITEM_CODE_FOR_SUPPORT_MES) {
      //     console.log('DUPLICATE_DATA')
      //     alert('มีข้อมูลอยู่แล้ว')
      //   }

      //   bomFlowProcess[index] = {
      //     ITEM_CODE_FOR_SUPPORT_MES: '',
      //     USAGE_QUANTITY: '',
      //     NO: '',
      //     PROCESS_NAME: '',
      //     CONDITION_NAME: dataBCM['condition_name'],
      //     DATA_PREVIOUS: dataPrev[index]
      //   }

      //   dataBCM['DATA'] = bomFlowProcess

      //   // setDataList(prev => {
      //   //   let result = prev
      //   //   return [...result, element]
      //   // })
      // }
    }
  }

  async function onAddDataWithCondition() {
    const sctCodeSelected = Object.keys(rowSelection).map(item => {
      return item.split('_')[1]
    })

    // const sctCodeSelectedDetails = data2.filter(d => sctCodeSelected.includes(d.SCT_CODE))

    const dataItem = {
      condition_name: watch('searchFilters.action'),
      MATERIAL_BEFORE: getValues('searchFilters.material-before')?.ITEM_CODE_FOR_SUPPORT_MES || '',
      PROCESS_BEFORE: getValues('searchFilters.process-before')?.PROCESS_NAME || '',
      USAGE_BEFORE: getValues('searchFilters.material-before')?.USAGE_UNIT_RATIO || '',
      ITEM_CATEGORY_BEFORE: getValues('searchFilters.material-before')?.ITEM_CATEGORY_NAME || '',
      UNIT_BEFORE: getValues('searchFilters.material-before')?.SYMBOL || '',
      MATERIAL_AFTER: getValues('searchFilters.material-after')?.ITEM_CODE_FOR_SUPPORT_MES || '',
      PROCESS_AFTER: getValues('searchFilters.process-after')?.PROCESS_NAME || '',
      USAGE_AFTER: getValues('searchFilters.usage-after') || '',
      ITEM_CATEGORY_AFTER: getValues('searchFilters.material-after')?.ITEM_CATEGORY_NAME || '',
      UNIT_AFTER: getValues('searchFilters.material-after')?.SYMBOL || ''
    }

    // dataDuplicate.push(dataItem)
    // let dataTest = await hasDuplicates(dataDuplicate)
    // console.log('dataCheck', dataTest)

    setConditionList(prev => {
      let result = prev

      return [...result, dataItem]
    })

    setSctSelectedList(prev => {
      let result = prev

      const sctCodeSelectedDetails = data2.filter(d => sctCodeSelected.includes(d.SCT_CODE))

      let dataAddCondition = sctCodeSelectedDetails.map(dataItem => {
        return {
          ...dataItem,
          condition_no: Number(conditionList?.length + 1),
          condition_name: watch('searchFilters.action'),
          MATERIAL_BEFORE: getValues('searchFilters.material-before')?.ITEM_CODE_FOR_SUPPORT_MES || '',
          PROCESS_BEFORE: getValues('searchFilters.process-before')?.PROCESS_NAME || '',
          USAGE_BEFORE: getValues('searchFilters.material-before')?.USAGE_UNIT_RATIO || '',
          ITEM_CATEGORY_BEFORE: getValues('searchFilters.material-before')?.ITEM_CATEGORY_NAME || '',
          UNIT_BEFORE: getValues('searchFilters.material-before')?.SYMBOL || '',
          MATERIAL_AFTER: getValues('searchFilters.material-after')?.ITEM_CODE_FOR_SUPPORT_MES || '',
          PROCESS_AFTER: getValues('searchFilters.process-after')?.PROCESS_NAME || '',
          USAGE_AFTER: getValues('searchFilters.usage-after') || '',
          ITEM_CATEGORY_AFTER: getValues('searchFilters.material-after')?.ITEM_CATEGORY_NAME || '',
          UNIT_AFTER: getValues('searchFilters.material-after')?.SYMBOL || ''
        }
      })

      // sctCodeSelectedDetails.forEach(item => {
      //   result = result.filter(d => d.SCT_ID !== item.SCT_ID)
      // })

      return [...result, ...dataAddCondition]
    })

    const sctCodeSelectedDetails = data2.filter(d => sctCodeSelected.includes(d.SCT_CODE))

    let dataBomDetails = await fetchBomDetailsByListBomId(getUrlParamSearchBomDetail(sctCodeSelectedDetails))

    setDataForBatchChange(prev => {
      let result = prev

      let dataAddCondition = sctCodeSelectedDetails.map((dataItem, index) => {
        return {
          ...dataItem,
          condition_no: Number(conditionList?.length + 1),
          condition_name: watch('searchFilters.action'),
          MATERIAL_BEFORE: getValues('searchFilters.material-before')?.ITEM_CODE_FOR_SUPPORT_MES || '',
          PROCESS_BEFORE: getValues('searchFilters.process-before')?.PROCESS_NAME || '',
          USAGE_BEFORE: getValues('searchFilters.material-before')?.USAGE_UNIT_RATIO || '',
          ITEM_CATEGORY_BEFORE: getValues('searchFilters.material-before')?.ITEM_CATEGORY_NAME || '',
          UNIT_BEFORE: getValues('searchFilters.material-before')?.SYMBOL || '',
          MATERIAL_AFTER: getValues('searchFilters.material-after')?.ITEM_CODE_FOR_SUPPORT_MES || '',
          PROCESS_AFTER: getValues('searchFilters.process-after')?.PROCESS_NAME || '',
          USAGE_AFTER: getValues('searchFilters.usage-after') || '',
          ITEM_CATEGORY_AFTER: getValues('searchFilters.material-after')?.ITEM_CATEGORY_NAME || '',
          UNIT_AFTER: getValues('searchFilters.material-after')?.SYMBOL || '',
          bom_flow_process: dataBomDetails.filter(d => d.SCT_ID == dataItem.SCT_ID)
        }
      })

      return [...result, ...dataAddCondition]
    })

    setRowSelection({})
    setIsSearching(false)

    // onResetFormSearch()
  }

  const columns = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    //column definitions...
    () => [
      {
        accessorKey: 'SCT_CODE_FOR_SUPPORT_MES',
        header: 'SCT CODE',
        enableColumnActions: false
      },
      {
        accessorKey: 'FISCAL_YEAR',
        header: 'FISCAL YEAR',
        enableColumnActions: false
      },
      {
        accessorKey: 'ITEM_CATEGORY_NAME',
        header: 'ITEM CATEGORY NAME',
        enableColumnActions: false
      },
      {
        accessorKey: 'SCT_CODE',
        header: 'SCT REVISION CODE',
        enableColumnActions: false
      }
    ],
    []
  )

  const columnsForBatchChange = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    //column definitions...
    () => [
      {
        // id: 'employee', //id used to define `group` column
        header: 'CONDITION',
        columns: [
          {
            accessorKey: 'condition_no', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'CONDITION NO'
          },
          {
            accessorKey: 'condition_name', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'CONDITION NAME'
          },
          {
            accessorKey: 'SCT_CODE_FOR_SUPPORT_MES', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'SCT CODE'
          }
        ]
      },
      {
        header: 'BEFORE',
        columns: [
          {
            accessorKey: 'MATERIAL_BEFORE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'MATERIAL'
          },
          {
            accessorKey: 'PROCESS_BEFORE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'PROCESS'
          },
          {
            accessorKey: 'USAGE_BEFORE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'USAGE'
          },
          {
            accessorKey: 'ITEM_CATEGORY_BEFORE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'ITEM CATEGORY'
          },
          {
            accessorKey: 'UNIT_BEFORE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'UNIT'
          }
        ]
      },
      {
        header: 'AFTER',
        columns: [
          {
            accessorKey: 'MATERIAL_AFTER', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'MATERIAL'
          },
          {
            accessorKey: 'PROCESS_AFTER', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'PROCESS'
          },
          {
            accessorKey: 'USAGE_AFTER', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'USAGE'
          },
          {
            accessorKey: 'ITEM_CATEGORY_AFTER', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'ITEM CATEGORY'
          },
          {
            accessorKey: 'UNIT_AFTER', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'UNIT'
          }
        ]
      }
    ],
    []
  )

  const tableForBatchChange = useMaterialReactTable({
    columns: columnsForBatchChange,
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
    data: sctSelectedList,
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
        zIndex: '100000'
      }
    },
    muiTableHeadCellProps: {
      // sx: theme => ({
      //   color: theme.palette.primary.main
      // })
    },
    // renderRowActions: ({ row, table, cell }) => (
    //   <>
    //     <Box sx={{ display: 'flex', gap: '1rem' }}>
    //       <Tooltip title='Delete'>
    //         <IconButton color='error' onClick={() => openDeleteConfirmModal(row)}>
    //           <DeleteIcon />
    //         </IconButton>
    //       </Tooltip>
    //     </Box>
    //   </>
    // ),
    renderBottomToolbar: () => (
      <>
        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography>Total {sctSelectedList?.length} entries</Typography>
        </div>
      </>
    )
  })

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

    state: { density: 'compact', rowSelection }
  }

  const table = useMaterialReactTable({
    ...commonTableProps,
    enableRowDragging: false,
    enableRowSelection: true,
    //data: dataInitial || [],
    data: dataFormSearch?.data?.ResultOnDb || dataInitial || [],
    onRowSelectionChange: setRowSelection,
    getRowId: originalRow => `table_${originalRow.SCT_CODE}`,
    muiTableBodyRowProps: ({ row }) => ({
      //add onClick to row to select upon clicking anywhere in the row
      onClick: row.getToggleSelectedHandler(),
      sx: { cursor: 'pointer', overflow: 'none', position: 'static' }
    }),

    muiTableContainerProps: {
      // sx: { minWidth: '650px', maxWidth: '660px', maxHeight: '420px', minHeight: '420px', overflow: 'scroll' }
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
      // sx: theme => ({
      //   color: theme.palette.primary.main
      // })
    },
    renderTopToolbarCustomActions: () => (
      <Typography color='primary.main' component='span' variant='h5'>
        Standard Cost List
      </Typography>
    ),
    renderBottomToolbar: () => (
      <>
        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography>Total {dataInitial?.length} entries</Typography>
          <Button
            variant='contained'
            color='success'
            disabled={dataFormSearch?.data?.ResultOnDb?.length === 0}
            onClick={() => {
              onAddDataWithCondition()
            }}
          >
            Add
          </Button>
        </div>
      </>
    )
  })

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <div className='p-6 rounded'>
            <div className='flex justify-between gap-4 flex-col sm:flex-row'>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center'>
                  <Typography variant='h6' className='min-is-[95px]'>
                    Before
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item className='min-w-[260px]'>
                      <Controller
                        name='searchFilters.material-before'
                        control={control}
                        render={({ field: { ref, onChange, ...fieldProps } }) => (
                          <AsyncSelectCustom
                            label={<Chip label='MATERIAL' color='primary' variant='tonal' size='small' />}
                            {...fieldProps}
                            onChange={value => {
                              onChange(value)
                            }}
                            isClearable
                            cacheOptions
                            defaultOptions
                            loadOptions={inputValue => {
                              return fetchItemCodeForSupportMesAndInuse(inputValue)
                            }}
                            getOptionLabel={data => data.ITEM_CODE_FOR_SUPPORT_MES}
                            getOptionValue={data => data.ITEM_ID}
                            classNamePrefix='select'
                            placeholder='Select ...'
                          />
                        )}
                      />
                    </Grid>
                    <Grid item className='min-w-[260px]'>
                      <Controller
                        control={control}
                        name='searchFilters.process-before'
                        render={({ field: { ref, ...fieldProps } }) => (
                          <AsyncSelectCustom
                            label={<Chip label='PROCESS' color='primary' variant='tonal' size='small' />}
                            {...fieldProps}
                            isClearable
                            cacheOptions
                            defaultOptions
                            loadOptions={inputValue => {
                              return fetchProcessByLikeProcessAndInuse(inputValue, '1')
                            }}
                            getOptionLabel={data => data.PROCESS_NAME}
                            getOptionValue={data => data.PROCESS_ID}
                            classNamePrefix='select'
                            placeholder='Select ...'
                          />
                        )}
                      />
                    </Grid>
                    <Grid item className='min-w-[260px]'>
                      <Controller
                        name='searchFilters.usage-before'
                        control={control}
                        render={({ field: { ...fieldProps } }) => (
                          <CustomTextField
                            label={<Chip label='USAGE' color='primary' variant='tonal' size='small' />}
                            {...fieldProps}
                            value={watch(`searchFilters.material-before`)?.USAGE_UNIT_RATIO || ''}
                            inputProps={{
                              className: 'text-center'
                            }}
                            disabled
                            fullWidth
                            autoComplete='off'
                          />
                        )}
                      />
                    </Grid>
                    <Grid item className='min-w-[260px]'>
                      <Controller
                        name='searchFilters.bom-before'
                        control={control}
                        render={({ field: { ...fieldProps } }) => (
                          <CustomTextField
                            label={<Chip label='ITEM CATEGORY (BOM)' color='primary' variant='tonal' size='small' />}
                            {...fieldProps}
                            value={watch(`searchFilters.material-before`)?.ITEM_CATEGORY_NAME || ''}
                            inputProps={{
                              className: 'text-center'
                            }}
                            disabled
                            fullWidth
                            autoComplete='off'
                          />
                        )}
                      />
                    </Grid>

                    <Grid item className='min-w-[260px]'>
                      <Controller
                        name='searchFilters.unit-before'
                        control={control}
                        render={({ field: { ...fieldProps } }) => (
                          <CustomTextField
                            label={<Chip label='UNIT' color='primary' variant='tonal' size='small' />}
                            {...fieldProps}
                            inputProps={{
                              className: 'text-center'
                            }}
                            value={watch(`searchFilters.material-before`)?.SYMBOL || ''}
                            disabled
                            fullWidth
                            autoComplete='off'
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </div>
                <div className='flex items-center'>
                  <Typography variant='h6' className='min-is-[95px]'>
                    After
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item className='min-w-[260px]'>
                      <Controller
                        name='searchFilters.material-after'
                        control={control}
                        render={({ field: { ref, onChange, ...fieldProps } }) => (
                          <AsyncSelectCustom
                            label={<Chip label='MATERIAL' color='primary' variant='tonal' size='small' />}
                            {...fieldProps}
                            onChange={value => {
                              onChange(value)
                            }}
                            isClearable
                            cacheOptions
                            defaultOptions
                            loadOptions={inputValue => {
                              return fetchItemCodeForSupportMesAndInuse(inputValue)
                            }}
                            getOptionLabel={data => data.ITEM_CODE_FOR_SUPPORT_MES}
                            getOptionValue={data => data.ITEM_ID}
                            classNamePrefix='select'
                            placeholder='Select ...'
                          />
                        )}
                      />
                    </Grid>
                    <Grid item className='min-w-[260px]'>
                      <Controller
                        control={control}
                        name='searchFilters.process-after'
                        render={({ field: { ref, ...fieldProps } }) => (
                          <AsyncSelectCustom
                            label={<Chip label='PROCESS' color='primary' variant='tonal' size='small' />}
                            {...fieldProps}
                            isClearable
                            cacheOptions
                            defaultOptions
                            loadOptions={inputValue => {
                              return fetchProcessByLikeProcessAndInuse(inputValue, '1')
                            }}
                            getOptionLabel={data => data.PROCESS_NAME}
                            getOptionValue={data => data.PROCESS_ID}
                            classNamePrefix='select'
                            placeholder='Select ...'
                          />
                        )}
                      />
                    </Grid>
                    <Grid item className='min-w-[260px]'>
                      <Controller
                        name='searchFilters.usage-after'
                        control={control}
                        render={({ field: { ...fieldProps } }) => (
                          <CustomTextField
                            label={<Chip label='USAGE' color='primary' variant='tonal' size='small' />}
                            {...fieldProps}
                            inputProps={{
                              className: 'text-center'
                            }}
                            fullWidth
                            autoComplete='off'
                          />
                        )}
                      />
                    </Grid>
                    <Grid item className='min-w-[260px]'>
                      <Controller
                        name='searchFilters.bom-after'
                        control={control}
                        render={({ field: { ...fieldProps } }) => (
                          <CustomTextField
                            label={<Chip label='ITEM CATEGORY (BOM)' color='primary' variant='tonal' size='small' />}
                            {...fieldProps}
                            value={watch(`searchFilters.material-after`)?.ITEM_CATEGORY_NAME || ''}
                            inputProps={{
                              className: 'text-center'
                            }}
                            disabled
                            fullWidth
                            autoComplete='off'
                          />
                        )}
                      />
                    </Grid>

                    <Grid item className='min-w-[260px]'>
                      <Controller
                        name='searchFilters.unit-after'
                        control={control}
                        render={({ field: { ...fieldProps } }) => (
                          <CustomTextField
                            label={<Chip label='UNIT' color='primary' variant='tonal' size='small' />}
                            {...fieldProps}
                            inputProps={{
                              className: 'text-center'
                            }}
                            value={watch(`searchFilters.material-after`)?.SYMBOL || ''}
                            disabled
                            fullWidth
                            autoComplete='off'
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </div>
                <div className='flex items-center '>
                  <Typography variant='h6' className='min-is-[95px]'>
                    Action
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item className='min-w-[260px]'>
                      <Controller
                        control={control}
                        name='searchFilters.action'
                        render={({ field: { ...fieldProps } }) => (
                          <CustomTextField
                            {...fieldProps}
                            inputProps={{
                              className: 'text-center'
                            }}
                            label=''
                            // value={resultAction()}
                            fullWidth
                            disabled={true}
                            autoComplete='off'
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </div>
              </div>
            </div>
          </div>

          <Grid container className='mx-1' spacing={6}>
            <Grid item xs={12} className='flex gap-4'>
              <Button onClick={handleClickSearch} variant='contained' type='button'>
                Search
              </Button>
              <Button variant='tonal' color='secondary' type='reset' onClick={onResetFormSearch}>
                Clear
              </Button>
              <Button variant='contained' color='secondary' onClick={onClickCheck}>
                Check Data
              </Button>
            </Grid>
          </Grid>
          {isSearching && watch('searchFilters.action') && (
            <Grid className='mt-3 mx-5'>
              <MaterialReactTable table={table} />
            </Grid>
          )}
          {conditionList?.length > 0 && (
            <>
              <Grid>
                <Divider className='mx-5 mt-2' textAlign='left'>
                  <Chip label='Condition List' sx={{ color: 'var(--primary-color)' }} variant='outlined' size='small' />
                </Divider>

                <StyledList className='mx-5' sx={{ overflow: 'scroll' }}>
                  {conditionList.map((sct, index) => (
                    <ListItem
                      className='MuiListItem-container'
                      secondaryAction={
                        <IconButton color='error' edge='end' aria-label='delete'>
                          <DeleteIcon onClick={() => handleRemoveCondition(index)} />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <DonutLargeOutlinedIcon color='primary' />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        // sx={{ maxWidth: '180px', minWidth: '180px' }}
                        primary={`${index + 1}`}
                        secondary={sct?.condition_name}
                      />
                      <Divider orientation='vertical' flexItem />
                      <ListItemText
                        sx={{ textAlign: 'center' }}
                        secondary='Material'
                        primary={
                          <Typography color='var(--primary-color)' variant='h6'>
                            {sct?.MATERIAL_BEFORE || '-'}
                          </Typography>
                        }
                      />
                      <ListItemText
                        sx={{ textAlign: 'center' }}
                        color='primary'
                        secondary='Process'
                        primary={
                          <Typography color='var(--primary-color)' variant='h6'>
                            {sct?.PROCESS_BEFORE || '-'}
                          </Typography>
                        }
                      />
                      <ListItemText
                        sx={{ textAlign: 'center' }}
                        color='primary'
                        secondary='Usage'
                        primary={
                          <Typography color='var(--primary-color)' variant='h6'>
                            {sct?.USAGE_BEFORE || '-'}
                          </Typography>
                        }
                      />
                      <ListItemText
                        sx={{ textAlign: 'center' }}
                        color='primary'
                        secondary='Item Category'
                        primary={
                          <Typography color='var(--primary-color)' variant='h6'>
                            {sct?.ITEM_CATEGORY_BEFORE || '-'}
                          </Typography>
                        }
                      />
                      <ListItemText
                        sx={{ textAlign: 'center' }}
                        color='primary'
                        secondary='Unit'
                        primary={
                          <Typography color='var(--primary-color)' variant='h6'>
                            {sct?.UNIT_BEFORE || '-'}
                          </Typography>
                        }
                      />
                      <Divider orientation='vertical' flexItem />
                      <ListItemText
                        sx={{ textAlign: 'center' }}
                        color='primary'
                        secondary='Material'
                        primary={
                          <Typography color='var(--primary-color)' variant='h6'>
                            {sct?.MATERIAL_AFTER || '-'}
                          </Typography>
                        }
                      />
                      <ListItemText
                        sx={{ textAlign: 'center' }}
                        color='primary'
                        secondary='Process'
                        primary={
                          <Typography color='var(--primary-color)' variant='h6'>
                            {sct?.PROCESS_AFTER || '-'}
                          </Typography>
                        }
                      />
                      <ListItemText
                        sx={{ textAlign: 'center' }}
                        color='primary'
                        secondary='Usage'
                        primary={
                          <Typography color='var(--primary-color)' variant='h6'>
                            {sct?.USAGE_AFTER || '-'}
                          </Typography>
                        }
                      />
                      <ListItemText
                        sx={{ textAlign: 'center', color: 'primary' }}
                        color='primary'
                        secondary='Item Category'
                        primary={
                          <Typography color='var(--primary-color)' variant='h6'>
                            {sct?.ITEM_CATEGORY_AFTER || '-'}
                          </Typography>
                        }
                      />
                      <ListItemText
                        sx={{ textAlign: 'center', color: 'primary' }}
                        color='primary'
                        secondary='Unit'
                        primary={
                          <Typography color='var(--primary-color)' variant='h6'>
                            {sct?.UNIT_AFTER || '-'}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </StyledList>
              </Grid>
            </>
          )}

          {conditionList?.length > 0 && (
            <>
              <Grid className='mt-2 mx-5'>
                <Divider className='mb-3' textAlign='left'>
                  <Chip
                    label='Standard Cost For Batch Change Material List'
                    sx={{ color: 'var(--primary-color)' }}
                    variant='outlined'
                    size='small'
                  />
                </Divider>
                <MaterialReactTable table={tableForBatchChange} />
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default BatchChangeMaterialStepTwo
