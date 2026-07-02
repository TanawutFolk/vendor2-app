import { useEffect, useState } from 'react'

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

import { useFormContext, useWatch } from 'react-hook-form'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { FormDataPage } from '../../validationSchema'

type RowType = {
  name: string
  mainValue: number | string
  compareNo1Value: number | string | null | undefined
  diff1: number | string
  compareNo2Value: number | string | null | undefined
  diff2: number | string
}

const CreateRow = ({
  name,
  mainValue,
  compareNo1Value,
  diff1,
  compareNo2Value,
  diff2
}: {
  name:
    | 'BOM Code'
    | 'Flow Code'
    | 'Total Count Process'
    | 'Revision No. of Yield Rate & Go Straight Rate'
    | 'Total Yield Rate (%)'
    | 'Total Go Straight Rate (%)'
    | 'Revision No. of Clear Time'
    | 'Total Clear Time (MM)'
  mainValue: number | string
  compareNo1Value: number | string | null | undefined
  compareNo2Value: number | string | null | undefined
  diff1: number | string
  diff2: number | string
}): RowType => {
  return {
    name,
    mainValue,
    compareNo1Value,
    diff1,
    compareNo2Value,
    diff2
  }
}

const FlowProcessBomTable = () => {
  const { getValues, control } = useFormContext<FormDataPage>()

  const [rows, setRows] = useState<RowType[]>([])

  const yieldRateAndGoStraightRate = useWatch({
    control,
    name: 'directCost.flowProcess.total.main.yieldRateAndGoStraightRate' // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    // defaultValue: "default", // default value before the render
  })
  const clearTime = useWatch({
    control,
    name: 'directCost.flowProcess.total.main.clearTime' // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    // defaultValue: "default", // default value before the render
  })

  useEffect(() => {
    setRows([
      CreateRow({
        name: 'BOM Code',
        mainValue: getValues('header.bom.BOM_CODE'),
        compareNo1Value: getValues('sctComPareNo1.bom.BOM_CODE'),
        compareNo2Value: getValues('sctComPareNo2.bom.BOM_CODE'),
        diff1: '-',
        diff2: '-'
      }),
      CreateRow({
        name: 'Flow Code',
        mainValue: getValues('header.bom.FLOW_CODE'),
        compareNo1Value: getValues('sctComPareNo1.bom.FLOW_CODE'),
        compareNo2Value: getValues('sctComPareNo2.bom.FLOW_CODE'),
        diff1: '-',
        diff2: '-'
      }),
      CreateRow({
        name: 'Total Count Process',
        mainValue: getValues('header.bom.TOTAL_COUNT_PROCESS'),
        compareNo1Value: getValues('sctComPareNo1.bom.TOTAL_COUNT_PROCESS'),
        compareNo2Value: getValues('sctComPareNo2.bom.TOTAL_COUNT_PROCESS'),
        diff1: getValues('sctComPareNo1.bom.TOTAL_COUNT_PROCESS')
          ? formatNumber(
              getValues('header.bom.TOTAL_COUNT_PROCESS') - (getValues('sctComPareNo1.bom.TOTAL_COUNT_PROCESS') ?? 0)
            )
          : '-',
        diff2: getValues('sctComPareNo2.bom.TOTAL_COUNT_PROCESS')
          ? formatNumber(
              getValues('header.bom.TOTAL_COUNT_PROCESS') - (getValues('sctComPareNo2.bom.TOTAL_COUNT_PROCESS') ?? 0)
            )
          : '-'
      }),
      CreateRow({
        name: 'Revision No. of Yield Rate & Go Straight Rate',
        mainValue: getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.version')
          ? `${getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.fiscalYear')} Rev.${getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.version')}`
          : '',
        compareNo1Value: getValues('directCost.flowProcess.total.sctCompareNo1.yieldRateAndGoStraightRate.version')
          ? `${getValues('directCost.flowProcess.total.sctCompareNo1.yieldRateAndGoStraightRate.fiscalYear')}Rev.${getValues('directCost.flowProcess.total.sctCompareNo1.yieldRateAndGoStraightRate.version')}`
          : '',
        compareNo2Value: getValues('directCost.flowProcess.total.sctCompareNo2.yieldRateAndGoStraightRate.version')
          ? `${getValues('directCost.flowProcess.total.sctCompareNo2.yieldRateAndGoStraightRate.fiscalYear')}Rev.${getValues('directCost.flowProcess.total.sctCompareNo2.yieldRateAndGoStraightRate.version')}`
          : '',
        diff1: '-',
        diff2: '-'
      }),
      CreateRow({
        name: 'Total Yield Rate (%)',
        mainValue: formatNumber(
          getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.totalYieldRate'),
          2,
          true,
          '%'
        ),
        compareNo1Value: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo1.yieldRateAndGoStraightRate.totalYieldRate'),
          2,
          true,
          '%'
        ),
        compareNo2Value: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo2.yieldRateAndGoStraightRate.totalYieldRate'),
          2,
          true,
          '%'
        ),
        diff1: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo1.yieldRateAndGoStraightRate.totalYieldRate'),
          2,
          true,
          '%',
          '-'
        ),
        diff2: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo2.yieldRateAndGoStraightRate.totalYieldRate'),
          2,
          true,
          '%',
          '-'
        )
      }),
      CreateRow({
        name: 'Total Go Straight Rate (%)',
        mainValue: formatNumber(
          getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.totalGoStraightRate'),
          2,
          true,
          '%'
        ),
        compareNo1Value: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo1.yieldRateAndGoStraightRate.totalGoStraightRate'),
          2,
          true,
          '%'
        ),
        compareNo2Value: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo2.yieldRateAndGoStraightRate.totalGoStraightRate'),
          2,
          true,
          '%'
        ),
        diff1: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo1.yieldRateAndGoStraightRate.totalGoStraightRate'),
          2,
          true,
          '%',
          '-'
        ),
        diff2: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo2.yieldRateAndGoStraightRate.totalGoStraightRate'),
          2,
          true,
          '%',
          '-'
        )
      }),
      CreateRow({
        name: 'Revision No. of Clear Time',
        mainValue: getValues('directCost.flowProcess.total.main.clearTime.version')
          ? `${getValues('directCost.flowProcess.total.main.clearTime.fiscalYear')} Rev.${getValues('directCost.flowProcess.total.main.clearTime.version')}`
          : '',
        compareNo1Value: getValues('directCost.flowProcess.total.sctCompareNo1.clearTime.version')
          ? `${getValues('directCost.flowProcess.total.sctCompareNo1.clearTime.fiscalYear')} Rev.${getValues('directCost.flowProcess.total.sctCompareNo1.clearTime.version')}`
          : '',
        compareNo2Value: getValues('directCost.flowProcess.total.sctCompareNo2.clearTime.version')
          ? `${getValues('directCost.flowProcess.total.sctCompareNo2.clearTime.fiscalYear')} Rev.${getValues('directCost.flowProcess.total.sctCompareNo2.clearTime.version')}`
          : '',
        diff1: '-',
        diff2: '-'
      }),
      CreateRow({
        name: 'Total Clear Time (MM)',
        mainValue: formatNumber(getValues('directCost.flowProcess.total.main.clearTime.totalClearTime'), 2, true),
        compareNo1Value: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo1.clearTime.totalClearTime'),
          2,
          true
        ),
        compareNo2Value: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo2.clearTime.totalClearTime'),
          2,
          true
        ),
        diff1: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo1.clearTime.totalClearTime'),
          2,
          true,
          '',
          '-'
        ),
        diff2: formatNumber(
          getValues('directCost.flowProcess.total.sctCompareNo2.clearTime.totalClearTime'),
          2,
          true,
          '',
          '-'
        )
      })
    ])
  }, [
    yieldRateAndGoStraightRate?.fiscalYear,
    yieldRateAndGoStraightRate?.version,
    clearTime?.fiscalYear,
    clearTime?.version,
    getValues
  ])

  return (
    <TableContainer component={Paper}>
      <Table
        sx={{
          minWidth: 700,
          '& .MuiTableCell-root': {
            border: '1px solid var(--mui-palette-TableCell-border)'
          }
        }}
        aria-label='spanning table'
      >
        <TableHead>
          <TableRow
            sx={{
              '& td, & th': {
                paddingTop: '5px',
                paddingBottom: '5px',
                height: '43px'
              }
            }}
          >
            <TableCell align='center' colSpan={2}></TableCell>
            <TableCell align='center' colSpan={2}>
              SCT Compare No.1
            </TableCell>
            <TableCell align='center' colSpan={2}>
              SCT Compare No.2
            </TableCell>
          </TableRow>
          <TableRow
            sx={{
              '& td, & th': {
                paddingTop: '5px',
                paddingBottom: '5px',
                height: '43px'
              }
            }}
          >
            <TableCell colSpan={2}></TableCell>
            <TableCell align='center'>Value</TableCell>
            <TableCell align='center'>Diff</TableCell>
            <TableCell align='center'>Value</TableCell>
            <TableCell align='center'>Diff</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow
              key={row.name}
              sx={{
                '& td, & th': {
                  paddingTop: '5px',
                  paddingBottom: '5px',
                  height: '43px'
                }
              }}
            >
              <TableCell align='left'>{row.name}</TableCell>
              <TableCell align='right'>{row.mainValue}</TableCell>
              <TableCell align='right'>{row.compareNo1Value}</TableCell>
              <TableCell align='right'>{row.diff1}</TableCell>
              <TableCell align='right'>{row.compareNo2Value}</TableCell>
              <TableCell align='right'>{row.diff2}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default FlowProcessBomTable
