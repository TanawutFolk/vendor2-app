import { useMemo, useState } from 'react'

import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { useFormContext } from 'react-hook-form'
import { FormDataPage } from '../../validationSchema'

import type { CustomCellRendererProps } from 'ag-grid-react'
import { AgGridReact } from 'ag-grid-react'

import { ColDef, themeQuartz } from 'ag-grid-community'
import { useCalculateYieldAccumulation } from '../../MasterDataSelection/hooks/useCalculateYieldAccumulation'

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

const MaterialInProcessTableData_AgGrid = () => {
  const { getValues, watch, control, setValue } = useFormContext<FormDataPage>()

  const listMaterialInProcess = getValues('directCost.materialInProcess.main.body')
  const isCalculationAlready = getValues('isCalculationAlready')
  const sctResourceOptionYieldRateMaterial = getValues('masterDataSelection.yieldRateMaterial.SCT_RESOURCE_OPTION_ID')
  const listSctBomFlowProcessItemUsagePrice = getValues('listSctBomFlowProcessItemUsagePrice')
  const yieldRateData = getValues('directCost.flowProcess.body.yieldRateGoStraightRateProcessForSct.main')

  const { isCalculating } = useCalculateYieldAccumulation({
    listMaterialInProcess,
    isCalculationAlready,
    sctResourceOptionYieldRateMaterial,
    listSctBomFlowProcessItemUsagePrice,
    yieldRateData
  })

  const [columnDefs] = useState([
    { field: 'ITEM_NO', headerName: 'ITEM NO', width: 120, pinned: 'left', cellRenderer: 'simpleTextRenderer' },
    { field: 'ITEM_CODE_FOR_SUPPORT_MES', headerName: 'ITEM CODE', pinned: 'left', cellRenderer: 'simpleTextRenderer' },
    {
      field: 'ITEM_CATEGORY_NAME_FROM_BOM',
      headerName: 'ITEM CATEGORY NAME (BOM)',
      width: 270,
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
      cellRenderer: (props: CustomCellRendererProps) => {
        return <>{formatNumber(props.value, 7, true)}</>
      }
    },
    { field: 'USAGE_UNIT_CODE_FROM_MASTER', headerName: 'USAGE UNIT CODE', cellRenderer: 'simpleTextRenderer' },
    {
      field: 'USAGE_PRICE',
      headerName: 'USAGE PRICE (STANDARD PRICE) (THB)',
      width: 300,
      cellRenderer: (props: CustomCellRendererProps) => {
        return (
          <>
            {formatNumber(
              getValues(`directCost.materialInProcess.main.body.${Number(props.data.ITEM_NO - 1)}.price.usagePrice`),
              2
            )}
          </>
        )
      }
    },
    { field: 'USAGE_PRICE_CURRENCY', headerName: 'USAGE CURRENCY', cellRenderer: () => 'THB' },
    { field: 'PROCESS_NO', headerName: 'PROCESS NO' },
    { field: 'PROCESS_NAME', headerName: 'PROCESS NAME', width: 250 },
    {
      field: 'YIELD_ACCUMULATION_MATERIAL',
      headerName: 'YIELD ACCUMULATION (%)',
      width: 250,
      cellRenderer: (props: CustomCellRendererProps) => {
        return (
          <>
            {formatNumber(
              getValues(
                `directCost.materialInProcess.main.body.${Number(props.data.ITEM_NO - 1)}.price.yieldAccumulation`
              ),
              2,
              false,
              '%'
            )}
          </>
        )
      }
    },
    {
      field: 'AMOUNT',
      headerName: 'AMOUNT (THB)',
      cellRenderer: (props: CustomCellRendererProps) => {
        return (
          <>
            {formatNumber(
              getValues(`directCost.materialInProcess.main.body.${Number(props.data.ITEM_NO - 1)}.price.amount`),
              2,
              true
            )}
          </>
        )
      }
    },
    {
      field: 'PURCHASE_PRICE',
      headerName: 'PURCHASE PRICE',
      cellRenderer: (props: CustomCellRendererProps) => {
        return <>{formatNumber(props.value, 7, true)}</>
      }
    },
    { field: 'PURCHASE_PRICE_CURRENCY_CODE', headerName: 'PURCHASE CURRENCY', cellRenderer: 'simpleTextRenderer' },
    { field: 'PURCHASE_UNIT_RATIO_FROM_MASTER', headerName: 'PURCHASE UNIT RATIO', cellRenderer: 'simpleTextRenderer' },
    { field: 'PURCHASE_UNIT_CODE_FROM_MASTER', headerName: 'PURCHASE UNIT CODE', cellRenderer: 'simpleTextRenderer' },
    {
      field: 'USAGE_UNIT_RATIO_FROM_MASTER',
      headerName: 'USAGE UNIT RATIO',
      cellRenderer: (props: CustomCellRendererProps) => {
        return <>{formatNumber(props.value, 7, true)}</>
      }
    }
  ])

  return (
    <>
      <div style={{ height: 500 }}>
        <AgGridReact
          theme={myTheme}
          suppressColumnVirtualisation={true}
          suppressRowVirtualisation={true}
          rowData={listMaterialInProcess}
          columnDefs={columnDefs}
          //rowNumbers={true}
          cellSelection={true}
          // cellSelection={true}
          copyHeadersToClipboard={true}
          // เปิด DOM Virtualization
          //suppressHorizontalScroll={true}
          // ตั้งค่า rowBuffer
          // rowBuffer={50}
          // ใช้ rowModel แบบ client-side
          // rowModelType={'clientSide'}
          // animateRows={false}
          // suppressRowClickSelection={true}
          // suppressCellSelection={true}
          // enableCellExpressions={false}
          // enableRangeSelection={false}
          // rowBuffer={30}
          // suppressDragLeaveHidesColumns={true}
          // suppressMakeColumnVisibleAfterUnGroup={true}
          // enableCellTextSelection={true}
          // ensureDomOrder={true}
        />
      </div>
    </>
  )
}

export default MaterialInProcessTableData_AgGrid
