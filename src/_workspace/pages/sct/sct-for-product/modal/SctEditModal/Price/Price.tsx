import React, { useEffect, useMemo, useState } from 'react'

import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

import { useFormContext, useWatch } from 'react-hook-form'

import { FormDataPage } from '../validationSchema'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'

const createRow = (id: string, desc: string, value: string) => {
  return { id, desc, value }
}

const Price = () => {
  const { control } = useFormContext<FormDataPage>()

  const listMaterialInProcess = useWatch({
    control,
    name: 'directCost.materialInProcess.main.body'
  })

  // const [matPrice, setMatPrice] = useState({
  //   rawMaterial: 0,
  //   consumable: 0,
  //   subAssy: 0,
  //   semiFinishedGoods: 0,
  //   packing: 0
  // })

  const [rows, setRows] = useState<any[]>([])

  // useEffect(
  //   () => {
  //     setMatPrice(prev => {
  //       return matPriceCalculate(getValues('MATERIAL_AMOUNT'))
  //     })
  //   },
  //   [
  //     // watch('MATERIAL_AMOUNT')
  //   ]
  // )

  const TOTAL_PRICE_OF_SEMI_FINISED_GOODS = useMemo(() => {
    return listMaterialInProcess
      .filter(x => x.ITEM_CATEGORY_ID_FROM_BOM === 2)
      .reduce((acc, cur) => {
        return acc + (Number(cur.price?.amount) ?? 0)
      }, 0)
  }, [listMaterialInProcess])

  const TOTAL_PRICE_OF_SUB_ASSY = useMemo(() => {
    return listMaterialInProcess
      .filter(x => x.ITEM_CATEGORY_ID_FROM_BOM === 3)
      .reduce((acc, cur) => {
        return acc + (Number(cur.price?.amount) ?? 0)
      }, 0)
  }, [listMaterialInProcess])

  const TOTAL_PRICE_OF_RAW_MATERIAL = useMemo(() => {
    return listMaterialInProcess
      .filter(x => x.ITEM_CATEGORY_ID_FROM_BOM === 4)
      .reduce((acc, cur) => {
        return acc + (Number(cur.price?.amount) ?? 0)
      }, 0)
  }, [listMaterialInProcess])

  const TOTAL_PRICE_OF_CONSUMABLE = useMemo(() => {
    return listMaterialInProcess
      .filter(x => x.ITEM_CATEGORY_ID_FROM_BOM === 5)
      .reduce((acc, cur) => {
        return acc + (Number(cur.price?.amount) ?? 0)
      }, 0)
  }, [listMaterialInProcess])

  const TOTAL_PRICE_OF_PACKING = useMemo(() => {
    return listMaterialInProcess
      .filter(x => x.ITEM_CATEGORY_ID_FROM_BOM === 6)
      .reduce((acc, cur) => {
        return acc + (Number(cur.price?.amount) ?? 0)
      }, 0)
  }, [listMaterialInProcess])

  useEffect(() => {
    setRows([
      createRow('1', 'Total Price of Raw Material', formatNumber(TOTAL_PRICE_OF_RAW_MATERIAL, 2, true, ' THB')),
      createRow('2', 'Total Price of Consumable', formatNumber(TOTAL_PRICE_OF_CONSUMABLE, 2, true, ' THB')),
      createRow('3', 'Total Price of Packing', formatNumber(TOTAL_PRICE_OF_PACKING, 2, true, ' THB')),
      createRow('4', 'Total Price of Sub-Assy', formatNumber(TOTAL_PRICE_OF_SUB_ASSY, 2, true, ' THB')),
      createRow('5', 'Total Price of Semi-FG', formatNumber(TOTAL_PRICE_OF_SEMI_FINISED_GOODS, 2, true, ' THB')),
      createRow(
        '6',
        'Total Price of all of items',
        formatNumber(
          TOTAL_PRICE_OF_RAW_MATERIAL +
            TOTAL_PRICE_OF_CONSUMABLE +
            TOTAL_PRICE_OF_PACKING +
            TOTAL_PRICE_OF_SUB_ASSY +
            TOTAL_PRICE_OF_SEMI_FINISED_GOODS,
          2,
          true,
          ' THB'
        )
      ),
      createRow(
        '7',
        'Raw Material + Sub-assy + Semi-FG',
        formatNumber(
          TOTAL_PRICE_OF_RAW_MATERIAL + TOTAL_PRICE_OF_SUB_ASSY + TOTAL_PRICE_OF_SEMI_FINISED_GOODS,
          2,
          true,
          ' THB'
        )
      ),
      createRow(
        '8',
        'Consumable + Packing',
        formatNumber(TOTAL_PRICE_OF_CONSUMABLE + TOTAL_PRICE_OF_PACKING, 2, true, ' THB')
      ),
      createRow(
        '9',
        'Materials Cost',
        formatNumber(
          TOTAL_PRICE_OF_RAW_MATERIAL +
            TOTAL_PRICE_OF_CONSUMABLE +
            TOTAL_PRICE_OF_PACKING +
            TOTAL_PRICE_OF_SUB_ASSY +
            TOTAL_PRICE_OF_SEMI_FINISED_GOODS,
          2,
          true,
          ' THB'
        )
      )
    ])
  }, [
    TOTAL_PRICE_OF_RAW_MATERIAL,
    TOTAL_PRICE_OF_CONSUMABLE,
    TOTAL_PRICE_OF_PACKING,
    TOTAL_PRICE_OF_SUB_ASSY,
    TOTAL_PRICE_OF_SEMI_FINISED_GOODS
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
            aria-label='spanning table'
          >
            <TableHead>
              <TableRow
                sx={{
                  '& td, & th': {
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    height: '32px'
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
                    height: '32px'
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
              {rows.map(row => (
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

export default Price
