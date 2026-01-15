import React, { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

import { Controller, useFormContext, useWatch } from 'react-hook-form'

import CustomTextField from '@/components/mui/TextField'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { FormDataPage } from './validationSchema'
import SctDetailForAdjust from './IndirectCost/SctDetailForAdjust'
import { number } from 'zod'

const SellingPrice = () => {
  // const [isEditData, setIsEditData] = useState({
  //   adjustPrice: false
  // })

  const { control, setValue } = useFormContext<FormDataPage>()

  // const { errors } = useFormState({
  //   control
  // })

  // const handleResetData = () => {
  //   SpecialCostConditionServices.getAdjustPrice({
  //     PRODUCT_MAIN_ID: getValues('product.productMain.PRODUCT_MAIN_ID'),
  //     FISCAL_YEAR: getValues('header.fiscalYear.value')
  //   }).then(specialConditionData => {
  //     const adjustPrice = specialConditionData.data.ResultOnDb?.[0]?.ADJUST_PRICE ?? 0

  //     setValue('sctTotalCost.adjustPrice', adjustPrice)
  //     setValue('sctTotalCost.isManualAdjustPrice', false)
  //   })
  // }

  const [
    totalIndirectCost,
    directProcessCost,
    totalMatPrice,
    sellingExpense,
    ga,
    cit,
    margin,
    sctTotalCost,
    adjustPrice,
    vat,
    mode,
    sctStatusProgressId,
    sellingExpenseForSellingPrice,
    gAForSellingPrice,
    marginForSellingPrice,
    citForSellingPrice,
    sellingPriceByFormula,
    sellingPricePreview
  ] = useWatch({
    name: [
      'indirectCost.main.costCondition.indirectCostCondition.totalIndirectCost',
      'indirectCost.main.directProcessCost',
      'directCost.materialInProcess.main.total.Total',
      'indirectCost.main.costCondition.otherCostCondition.sellingExpense',
      'indirectCost.main.costCondition.otherCostCondition.ga',
      'indirectCost.main.costCondition.otherCostCondition.cit',
      'indirectCost.main.costCondition.otherCostCondition.margin',
      'sctTotalCost',
      'indirectCost.main.costCondition.specialCostCondition.adjustPrice',
      'indirectCost.main.costCondition.otherCostCondition.vat',
      'mode',
      'header.sctStatusProgress.SCT_STATUS_PROGRESS_ID',
      'totalCost.sellingExpenseForSellingPrice',
      'totalCost.gAForSellingPrice',
      'totalCost.marginForSellingPrice',
      'totalCost.citForSellingPrice',
      'totalCost.sellingPriceByFormula',
      'totalCost.sellingPricePreview'
    ],
    control
  })

  useEffect(() => {
    const total = totalMatPrice + (directProcessCost ?? 0)
    const sellingExpenseForSellingPrice =
      ((total + (Number(totalIndirectCost) ?? 0)) * (Number(sellingExpense) ?? 0)) / 100
    const gAForSellingPrice = ((total + (Number(totalIndirectCost) ?? 0)) * (Number(ga) ?? 0)) / 100
    const marginForSellingPrice =
      ((total + (Number(totalIndirectCost) ?? 0) + sellingExpenseForSellingPrice + gAForSellingPrice) *
        (Number(margin) ?? 0)) /
      100

    let citForCal = 0
    citForCal = Number(cit) / 100

    const citForSellingPrice = marginForSellingPrice * citForCal

    const sellingPriceByFormula =
      total +
      (Number(totalIndirectCost) ?? 0) +
      sellingExpenseForSellingPrice +
      gAForSellingPrice +
      marginForSellingPrice +
      citForSellingPrice +
      (vat ?? 0)

    const sellingPricePreview = sellingPriceByFormula + (Number(adjustPrice) ?? 0)

    setValue('totalCost.sellingExpenseForSellingPrice', sellingExpenseForSellingPrice, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
    setValue('totalCost.gAForSellingPrice', gAForSellingPrice, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
    setValue('totalCost.marginForSellingPrice', marginForSellingPrice, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
    setValue(
      'totalCost.citForSellingPrice',
      Number.isFinite(citForSellingPrice) === false ? null : citForSellingPrice,
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      }
    )
    setValue(
      'totalCost.sellingPriceByFormula',
      Number.isFinite(sellingPriceByFormula) === false ? null : sellingPriceByFormula,
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      }
    )
    setValue(
      'totalCost.sellingPricePreview',
      Number.isFinite(sellingPricePreview) === false ? null : sellingPricePreview,
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      }
    )
  }, [cit, directProcessCost, ga, margin, sellingExpense, totalIndirectCost, totalMatPrice, vat, setValue, adjustPrice])

  // useEffect(() => {
  //   const total = totalMatPrice + (directProcessCost ?? 0)

  //   const sellingExpenseForSellingPrice = ((total + (totalIndirectCost ?? 0)) * (sellingExpense ?? 0)) / 100

  //   const gAForSellingPrice = ((total + (totalIndirectCost ?? 0)) * (ga ?? 0)) / 100

  //   const marginForSelling =
  //     ((total + (totalIndirectCost ?? 0) + sellingExpenseForSellingPrice + gAForSellingPrice) * (margin ?? 0)) / 100

  //   const citForSellingPrice = marginForSelling * (cit ?? 0)

  //   const sellingPriceByFormula =
  //     total +
  //     (totalIndirectCost ?? 0) +
  //     sellingExpenseForSellingPrice +
  //     gAForSellingPrice +
  //     marginForSelling +
  //     citForSellingPrice +
  //     (vat ?? 0)

  //   // console.log(adjustPrice, sellingPriceByFormula, sellingPriceByFormula + (adjustPrice ?? 0))

  //   // setRows([
  //   //   createRow(
  //   //     '1',
  //   //     'Selling Expense for Selling Price',

  //   //     formatNumber(sellingExpenseForSellingPrice)
  //   //   ),
  //   //   createRow('2', 'GA for Selling Price', formatNumber(gAForSellingPrice)),
  //   //   createRow('3', 'Margin for Selling Price', formatNumber(marginForSelling)),
  //   //   createRow('4', 'CIT for Selling Price', formatNumber(citForSellingPrice)),
  //   //   createRow('5', 'Selling Price by Formula', formatNumber(sellingPriceByFormula)),
  //   //   createRow(
  //   //     '6',
  //   //     'Adjust Price (optional)',
  //   //     <SctDetailForAdjust
  //   //       inputName='specialCostCondition.adjustPrice'
  //   //       unit='THB'
  //   //       masterDataSelection='specialCostCondition'
  //   //     />
  //   //   ),
  //   //   createRow(
  //   //     '7',
  //   //     'Remark for Adjust Price (optional)',
  //   //     <Controller
  //   //       name='adjust.remarkForAdjustPrice'
  //   //       control={control}
  //   //       render={({ field: { ...fieldProps } }) => (
  //   //         <CustomTextField
  //   //           {...fieldProps}
  //   //           inputProps={{
  //   //             style: {
  //   //               textAlign: 'right'
  //   //             }
  //   //           }}
  //   //           sx={{ width: '100%' }}
  //   //           label=''
  //   //           disabled={mode === 'view' || sctStatusProgressId !== 2}
  //   //           autoComplete='off'
  //   //         ></CustomTextField>
  //   //       )}
  //   //     />
  //   //   ),
  //   //   createRow('8', 'Selling Price', formatNumber(sctTotalCost.find(x => x.IS_FROM_SCT_COPY === 0)?.SELLING_PRICE)),
  //   //   createRow('9', 'Selling Price (Preview)', formatNumber(sellingPriceByFormula + (adjustPrice ?? 0), 0))
  //   // ])
  // }, [
  //   cit,
  //   ga,
  //   margin,
  //   sellingExpense,
  //   directProcessCost,
  //   totalIndirectCost,
  //   totalMatPrice,
  //   sctTotalCost,
  //   adjustPrice,
  //   vat,
  //   control,
  //   sctStatusProgressId,
  //   mode
  // ])

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
              {/* {rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell align='left'>{row.desc}</TableCell>
                  <TableCell align='right'>{row.value}</TableCell>
                </TableRow>
              ))} */}

              <TableRow
                sx={{
                  '& td, & th': {
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    height: '43px'
                  }
                }}
              >
                <TableCell align='left'>Selling Expense for Selling Price</TableCell>
                <TableCell align='right'>{formatNumber(sellingExpenseForSellingPrice, 2, true, ' THB')}</TableCell>
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
                <TableCell align='left'>GA for Selling Price</TableCell>
                <TableCell align='right'>{formatNumber(gAForSellingPrice, 2, true, ' THB')}</TableCell>
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
                <TableCell align='left'>Margin for Selling Price</TableCell>
                <TableCell align='right'>{formatNumber(marginForSellingPrice, 2, true, ' THB')}</TableCell>
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
                <TableCell align='left'>CIT for Selling Price</TableCell>
                <TableCell align='right'>{formatNumber(citForSellingPrice, 2, true, ' THB')}</TableCell>
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
                <TableCell align='left'>Selling Price by Formula</TableCell>
                <TableCell align='right'>{formatNumber(sellingPriceByFormula, 2, true, ' THB')}</TableCell>
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
                <TableCell align='left'>Adjust Price (optional)</TableCell>
                <TableCell align='right'>
                  <SctDetailForAdjust
                    inputName='specialCostCondition.adjustPrice'
                    unit='THB'
                    masterDataSelection='specialCostCondition'
                  />
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
                <TableCell align='left'>Remark for Adjust Price (optional)</TableCell>
                <TableCell align='right'>
                  <Controller
                    name='adjust.remarkForAdjustPrice'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        {...fieldProps}
                        inputProps={{
                          style: {
                            textAlign: 'right'
                          }
                        }}
                        // sx={{ width: '30%' }}
                        label=''
                        disabled={mode === 'view' || sctStatusProgressId !== 2}
                        autoComplete='off'
                        InputProps={{
                          sx: {
                            height: '30px',
                            '& input': {
                              padding: '8px 14px'
                            },
                            width: '640px'
                          }
                        }}
                      />
                    )}
                  />
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
                <TableCell align='left'>Selling Price</TableCell>
                <TableCell align='right'>
                  {formatNumber(sctTotalCost.find(x => x.IS_FROM_SCT_COPY === 0)?.SELLING_PRICE, 2, true, ' THB')}
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
                <TableCell align='left'>Selling Price (Preview)</TableCell>
                <TableCell align='right'>{formatNumber(sellingPricePreview, 0, true, ' THB')}</TableCell>
              </TableRow>

              {/* createRow(
        '1',
        'Selling Expense for Selling Price',

        formatNumber(sellingExpenseForSellingPrice)
      ),
      createRow('2', 'GA for Selling Price', formatNumber(gAForSellingPrice)),
      createRow('3', 'Margin for Selling Price', formatNumber(marginForSelling)),
      createRow('4', 'CIT for Selling Price', formatNumber(citForSellingPrice)),
      createRow('5', 'Selling Price by Formula', formatNumber(sellingPriceByFormula)),
      createRow(
        '6',
        'Adjust Price (optional)',
        <SctDetailForAdjust
          inputName='specialCostCondition.adjustPrice'
          unit='THB'
          masterDataSelection='specialCostCondition'
        />
      ),
      createRow(
        '7',
        'Remark for Adjust Price (optional)',
        <Controller
          name='adjust.remarkForAdjustPrice'
          control={control}
          render={({ field: { ...fieldProps } }) => (
            <CustomTextField
              {...fieldProps}
              inputProps={{
                style: {
                  textAlign: 'right'
                }
              }}
              sx={{ width: '100%' }}
              label=''
              disabled={mode === 'view' || sctStatusProgressId !== 2}
              autoComplete='off'
            ></CustomTextField>
          )}
        />
      ),
      createRow('8', 'Selling Price', formatNumber(sctTotalCost.find(x => x.IS_FROM_SCT_COPY === 0)?.SELLING_PRICE)),
      createRow('9', 'Selling Price (Preview)', formatNumber(sellingPriceByFormula + (adjustPrice ?? 0), 0)) */}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  )
}

export default SellingPrice
