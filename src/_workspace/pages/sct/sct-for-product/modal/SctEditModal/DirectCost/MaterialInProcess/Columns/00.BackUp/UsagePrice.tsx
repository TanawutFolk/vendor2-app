import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import type { CustomCellRendererProps } from 'ag-grid-react'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FormDataPage } from '../../../../validationSchema'

const UsagePrice = (params: CustomCellRendererProps) => {
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

  const usagePrice = useWatch({
    control,
    name: `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.usagePrice`
  })

  return <>{formatNumber(usagePrice, 7, true)}</>
}

export default UsagePrice
