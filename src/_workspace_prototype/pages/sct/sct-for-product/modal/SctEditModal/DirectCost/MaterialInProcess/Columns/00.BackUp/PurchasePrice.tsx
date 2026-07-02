import { useFormContext, useWatch } from 'react-hook-form'
import { FormDataPage } from '../../../../validationSchema'
import { useMemo } from 'react'
import type { CustomCellRendererProps } from 'ag-grid-react'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'

function PurchasePrice(params: CustomCellRendererProps) {
  const { control } = useFormContext<FormDataPage>()

  const listMaterialInProcess = useWatch({
    control,
    name: 'directCost.materialInProcess.main.body'
  })

  const index_listMaterialInProcess = useMemo(
    () =>
      listMaterialInProcess?.findIndex(
        f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID
      ),
    [listMaterialInProcess, params.data.BOM_FLOW_PROCESS_ITEM_USAGE_ID]
  )

  const PURCHASE_PRICE = useWatch({
    control,
    name: `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.PURCHASE_PRICE`
  })

  return <div>{formatNumber(PURCHASE_PRICE, 7, true)}</div>
}
export default PurchasePrice
