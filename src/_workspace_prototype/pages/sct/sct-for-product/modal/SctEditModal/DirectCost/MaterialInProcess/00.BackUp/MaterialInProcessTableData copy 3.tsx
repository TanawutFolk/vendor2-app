import { useMemo, useState } from 'react'

import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { FormDataPage } from '../../validationSchema'

import { AgGridReact } from 'ag-grid-react'
import type { CustomCellRendererProps } from 'ag-grid-react'

import { themeQuartz } from 'ag-grid-community'
import YieldAccumulation from './Columns/00.BackUp/YieldAccumulation'
import PurchasePrice from './Columns/00.BackUp/PurchasePrice'
import Amount from './Columns/00.BackUp/Amount'
import UsagePrice from './Columns/00.BackUp/UsagePrice'

import { type ColDef } from 'ag-grid-community'

// to use myTheme in an application, pass it to the theme grid option
const myTheme = themeQuartz.withParams({
  // accentColor: '#087AD1',
  // backgroundColor: '#FFFFFF',
  // borderColor: '#D7E2E6',
  // borderRadius: 2,
  // browserColorScheme: 'light',
  // cellHorizontalPaddingScale: 0.7,
  // chromeBackgroundColor: {
  //   ref: 'backgroundColor'
  // },
  // columnBorder: false,
  // fontFamily: {
  //   googleFont: 'Inter'
  // },
  // fontSize: 13,
  // foregroundColor: '#555B62',
  // headerBackgroundColor: '#FFFFFF',
  // headerFontSize: 13,
  // headerFontWeight: 400,
  // headerTextColor: '#84868B',
  // rowBorder: true,
  // rowVerticalPaddingScale: 0.8,
  // sidePanelBorder: true,
  spacing: 6,
  columnBorder: { style: 'solid', color: 'var(--mui-palette-TableCell-border)' }
  // wrapperBorder: false,
  // wrapperBorderRadius: 2
})

const NumberFormatter = (props: CustomCellRendererProps) => <>{formatNumber(props.value, 7, true)}</>
const MaterialInProcessTableData = () => {
  const { control, getValues } = useFormContext<FormDataPage>()

  // const { fields: fields_listMaterialInProcess } = useFieldArray({
  //   control,
  //   name: 'directCost.materialInProcess.main.body'
  // })

  const columnDefs = useMemo<ColDef[]>(() => {
    return [
      { field: 'ITEM_NO', headerName: 'ITEM NO', width: 100, pinned: 'left', cellRenderer: 'simpleTextRenderer' },
      {
        field: 'ITEM_CODE_FOR_SUPPORT_MES',
        headerName: 'ITEM CODE',
        pinned: 'left',
        cellRenderer: 'simpleTextRenderer'
      },
      {
        field: 'ITEM_CATEGORY_NAME_FROM_BOM',
        headerName: 'ITEM CATEGORY NAME (BOM)',
        width: 270,
        pinned: 'left',
        filter: 'agTextColumnFilter',
        cellRenderer: 'simpleTextRenderer'
      },
      {
        field: 'ITEM_EXTERNAL_SHORT_NAME',
        headerName: 'ITEM EXTERNAL SHORT NAME ',
        width: 300,
        cellRenderer: 'simpleTextRenderer'
      },
      {
        field: 'ITEM_EXTERNAL_FULL_NAME',
        headerName: 'ITEM EXTERNAL FULL NAME ',
        width: 300,
        cellRenderer: 'simpleTextRenderer'
      },
      {
        field: 'USAGE_QUANTITY',
        headerName: 'USAGE QTY',
        cellRenderer: NumberFormatter
      },
      { field: 'USAGE_UNIT_CODE_FROM_MASTER', headerName: 'USAGE UNIT CODE', cellRenderer: 'simpleTextRenderer' },
      {
        field: 'USAGE_PRICE',
        headerName: 'USAGE PRICE (STANDARD PRICE) (THB)',
        width: 300,
        cellRenderer: UsagePrice
      },
      { field: 'USAGE_PRICE_CURRENCY', headerName: 'USAGE PRICE CURRENCY', cellRenderer: () => 'THB' },
      { field: 'PROCESS_NO', headerName: 'PROCESS NO' },
      { field: 'PROCESS_NAME', headerName: 'PROCESS NAME' },
      { field: 'YIELD_ACCUMULATION_MATERIAL', headerName: 'YIELD ACCUMULATION (%)', cellRenderer: YieldAccumulation },
      { field: 'AMOUNT', headerName: 'AMOUNT (THB)', cellRenderer: Amount },
      { field: 'PURCHASE_PRICE', headerName: 'PURCHASE PRICE', cellRenderer: PurchasePrice },
      { field: 'PURCHASE_PRICE_CURRENCY_CODE', headerName: 'PURCHASE CURRENCY', cellRenderer: 'simpleTextRenderer' },
      {
        field: 'PURCHASE_UNIT_RATIO_FROM_MASTER',
        headerName: 'PURCHASE UNIT RATIO',
        cellRenderer: 'simpleTextRenderer'
      },
      { field: 'PURCHASE_UNIT_CODE_FROM_MASTER', headerName: 'PURCHASE UNIT CODE', cellRenderer: 'simpleTextRenderer' },
      {
        field: 'USAGE_UNIT_RATIO_FROM_MASTER',
        headerName: 'USAGE UNIT RATIO',
        cellRenderer: NumberFormatter
      }
    ]
  }, [])

  return (
    <>
      <div style={{ height: 500 }}>
        {/* <AgGridReact
          theme={myTheme}
          // suppressColumnVirtualisation={true}
          // suppressRowVirtualisation={true}
          rowData={getValues('directCost.materialInProcess.main.body')}
          columnDefs={columnDefs}
        /> */}
      </div>
    </>
  )
}

export default MaterialInProcessTableData
