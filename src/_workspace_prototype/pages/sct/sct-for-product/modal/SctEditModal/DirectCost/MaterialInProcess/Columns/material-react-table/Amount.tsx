import { useFormContext, useWatch } from 'react-hook-form'
import { useMemo, useEffect } from 'react'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { BomFlowProcessItemUsageI } from '@/_workspace/types/bom/BomFlowProcessItemUsage'
import { FormDataPage } from '../../../../validationSchema'

function safeToNumber(value, defaultValue = 0) {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

interface Props {
  params: BomFlowProcessItemUsageI
}

const Amount: React.FC<Props> = ({ params }) => {
  const { control, setValue } = useFormContext<FormDataPage>()

  const listMaterialInProcess = useWatch({
    control,
    name: 'directCost.materialInProcess.main.body'
  })

  const index_listMaterialInProcess = useMemo(
    () =>
      listMaterialInProcess?.findIndex(f => f.BOM_FLOW_PROCESS_ITEM_USAGE_ID == params.BOM_FLOW_PROCESS_ITEM_USAGE_ID),
    [listMaterialInProcess, params.BOM_FLOW_PROCESS_ITEM_USAGE_ID]
  )

  const usageQuantity = params.USAGE_QUANTITY

  const [yieldAccumulation, usagePrice, amount] = useWatch({
    control,
    name: [
      `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.yieldAccumulation`,
      `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.usagePrice`,
      `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.amount`
    ]
  })

  useEffect(() => {
    if (index_listMaterialInProcess === -1) return

    if (typeof usagePrice !== 'number' || typeof yieldAccumulation !== 'number' || typeof usageQuantity !== 'number') {
      setValue(`directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.amount`, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      })
    } else {
      const calculatedAmount = (usageQuantity * (usagePrice || 0)) / ((yieldAccumulation ?? 1) / 100)
      //formatNumber(calculatedAmount, 2, false)
      if (calculatedAmount !== amount) {
        setValue(
          `directCost.materialInProcess.main.body.${index_listMaterialInProcess}.price.amount`,
          safeToNumber(calculatedAmount),
          {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true
          }
        )
      }
    }
  }, [usageQuantity, usagePrice, yieldAccumulation, amount, index_listMaterialInProcess, setValue])

  return <>{formatNumber(amount, 7, true, '')}</>
}

export default Amount
