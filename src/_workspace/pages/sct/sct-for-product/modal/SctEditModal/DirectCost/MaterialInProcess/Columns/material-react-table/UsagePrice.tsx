import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { BomFlowProcessItemUsageI } from '@/_workspace/types/bom/BomFlowProcessItemUsage'
import { FormDataPage } from '../../../../validationSchema'

interface Props {
  params: BomFlowProcessItemUsageI
}

const UsagePrice: React.FC<Props> = ({ params }) => {
  const { control } = useFormContext<FormDataPage>()

  const listMaterialInProcess = useWatch({
    control,
    name: 'directCost.materialInProcess.main.body'
  })

  const index_listMaterialInProcess = useMemo(
    () =>
      listMaterialInProcess?.findIndex(f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == params.BOM_FLOW_PROCESS_ITEM_USAGE_ID),
    [listMaterialInProcess, params.BOM_FLOW_PROCESS_ITEM_USAGE_ID]
  )

  const usagePrice = useWatch({
    control,
    name: `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.usagePrice`
  })

  return <>{formatNumber(usagePrice, 7, true)}</>
}

export default UsagePrice
