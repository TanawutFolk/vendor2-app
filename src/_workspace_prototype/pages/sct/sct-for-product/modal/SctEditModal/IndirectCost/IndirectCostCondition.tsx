import { ReactNode, useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import { styled, Tooltip, tooltipClasses, TooltipProps, Typography } from '@mui/material'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { FormDataPage } from '../validationSchema'
import SctDetailForAdjust from './SctDetailForAdjust'

type Row = {
  id: string
  desc: string | ReactNode
  value: number | ReactNode
}
const createRow = (id: string, desc: string | ReactNode, value: number | ReactNode) => {
  let rowValue

  if (typeof value === 'number') {
    rowValue = value.toFixed(4)
  } else {
    rowValue = value
  }

  return { id, desc, value: rowValue }
}

const IndirectCost = () => {
  const [rowsTable1, setRowsTable1] = useState<Row[]>([])
  const [rowsTable2, setRowsTable2] = useState<Row[]>([])

  const { setValue, control } = useFormContext<FormDataPage>()

  const { errors } = useFormState({
    control
  })

  const [
    totalIndirectCost,
    totalMatPrice,
    totalDirectCost,
    total,
    indirectRateOfDirectProcessCost,
    importFeeRate,
    directCostCondition,
    totalProcessingTime,
    totalProcessingTimeIncludingIndirectRateOfDirectProcessCost,
    directProcessCost
  ] = useWatch({
    control,
    name: [
      'indirectCost.main.costCondition.indirectCostCondition.totalIndirectCost',
      'directCost.materialInProcess.main.total.Total',
      'indirectCost.main.totalDirectCost',
      'indirectCost.main.total',
      'indirectCost.main.costCondition.directCostCondition.indirectRateOfDirectProcessCost',
      'indirectCost.main.costCondition.importFeeRate',
      'indirectCost.main.costCondition.directCostCondition',
      'indirectCost.main.totalProcessingTimeMh',
      'indirectCost.main.totalProcessingTimeIncludingIndirectRateOfDirectProcessCostMh',
      'indirectCost.main.directProcessCost'
    ]
  })

  // const TOTAL_ESSENTIAL_TIME = useMemo(() => {
  //   // 1. Handle undefined/null cases
  //   if (!yieldRateGoStraightRateProcessForSct || !clearTimeForSctProcess) {
  //     return 0
  //   }

  //   // 2. Handle empty arrays
  //   if (!yieldRateGoStraightRateProcessForSct.length || !clearTimeForSctProcess.length) {
  //     return 0
  //   }

  //   // 3. สร้าง lookup table
  //   const lookup = Object.create(null)

  //   // ใช้ for loop สำหรับ performance
  //   for (let i = 0; i < clearTimeForSctProcess.length; i++) {
  //     const item = clearTimeForSctProcess[i]
  //     if (item?.flowProcessId != null) {
  //       lookup[item.flowProcessId] = item.clearTimeForSct || 0
  //     }
  //   }

  //   // 4. คำนวณผลลัพธ์
  //   let total = 0

  //   for (let i = 0; i < yieldRateGoStraightRateProcessForSct.length; i++) {
  //     const cur = yieldRateGoStraightRateProcessForSct[i]

  //     // ตรวจสอบว่า item มีค่าที่ถูกต้อง
  //     if (!cur || cur.flowProcessId == null) continue

  //     const clearTime = lookup[cur.flowProcessId] ?? 0
  //     const yieldRate = cur.yieldAccumulationForSct || 1
  //     const goStraightRate = cur.goStraightRateForSct || 1

  //     // ป้องกัน NaN และ Infinity
  //     const denominator = yieldRate * goStraightRate
  //     if (denominator === 0) continue

  //     total += (clearTime / denominator) * 10000
  //   }

  //   return total
  // }, [yieldRateGoStraightRateProcessForSct, clearTimeForSctProcess])

  // const INDIRECT_RATE_OF_DIRECT_PROCESS_COST = useWatch({
  //   control,
  //   name: 'indirectCost.main.costCondition.directCostCondition.indirectRateOfDirectProcessCost'
  // })

  // const directUnitProcessCost = useWatch({
  //   control,
  //   name: 'indirectCost.main.costCondition.directCostCondition.directUnitProcessCost',
  //   defaultValue: 0
  // })

  useEffect(() => {
    setRowsTable1([
      createRow(
        '1',
        'Direct Unit Process Cost (THB/H)',
        errors?.indirectCost?.main?.costCondition?.directCostCondition?.directUnitProcessCost ? (
          <Typography
            sx={{
              color: 'var(--mui-palette-error-main)'
            }}
          >
            {errors?.indirectCost?.main?.costCondition?.directCostCondition?.directUnitProcessCost?.message}
          </Typography>
        ) : (
          formatNumber(directCostCondition?.directUnitProcessCost, 2, true, ' THB')
        )
      ),
      createRow(
        '2',
        'Indirect Rate of Direct Process Cost (%)',
        errors?.indirectCost?.main?.costCondition?.directCostCondition?.indirectRateOfDirectProcessCost ? (
          <Typography
            sx={{
              color: 'var(--mui-palette-error-main)'
            }}
          >
            {errors?.indirectCost?.main?.costCondition?.directCostCondition?.indirectRateOfDirectProcessCost?.message}
          </Typography>
        ) : (
          formatNumber(directCostCondition?.indirectRateOfDirectProcessCost, 2, true, '%')
        )
      ),
      createRow(
        '3',
        <div className='flex flex-row gap-2 items-center'>
          <NoMaxWidthTooltip title={<>{'Data from Cost Condition (Master Data)'}</>} placement='top'>
            <i className='tabler-info-circle text-md ms-1' />
          </NoMaxWidthTooltip>
          Indirect Cost (THB)
          {errors?.indirectCost?.main?.costCondition?.indirectCostCondition?.totalIndirectCost && (
            <Typography
              sx={{
                color: 'var(--mui-palette-error-main)'
              }}
            >
              {errors?.indirectCost?.main?.costCondition?.indirectCostCondition?.totalIndirectCost?.message}
            </Typography>
          )}
        </div>,
        <>
          <SctDetailForAdjust
            inputName='indirectCostCondition.totalIndirectCost'
            unit='THB'
            masterDataSelection='indirectCostCondition'
          />
        </>
      ),
      createRow('4', 'Import Fee Rate (%)', formatNumber(importFeeRate?.importFeeRate, 2, true, '%')),
      createRow(
        '5',
        <div className='flex flex-row gap-2 items-center'>
          <NoMaxWidthTooltip title={<>{'Data from Cost Condition (Master Data)'}</>} placement='top'>
            <i className='tabler-info-circle text-md ms-1' />
          </NoMaxWidthTooltip>
          Selling Expense (%)
        </div>,
        <SctDetailForAdjust
          inputName='otherCostCondition.sellingExpense'
          unit='%'
          masterDataSelection='otherCostCondition'
        />
      ),
      createRow(
        '6',
        <div className='flex flex-row gap-2 items-center'>
          <NoMaxWidthTooltip title={<>{'Data from Cost Condition (Master Data)'}</>} placement='top'>
            <i className='tabler-info-circle text-md ms-1' />
          </NoMaxWidthTooltip>
          GA (%)
        </div>,
        <SctDetailForAdjust inputName='otherCostCondition.ga' unit='%' masterDataSelection='otherCostCondition' />
      ),
      createRow(
        '7',
        <div className='flex flex-row gap-2 items-center'>
          <NoMaxWidthTooltip title={<>{'Data from Cost Condition (Master Data)'}</>} placement='top'>
            <i className='tabler-info-circle text-md ms-1' />
          </NoMaxWidthTooltip>
          Margin (%)
        </div>,
        <SctDetailForAdjust inputName='otherCostCondition.margin' unit='%' masterDataSelection='otherCostCondition' />
      ),
      createRow(
        '7',
        <div className='flex flex-row gap-2 items-center'>
          <NoMaxWidthTooltip title={<>{'Data from Cost Condition (Master Data)'}</>} placement='top'>
            <i className='tabler-info-circle text-md ms-1' />
          </NoMaxWidthTooltip>
          CIT (%)
        </div>,
        <SctDetailForAdjust inputName='otherCostCondition.cit' unit='%' masterDataSelection='otherCostCondition' />
      ),
      createRow(
        '7',
        <div className='flex flex-row gap-2 items-center'>
          <NoMaxWidthTooltip
            title={<>{'This value is sourced from Master Data and is not editable at this time.'}</>}
            placement='top'
          >
            <i className='tabler-info-circle text-md ms-1' />
          </NoMaxWidthTooltip>
          VAT (%)
        </div>,
        <SctDetailForAdjust
          inputName='otherCostCondition.vat'
          unit='%'
          masterDataSelection='otherCostCondition'
          isEnableEditing={false}
        />
      )
    ])

    // const totalProcessingTime = (TOTAL_ESSENTIAL_TIME ?? 0) / 60

    // setValue('indirectCost.main.totalProcessingTimeMh', totalProcessingTime)

    // const totalProcessingTimeIncludingIndirectRateOfDirectProcessCost =
    //   totalProcessingTime * (1 + (indirectRateOfDirectProcessCost ?? 0) / 100)

    // setValue(
    //   'indirectCost.main.totalProcessingTimeIncludingIndirectRateOfDirectProcessCostMh',
    //   totalProcessingTimeIncludingIndirectRateOfDirectProcessCost
    // )

    // const directProcessCost = totalProcessingTimeIncludingIndirectRateOfDirectProcessCost * (directUnitProcessCost ?? 1)

    // setValue('indirectCost.main.directProcessCost', directProcessCost)
    // setValue('indirectCost.main.totalDirectCost', totalMatPrice + directProcessCost)
    // setValue('indirectCost.main.total', totalMatPrice + directProcessCost)

    setRowsTable2([
      createRow('8', 'Total Processing Time (MH)', formatNumber(totalProcessingTime, 2, true, ' MH')),
      createRow(
        '9',
        'Total Processing Time including Indirect Rate of Direct Process Cost (MH)',
        formatNumber(totalProcessingTimeIncludingIndirectRateOfDirectProcessCost, 2, true, ' MH')
      ),
      createRow('10', 'Direct Process Cost', formatNumber(directProcessCost, 2, true, ' THB')),
      createRow('11', 'Total Direct Cost', formatNumber(totalDirectCost, 2, true, ' THB')),
      createRow('12', 'Total', formatNumber(total, 2, true, ' THB'))
    ])
  }, [
    directCostCondition?.directUnitProcessCost,
    directCostCondition?.indirectRateOfDirectProcessCost,
    importFeeRate?.importFeeRate,
    indirectRateOfDirectProcessCost,
    setValue,
    totalIndirectCost,
    totalMatPrice,
    total,
    totalDirectCost,
    directProcessCost,
    totalProcessingTime,
    totalProcessingTimeIncludingIndirectRateOfDirectProcessCost,
    errors?.indirectCost?.main?.costCondition?.indirectCostCondition?.totalIndirectCost,
    errors?.indirectCost?.main?.costCondition?.directCostCondition?.indirectRateOfDirectProcessCost,
    errors?.indirectCost?.main?.costCondition?.directCostCondition?.directUnitProcessCost
  ])

  return (
    <>
      <Grid item xs={12} sm={12} lg={12}>
        <TableContainer component={Paper}>
          <Table
            sx={{
              minWidth: 700,
              '& .MuiTableCell-root': {
                border: '1px solid var(--mui-palette-TableCell-border)'
              }
            }}
            // size='small'
            aria-label='spanning table'
          >
            <TableHead>
              <TableRow
                sx={{
                  '& td, & th': {
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    height: '30px'
                  }
                }}
              >
                <TableCell align='center' rowSpan={2}>
                  Name
                </TableCell>
                <TableCell align='center' rowSpan={2}>
                  Value
                </TableCell>
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
                    height: '30px'
                  }
                }}
              >
                <TableCell align='center'>Value</TableCell>
                <TableCell align='center'>Diff</TableCell>
                <TableCell align='center'>Value</TableCell>
                <TableCell align='center'>Diff</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rowsTable1.map(row => (
                <TableRow
                  key={row.id}
                  sx={{
                    '& td, & th': {
                      paddingTop: '5px',
                      paddingBottom: '5px',
                      height: '43px'
                    }
                  }}
                >
                  <TableCell align='left'>{row.desc}</TableCell>
                  <TableCell align='right'>{row.value}</TableCell>
                </TableRow>
              ))}
              {rowsTable2.map(row => (
                <TableRow
                  key={row.id}
                  sx={{
                    '& td, & th': {
                      paddingTop: '5px',
                      paddingBottom: '5px',
                      height: '43px'
                    }
                  }}
                >
                  <TableCell align='left'>{row.desc}</TableCell>
                  <TableCell align='right'>{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  )
}

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
    backgroundColor: 'var(--background-color)',
    color: 'var(--secondary-color)'
  }
})

export default IndirectCost
