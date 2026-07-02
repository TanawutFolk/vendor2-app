import { useFormContext, useFormState } from 'react-hook-form'
import { useIndirectCostCondition } from './hooks/useIndirectCostCondition'
import Topic from './Topic'
import { FormDataPage } from '../validationSchema'
import { useDirectCostCondition } from './hooks/useDirectCostCondition'
import { useSpecialCostCondition } from './hooks/useSpecialCostCondition'
import { useOtherCostCondition } from './hooks/useOtherCostCondition'
import { useYieldRateGoStraightRate } from './hooks/useYieldRateGoStraightRate'
import { useClearTime } from './hooks/useClearTime'
import { useManufacturingItemPrice } from './hooks/useManufacturingItemPrice'

function MasterDataSelection() {
  return (
    <>
      <Topic />
    </>
  )
}
export default MasterDataSelection
