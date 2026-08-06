import { useMemo } from 'react'

import useRequestStatusOptions from '@/_workspace/react-query/hooks/useRequestStatusOptions'
import useStatusMasterOptions from '@/_workspace/react-query/hooks/useStatusMasterOptions'
import { STATUS_MASTER_TYPE } from '@/_workspace/types/StatusMasterTypes'
import {
  buildApprovalStepStatusMasterIds,
  buildRequestStateMasterIds,
  buildWorkflowStepMasterIds
} from '@/_workspace/utils/workflowIdentity'

const useWorkflowIdentity = () => {
  const workflowQuery = useRequestStatusOptions()
  const approvalStatusQuery = useStatusMasterOptions(STATUS_MASTER_TYPE.APPROVAL_STEP)
  const requestStateQuery = useStatusMasterOptions(STATUS_MASTER_TYPE.REQUEST_STATE)

  const workflowStepIds = useMemo(
    () => buildWorkflowStepMasterIds(workflowQuery.data || []),
    [workflowQuery.data]
  )
  const approvalStepStatusIds = useMemo(
    () => buildApprovalStepStatusMasterIds(approvalStatusQuery.data || []),
    [approvalStatusQuery.data]
  )
  const requestStateIds = useMemo(
    () => buildRequestStateMasterIds(requestStateQuery.data || []),
    [requestStateQuery.data]
  )

  return {
    workflowStepIds,
    approvalStepStatusIds,
    requestStateIds,
    isLoading: workflowQuery.isLoading || approvalStatusQuery.isLoading || requestStateQuery.isLoading,
    isError: workflowQuery.isError || approvalStatusQuery.isError || requestStateQuery.isError
  }
}

export default useWorkflowIdentity
