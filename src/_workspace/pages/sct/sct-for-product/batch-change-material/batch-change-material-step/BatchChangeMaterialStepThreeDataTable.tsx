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

const BatchChangeMaterialStepThreeDataTable = ({ isFetchingData, setIsFetchingData, dataForBatchChange }: any) => {
  // States
  const { control, handleSubmit, getValues, watch, reset, setValue, unregister, trigger } = useFormContext<FormData>()
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [isSearching, setIsSearching] = useState(false)
  const [dataList, setDataList] = useState<[]>([])
  //let dataList = []
  const queryClient = useQueryClient()

  const getUrlParamSearch = (dataBom: StandardCostI): object => {
    let bomList = []

    for (let i = 0; i < dataBom?.length; i++) {
      const element = dataBom[i]
      let dataItem = {
        SCT_CODE_FOR_SUPPORT_MES: element['SCT_CODE_FOR_SUPPORT_MES'],
        BOM_ID: element['BOM_ID']
      }
      bomList.push(dataItem)
    }

    const params = {
      LIST_DATA: bomList
    }

    return params
  }

  const {
    isRefetching,
    isLoading,
    data: dataFormSearch,
    isError,
    refetch,
    isFetching,
    isSuccess
  } = useGetBomDetailByBomId(getUrlParamSearch(dataForBatchChange), isFetchingData)

  useEffect(() => {
    if (isSuccess == true) {
      //console.log('Get Data from useGetBomDetailByBomId', dataFormSearch?.data?.ResultOnDb)

      for (let i = 0; i < dataForBatchChange?.length; i++) {
        let element = dataForBatchChange[i]
        let bomFlowProcess = dataFormSearch?.data?.ResultOnDb?.[i]

        // ** Condition 1
        if (element['CONDITION_NAME'] == 'Add M-Code') {
          let dataPrev = dataFormSearch?.data?.ResultOnDb?.[i]

          bomFlowProcess[dataPrev?.length + 1] = {
            ITEM_CODE_FOR_SUPPORT_MES: element['MATERIAL_AFTER'],
            USAGE_QUANTITY: element['USAGE_AFTER'],
            NO: '',
            PROCESS_NAME: element['PROCESS_AFTER'],
            CONDITION_NAME: element['CONDITION_NAME'],
            DATA_PREVIOUS: ''
          }

          element['DATA'] = bomFlowProcess

          setDataList(prev => {
            let result = prev
            return [...result, element]
          })
        }

        // ** Condition 2
        if (element['CONDITION_NAME'] == 'Remove M-Code') {
          let dataPrev = dataFormSearch?.data?.ResultOnDb?.[i]

          let index = dataPrev.findIndex(e => e.ITEM_CODE_FOR_SUPPORT_MES == element['MATERIAL_BEFORE']) ?? -1

          if (bomFlowProcess[index]?.DATA_PREVIOUS?.ITEM_CODE_FOR_SUPPORT_MES) {
            alert('มีข้อมูลอยู่แล้ว')
            // return
          }

          bomFlowProcess[index] = {
            ITEM_CODE_FOR_SUPPORT_MES: '',
            USAGE_QUANTITY: '',
            NO: '',
            PROCESS_NAME: '',
            CONDITION_NAME: element['CONDITION_NAME'],
            DATA_PREVIOUS: dataPrev[index]
          }

          element['DATA'] = bomFlowProcess

          setDataList(prev => {
            let result = prev
            return [...result, element]
          })
        }
        // ** Condition 3
        if (element['CONDITION_NAME'] == 'Change M-Code') {
          let dataPrev = dataFormSearch?.data?.ResultOnDb?.[i]

          // let index = dataPrev.findIndex(e => e.ITEM_CODE_FOR_SUPPORT_MES == element['MATERIAL_BEFORE']) ?? -1
          let dataChangeMcode = dataPrev.findAll(e => e.ITEM_CODE_FOR_SUPPORT_MES == element['MATERIAL_BEFORE'])
          console.log(dataChangeMcode)

          if (bomFlowProcess[index]?.DATA_PREVIOUS?.ITEM_CODE_FOR_SUPPORT_MES) {
            alert('มีข้อมูลอยู่แล้ว')
          }

          bomFlowProcess[index] = {
            ITEM_CODE_FOR_SUPPORT_MES: element['MATERIAL_AFTER'],
            USAGE_QUANTITY: element['USAGE_AFTER'],
            NO: '',
            PROCESS_NAME: '',
            CONDITION_NAME: element['CONDITION_NAME'],
            DATA_PREVIOUS: dataPrev[index]
          }

          element['DATA'] = bomFlowProcess

          setDataList(prev => {
            let result = prev
            return [...result, element]
          })
        }
        // ** Condition 4
        if (element['CONDITION_NAME'] == 'Change Process') {
          let dataPrev = dataFormSearch?.data?.ResultOnDb?.[i]

          // let index = dataPrev.findIndex(e => e.ITEM_CODE_FOR_SUPPORT_MES == element['MATERIAL_BEFORE']) ?? -1

          bomFlowProcess[dataPrev?.length + 1] = {
            ITEM_CODE_FOR_SUPPORT_MES: element['MATERIAL_AFTER'],
            USAGE_QUANTITY: element['USAGE_AFTER'],
            NO: '',
            PROCESS_NAME: element['PROCESS_AFTER'],
            CONDITION_NAME: element['CONDITION_NAME'],
            DATA_PREVIOUS: ''
          }

          element['DATA'] = bomFlowProcess

          setDataList(prev => {
            let result = prev
            return [...result, element]
          })
        }

        // ** Condition 5
        if (element['CONDITION_NAME'] == 'Change M-Code/Process') {
          let dataPrev = dataFormSearch?.data?.ResultOnDb?.[i]

          let index =
            dataPrev.findIndex(
              e =>
                e.ITEM_CODE_FOR_SUPPORT_MES == element['MATERIAL_BEFORE'] && e.PROCESS_NAME == element['PROCESS_BEFORE']
            ) ?? -1

          bomFlowProcess[index] = {
            ITEM_CODE_FOR_SUPPORT_MES: element['MATERIAL_AFTER'],
            USAGE_QUANTITY: element['USAGE_AFTER'],
            NO: '',
            PROCESS_NAME: element['PROCESS_AFTER'],
            CONDITION_NAME: element['CONDITION_NAME'],
            DATA_PREVIOUS: dataPrev[index]
          }

          element['DATA'] = bomFlowProcess

          setDataList(prev => {
            let result = prev
            return [...result, element]
          })
        }

        // ** Condition 6
        if (element['CONDITION_NAME'] == 'Change M-Code/Process/Usage') {
          let dataPrev = dataFormSearch?.data?.ResultOnDb?.[i]

          let index =
            dataPrev.findIndex(
              e =>
                e.ITEM_CODE_FOR_SUPPORT_MES == element['MATERIAL_BEFORE'] && e.PROCESS_NAME == element['PROCESS_BEFORE']
            ) ?? -1

          bomFlowProcess[index] = {
            ITEM_CODE_FOR_SUPPORT_MES: element['MATERIAL_AFTER'],
            USAGE_QUANTITY: element['USAGE_AFTER'],
            NO: '',
            PROCESS_NAME: element['PROCESS_AFTER'],
            CONDITION_NAME: element['CONDITION_NAME'],
            DATA_PREVIOUS: dataPrev[index]
          }

          element['DATA'] = bomFlowProcess

          setDataList(prev => {
            let result = prev
            return [...result, element]
          })
        }

        // ** Condition 7
        if (element['CONDITION_NAME'] == 'Change Usage in Process') {
          let dataPrev = dataFormSearch?.data?.ResultOnDb?.[i]

          let index =
            dataPrev.findIndex(
              e =>
                e.ITEM_CODE_FOR_SUPPORT_MES == element['MATERIAL_BEFORE'] && e.PROCESS_NAME == element['PROCESS_BEFORE']
            ) ?? -1

          bomFlowProcess[index] = {
            ITEM_CODE_FOR_SUPPORT_MES: element['MATERIAL_BEFORE'],
            USAGE_QUANTITY: element['USAGE_AFTER'],
            NO: '',
            PROCESS_NAME: element['PROCESS_BEFORE'],
            CONDITION_NAME: element['CONDITION_NAME'],
            DATA_PREVIOUS: dataPrev[index]
          }

          element['DATA'] = bomFlowProcess

          setDataList(prev => {
            let result = prev
            return [...result, element]
          })
        }

        // ** Condition 8
        if (element['CONDITION_NAME'] == 'Change Usage') {
          let dataPrev = dataFormSearch?.data?.ResultOnDb?.[i]

          let index = dataPrev.findIndex(e => e.ITEM_CODE_FOR_SUPPORT_MES == element['MATERIAL_BEFORE']) ?? -1

          bomFlowProcess[index] = {
            ITEM_CODE_FOR_SUPPORT_MES: element['MATERIAL_AFTER'],
            USAGE_QUANTITY: element['USAGE_BEFORE'],
            NO: '',
            PROCESS_NAME: element['PROCESS_AFTER'],
            CONDITION_NAME: element['CONDITION_NAME'],
            DATA_PREVIOUS: dataPrev[index]
          }

          element['DATA'] = bomFlowProcess

          setDataList(prev => {
            let result = prev
            return [...result, element]
          })
        }
      }
      // console.log('--DATA--', dataList)
      // setDataInitial(dataFormSearch.data.ResultOnDb)
      // setIsFetchingData(false)
    }
  }, [isSuccess])

  const columns = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    //column definitions...
    () => [
      {
        // id: 'employee', //id used to define `group` column
        header: 'DETAILS',
        columns: [
          {
            accessorKey: 'SCT_CODE_FOR_SUPPORT_MES', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'SCT CODE'
          },
          {
            accessorKey: 'PRODUCT_TYPE_CODE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'PRODUCT TYPE CODE'
          },
          {
            accessorKey: 'PRODUCT_TYPE_NAME', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'PRODUCT TYPE NAME'
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
        // id: 'employee', //id used to define `group` column
        header: 'CONDITION',
        columns: [
          {
            accessorKey: 'CONDITION_NAME', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: 'CONDITION NAME'
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
    data: dataList,
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
        borderWidth: '1px'
      }
    },
    renderTopToolbarCustomActions: () => (
      <Typography color='primary.main' component='span' variant='h5'>
        Standard Cost Batch Change Material List
      </Typography>
    ),

    renderBottomToolbar: () => (
      <>
        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography>Total {dataList?.length} entries</Typography>
        </div>
        <Button variant='contained' color='secondary' onClick={onClickCheck}>
          Check Data Details
        </Button>
      </>
    )
  })

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Grid className='mt-3 mx-5'>
            <MaterialReactTable table={table} />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default BatchChangeMaterialStepThreeDataTable
