import { Dispatch, SetStateAction, useMemo, useState } from 'react'

import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'

import { useFormContext } from 'react-hook-form'

import { Badge, Card, CardContent, CardHeader, Collapse, IconButton } from '@mui/material'

import classNames from 'classnames'

interface Props {
  collapse: boolean
  setCollapse: Dispatch<SetStateAction<boolean>>
}

const FlowProcess = ({ collapse, setCollapse }: Props) => {
  const { control, handleSubmit, getValues, watch, setValue, unregister, trigger } = useFormContext()

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'NO',
        header: 'Process No',
        size: 40,
        Cell: ({ renderedCellValue, row, cell }) => {
          return <>{row.original.NO}</>
        }
      },
      {
        accessorKey: 'PROCESS_NAME',
        header: 'Process Name',
        size: 40,
        Cell: ({ renderedCellValue, row, cell }) => {
          const count =
            Object.values(watch('MATERIAL_IN_PROCESS') ?? {})?.filter(
              (item: any) => item?.PROCESS?.value === row.original.PROCESS_ID
            ).length || 0

          return (
            <>
              <Badge badgeContent={count} color='primary'>
                {row.original.PROCESS_NAME}
              </Badge>
            </>
          )
        }
      }
    ],
    [watch('FLOW_PROCESS')?.length, watch('FLOW_PROCESS')?.[0]?.PROCESS_ID]
  )

  const table = useMaterialReactTable({
    autoResetPageIndex: false,
    columns,
    data: watch('FLOW_PROCESS') ?? [],
    enableEditing: false,
    enableRowOrdering: false,
    enableSorting: false,
    enablePagination: false,
    enableRowNumbers: false,
    enableColumnFilters: false,
    muiTableContainerProps: {
      sx: {
        maxHeight: '60vh',
        minHeight: '60vh',
        overflow: 'scroll'
      }
    }
  })

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      {/* <Collapse in={!collapse} orientation='horizontal'> */}
      <CardHeader
        title='Flow Process'
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={classNames(collapse ? 'tabler-chevron-right' : 'tabler-chevron-left', 'text-xl')} />
          </IconButton>
        }
      />
      <CardContent>
        <MaterialReactTable table={table} />
      </CardContent>
      {/* </Collapse> */}
    </Card>
  )
}

export default FlowProcess
