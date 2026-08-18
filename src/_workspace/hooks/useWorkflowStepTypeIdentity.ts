import { useMemo } from 'react'

import { useWorkflowStepTypes } from '@/_workspace/react-query/hooks/useApprovalFlowSetting'
import { buildWorkflowStepTypeIds } from '@/_workspace/utils/workflowIdentity'

const useWorkflowStepTypeIdentity = () => {
  const workflowStepTypesQuery = useWorkflowStepTypes()
  const workflowStepTypeIds = useMemo(
    () => buildWorkflowStepTypeIds(workflowStepTypesQuery.data || []),
    [workflowStepTypesQuery.data]
  )

  return {
    workflowStepTypeIds,
    isLoading: workflowStepTypesQuery.isLoading,
    isError: workflowStepTypesQuery.isError
  }
}

export default useWorkflowStepTypeIdentity
