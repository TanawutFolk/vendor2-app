import { useEffect, useMemo, useState } from 'react'

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import { useFormContext, useWatch } from 'react-hook-form'
import { FormDataPage } from '../../validationSchema'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'

const createRow = (id: string, desc: string, value: number) => {
  let rowValue

  if (typeof value === 'number') {
    rowValue = value.toFixed(4)
  } else {
    rowValue = value
  }

  return { id, desc, value: rowValue }
}

const FlowProcessBomTable = () => {
  const { control, setValue } = useFormContext<FormDataPage>()

  const listMaterialInProcess = useWatch({
    control,
    name: 'directCost.materialInProcess.main.body'
  })

  const TOTAL_PRICE_OF_SEMI_FINISHED_GOODS = useMemo(() => {
    return listMaterialInProcess
      ?.filter(x => x.ITEM_CATEGORY_ID_FROM_BOM === 2)
      .reduce((acc, cur) => {
        return acc + (Number(cur?.price?.amount) ?? 0)
      }, 0)
  }, [listMaterialInProcess])

  const TOTAL_PRICE_OF_SUB_ASSY = useMemo(() => {
    return listMaterialInProcess
      ?.filter(x => x.ITEM_CATEGORY_ID_FROM_BOM === 3)
      .reduce((acc, cur) => {
        return acc + (Number(cur?.price?.amount) ?? 0)
      }, 0)
  }, [listMaterialInProcess])

  const TOTAL_PRICE_OF_RAW_MATERIAL = useMemo(() => {
    return listMaterialInProcess
      ?.filter(x => x.ITEM_CATEGORY_ID_FROM_BOM === 4)
      .reduce((acc, cur) => {
        return acc + (Number(cur?.price?.amount) ?? 0)
      }, 0)
  }, [listMaterialInProcess])

  const TOTAL_PRICE_OF_CONSUMABLE = useMemo(() => {
    return listMaterialInProcess
      ?.filter(x => x.ITEM_CATEGORY_ID_FROM_BOM === 5)
      .reduce((acc, cur) => {
        return acc + (Number(cur?.price?.amount) ?? 0)
      }, 0)
  }, [listMaterialInProcess])

  const TOTAL_PRICE_OF_PACKING = useMemo(() => {
    return listMaterialInProcess
      ?.filter(x => x.ITEM_CATEGORY_ID_FROM_BOM === 6)
      .reduce((acc, cur) => {
        return acc + (Number(cur?.price?.amount) ?? 0)
      }, 0)
  }, [listMaterialInProcess])

  // const { getValues, watch } = useFormContext()

  // const [matPrice, setMatPrice] = useState({
  //   rawMaterial: 0,
  //   consumable: 0,
  //   subAssy: 0,
  //   semiFinishedGoods: 0,
  //   packing: 0
  // })

  // const [rows, setRows] = useState<any[]>([])

  // useEffect(() => {
  //   setMatPrice(prev => {
  //     return matPriceCalculate(getValues('MATERIAL_AMOUNT'))
  //   })
  // }, [
  //   // watch('MATERIAL_AMOUNT')
  //   watch('MATERIAL_PRICE_DATA')
  // ])

  // useEffect(() => {
  //   setRows([
  //     createRow(
  //       '1',
  //       'Raw Material',
  //       parseFloat(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_RAW_MATERIAL'))?.toFixed(2) || matPrice.rawMaterial,
  //       // .toFixed(4)
  //       // .toString()
  //       // .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //       getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_RAW_MATERIAL')
  //         ? Number(getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_RAW_MATERIAL'))
  //             .toFixed(4)
  //             .toString()
  //             .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //         : '-',
  //       getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_RAW_MATERIAL')
  //         ? Number(getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_RAW_MATERIAL'))
  //             .toFixed(4)
  //             .toString()
  //             .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //         : '-'
  //     ),
  //     createRow(
  //       '2',
  //       'Consumable',
  //       parseFloat(Number(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_CONSUMABLE'))?.toFixed(2)) ||
  //         Number(parseFloat(matPrice.consumable))?.toFixed(2),
  //       // .toFixed(4)
  //       // .toString()
  //       // .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //       getValues('TOTAL_MATERIAL.') || getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_CONSUMABLE')
  //         ? Number(getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_CONSUMABLE'))
  //             .toFixed(4)
  //             .toString()
  //             .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //         : '-',
  //       getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_CONSUMABLE')
  //         ? Number(getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_CONSUMABLE'))
  //             .toFixed(4)
  //             .toString()
  //             .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //         : '-'
  //     ),
  //     createRow(
  //       '3',
  //       'Sub-Assy',
  //       parseFloat(Number(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_SUB_ASSY')))?.toFixed(2) ||
  //         parseFloat(Number(matPrice.subAssy))?.toFixed(2),
  //       // .toFixed(4)
  //       // .toString()
  //       // .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //       getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_SUB_ASSY')
  //         ? Number(getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_SUB_ASSY'))
  //             .toFixed(4)
  //             .toString()
  //             .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //         : '-',
  //       getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_SUB_ASSY')
  //         ? Number(getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_SUB_ASSY'))
  //             .toFixed(4)
  //             .toString()
  //             .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //         : '-'
  //     ),
  //     createRow(
  //       '4',
  //       'Semi-Finished Goods',
  //       parseFloat(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'))?.toFixed(2) ||
  //         parseFloat(matPrice.semiFinishedGoods)?.toFixed(2),
  //       // .toFixed(4)
  //       // .toString()
  //       // .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //       getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS')
  //         ? Number(getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'))
  //             .toFixed(4)
  //             .toString()
  //             .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //         : '-',
  //       getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS')
  //         ? Number(getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'))
  //             .toFixed(4)
  //             .toString()
  //             .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //         : '-'
  //     ),
  //     createRow(
  //       '5',
  //       'Packing',
  //       parseFloat(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_PACKING'))?.toFixed(2) ||
  //         parseFloat(matPrice.packing)?.toFixed(2),
  //       // .toFixed(4)
  //       // .toString()
  //       // .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //       getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_PACKING')
  //         ? Number(getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_PACKING'))
  //             .toFixed(4)
  //             .toString()
  //             .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //         : '-',
  //       getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_PACKING')
  //         ? Number(getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_PACKING'))
  //             .toFixed(4)
  //             .toString()
  //             .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //         : '-'
  //     ),
  //     createRow(
  //       '6',
  //       'Total',
  //       (parseFloat(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_ALL_OF_ITEMS'))?.toFixed(2) ||
  //         parseFloat(
  //           matPrice.rawMaterial +
  //             matPrice.consumable +
  //             matPrice.subAssy +
  //             matPrice.semiFinishedGoods +
  //             matPrice.packing
  //         )?.toFixed(2)) ??
  //         // `${parseFloat(getValues('YR_GR_TOTAL.TOTAL_GO_STRAIGHT_RATE_FOR_SCT')?.toFixed(2))}%`,

  //         // ?.toFixed(4)
  //         // .toString()
  //         // .replace(/\d(?=(\d{3})+\.)/g, '$&,'))

  //         '0',
  //       (
  //         getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_RAW_MATERIAL') +
  //         getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_CONSUMABLE') +
  //         getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_SUB_ASSY') +
  //         getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS')
  //       )
  //         ?.toFixed(4)
  //         .toString()
  //         .replace(/\d(?=(\d{3})+\.)/g, '$&,'),
  //       (
  //         getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_RAW_MATERIAL') +
  //         getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_CONSUMABLE') +
  //         getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_SUB_ASSY') +
  //         getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS')
  //       )
  //         ?.toFixed(4)
  //         .toString()
  //         .replace(/\d(?=(\d{3})+\.)/g, '$&,')
  //     )
  //   ])
  // }, [matPrice, watch('SCT_COMPARE_NO_2_DATA.data'), watch('SCT_COMPARE_NO_1_DATA.data', watch('TOTAL_MATERIAL'))])
  // useEffect(() => {
  //   // ===== helpers =====
  //   const toNumber = (v: unknown): number | null => {
  //     // รับทั้ง string/number (ลบ , ออกก่อน) แล้วคืน null ถ้าไม่ใช่ตัวเลข
  //     if (v === null || v === undefined) return null
  //     const n = Number(String(v).replace(/,/g, ''))
  //     return Number.isFinite(n) ? n : null
  //   }

  //   const pickNumber = (...candidates: unknown[]): number | null => {
  //     for (const c of candidates) {
  //       const n = toNumber(c)
  //       if (n !== null) return n
  //     }
  //     return null
  //   }

  //   const fmt2 = (v: unknown): string => {
  //     const n = toNumber(v)
  //     return n === null ? '' : n.toFixed(2)
  //   }

  //   const fmt4WithComma = (v: unknown): string => {
  //     const n = toNumber(v)
  //     return n === null ? '' : n.toFixed(4).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  //   }

  //   const sumFmt4WithComma = (vals: unknown[]): string => {
  //     const nums = vals.map(toNumber).filter((x): x is number => x !== null)
  //     if (nums.length === 0) return ''
  //     const sum = nums.reduce((a, b) => a + b, 0)
  //     return fmt4WithComma(sum)
  //   }

  //   // ===== values (เลือกค่าที่เป็นตัวเลขก่อนเสมอ) =====
  //   const rawMaterial = pickNumber(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_RAW_MATERIAL'), matPrice?.rawMaterial)

  //   const consumable = pickNumber(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_CONSUMABLE'), matPrice?.consumable)

  //   const subAssy = pickNumber(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_SUB_ASSY'), matPrice?.subAssy)

  //   const semiFinished = pickNumber(
  //     getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'),
  //     matPrice?.semiFinishedGoods
  //   )

  //   const packing = pickNumber(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_PACKING'), matPrice?.packing)

  //   const totalFromForm = toNumber(getValues('TOTAL_MATERIAL.TOTAL_PRICE_OF_ALL_OF_ITEMS'))

  //   const totalFallback = [rawMaterial, consumable, subAssy, semiFinished, packing].every(n => n === null)
  //     ? null
  //     : (rawMaterial ?? 0) + (consumable ?? 0) + (subAssy ?? 0) + (semiFinished ?? 0) + (packing ?? 0)

  //   const total = totalFromForm ?? totalFallback

  //   // ===== compare cols (แสดงว่างถ้าไม่ใช่ตัวเลข) =====
  //   const c1_raw = fmt4WithComma(getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_RAW_MATERIAL'))
  //   const c1_con = fmt4WithComma(getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_CONSUMABLE'))
  //   const c1_sub = fmt4WithComma(getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_SUB_ASSY'))
  //   const c1_semi = fmt4WithComma(getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'))
  //   const c1_packing = fmt4WithComma(getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_PACKING'))
  //   const c1_total = sumFmt4WithComma([
  //     getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_RAW_MATERIAL'),
  //     getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_CONSUMABLE'),
  //     getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_SUB_ASSY'),
  //     getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'),
  //     getValues('SCT_COMPARE_NO_1_DATA.data.TOTAL_PRICE_OF_PACKING')
  //   ])

  //   const c2_raw = fmt4WithComma(getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_RAW_MATERIAL'))
  //   const c2_con = fmt4WithComma(getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_CONSUMABLE'))
  //   const c2_sub = fmt4WithComma(getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_SUB_ASSY'))
  //   const c2_semi = fmt4WithComma(getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'))
  //   const c2_packing = fmt4WithComma(getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_PACKING'))
  //   const c2_total = sumFmt4WithComma([
  //     getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_RAW_MATERIAL'),
  //     getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_CONSUMABLE'),
  //     getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_SUB_ASSY'),
  //     getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_SEMI_FINISHED_GOODS'),
  //     getValues('SCT_COMPARE_NO_2_DATA.data.TOTAL_PRICE_OF_PACKING')
  //   ])

  //   // ===== build rows (คอลัมน์หลักใช้ทศนิยม 2 ตำแหน่ง, compare ใช้ 4 ตำแหน่ง + comma) =====
  //   setRows([
  //     createRow('1', 'Raw Material', fmt2(rawMaterial), c1_raw || '-', c2_raw || '-'),
  //     createRow('2', 'Consumable', fmt2(consumable), c1_con || '-', c2_con || '-'),
  //     createRow('3', 'Sub-Assy', fmt2(subAssy), c1_sub || '-', c2_sub || '-'),
  //     createRow('4', 'Semi-Finished Goods', fmt2(semiFinished), c1_semi || '-', c2_semi || '-'),
  //     createRow('5', 'Packing', fmt2(packing), c1_packing || '-', c2_packing || '-'),
  //     createRow('6', 'Total', fmt2(total), c1_total || '-', c2_total || '-')
  //   ])
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [matPrice, watch('TOTAL_MATERIAL'), watch('SCT_COMPARE_NO_1_DATA.data'), watch('SCT_COMPARE_NO_2_DATA.data')])
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    setRows([
      createRow('1', 'Raw Material', formatNumber(TOTAL_PRICE_OF_RAW_MATERIAL, 2, true, ' THB')),
      createRow('2', 'Consumable', formatNumber(TOTAL_PRICE_OF_CONSUMABLE, 2, true, ' THB')),
      createRow('3', 'Packing', formatNumber(TOTAL_PRICE_OF_PACKING, 2, true, ' THB')),
      createRow('4', 'Sub-Assy', formatNumber(TOTAL_PRICE_OF_SUB_ASSY, 2, true, ' THB')),
      createRow('5', 'Semi-Finished Goods', formatNumber(TOTAL_PRICE_OF_SEMI_FINISHED_GOODS, 2, true, ' THB')),
      createRow(
        '6',
        'Total',
        formatNumber(
          TOTAL_PRICE_OF_RAW_MATERIAL +
            TOTAL_PRICE_OF_CONSUMABLE +
            TOTAL_PRICE_OF_PACKING +
            TOTAL_PRICE_OF_SUB_ASSY +
            TOTAL_PRICE_OF_SEMI_FINISHED_GOODS,
          2,
          true,
          ' THB'
        )
      )
    ])

    setValue('directCost.materialInProcess.main.total.RawMaterial', TOTAL_PRICE_OF_RAW_MATERIAL)
    setValue('directCost.materialInProcess.main.total.Consumable', TOTAL_PRICE_OF_CONSUMABLE)
    setValue('directCost.materialInProcess.main.total.Packing', TOTAL_PRICE_OF_PACKING)
    setValue('directCost.materialInProcess.main.total.SubAssy', TOTAL_PRICE_OF_SUB_ASSY)
    setValue('directCost.materialInProcess.main.total.SemiFinishedGoods', TOTAL_PRICE_OF_SEMI_FINISHED_GOODS)
    setValue(
      'directCost.materialInProcess.main.total.Total',
      TOTAL_PRICE_OF_RAW_MATERIAL +
        TOTAL_PRICE_OF_CONSUMABLE +
        TOTAL_PRICE_OF_PACKING +
        TOTAL_PRICE_OF_SUB_ASSY +
        TOTAL_PRICE_OF_SEMI_FINISHED_GOODS
    )
  }, [
    TOTAL_PRICE_OF_RAW_MATERIAL,
    TOTAL_PRICE_OF_CONSUMABLE,
    TOTAL_PRICE_OF_PACKING,
    TOTAL_PRICE_OF_SUB_ASSY,
    TOTAL_PRICE_OF_SEMI_FINISHED_GOODS,
    setValue
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
                height: '30px'
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
                height: '30px'
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
              <TableCell align='right'>{row.value1}</TableCell>
              <TableCell align='right'>{row.diff1}</TableCell>
              <TableCell align='right'>{row.value2}</TableCell>
              <TableCell align='right'>{row.diff2}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default FlowProcessBomTable
