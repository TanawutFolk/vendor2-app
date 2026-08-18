import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import ApprovalFlowSettingServices from '@/_workspace/services/_approval-flow-setting/ApprovalFlowSettingServices'
import type { ApprovalFlowDataI } from '@/_workspace/types/_approval-flow-setting/ApprovalFlowSettingTypes'

export const APPROVAL_FLOW_SETTING_QUERY_KEY = 'APPROVAL_FLOW_SETTING'

const unwrap = <T>(response: { data?: { Status?: boolean; Message?: string; ResultOnDb?: T } }, fallback: string) => {
  if (!response.data?.Status) throw new Error(response.data?.Message || fallback)
  return response.data.ResultOnDb as T
}

export const useApprovalFlowSetting = (workflowDefinitionId?: number) =>
  useQuery({
    queryKey: [APPROVAL_FLOW_SETTING_QUERY_KEY, workflowDefinitionId || 'ACTIVE'],
    queryFn: async () => {
      const response = await ApprovalFlowSettingServices.getWorkflowSetting({
        WORKFLOW_DEFINITION_ID: workflowDefinitionId || undefined
      })
      return unwrap(response, 'Failed to load approval flow')
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  })

export const useWorkflowStepTypes = () =>
  useQuery({
    queryKey: [APPROVAL_FLOW_SETTING_QUERY_KEY, 'STEP_TYPES'],
    queryFn: async () => {
      const response = await ApprovalFlowSettingServices.getWorkflowStepTypes()
      return unwrap(response, 'Failed to load workflow step types')
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })

type ApprovalFlowApiResult<T> = {
  data?: { Status?: boolean; Message?: string; ResultOnDb?: T }
}

const useApprovalFlowMutation = <TResult>(
  mutationFn: (data: Record<string, unknown>) => Promise<ApprovalFlowApiResult<TResult>>,
  fallback: string,
  onSuccess?: (data: TResult) => void,
  onError?: (error: Error) => void
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => unwrap(await mutationFn(data), fallback),
    onSuccess: data => {
      void queryClient.invalidateQueries({ queryKey: [APPROVAL_FLOW_SETTING_QUERY_KEY] })
      onSuccess?.(data)
    },
    onError
  })
}

export const useSaveWorkflowSetting = (
  onSuccess?: (data: ApprovalFlowDataI) => void,
  onError?: (error: Error) => void
) =>
  useApprovalFlowMutation<ApprovalFlowDataI>(
    ApprovalFlowSettingServices.saveWorkflowSetting,
    'Failed to save approval flow settings',
    onSuccess,
    onError
  )

export const useCreateWorkflowDraft = (
  onSuccess?: (data: ApprovalFlowDataI) => void,
  onError?: (error: Error) => void
) =>
  useApprovalFlowMutation<ApprovalFlowDataI>(
    ApprovalFlowSettingServices.createWorkflowDraft,
    'Failed to create workflow draft',
    onSuccess,
    onError
  )

export const useSaveWorkflowDraft = (onSuccess?: (data: ApprovalFlowDataI) => void, onError?: (error: Error) => void) =>
  useApprovalFlowMutation<ApprovalFlowDataI>(
    ApprovalFlowSettingServices.saveWorkflowDraft,
    'Failed to save workflow draft',
    onSuccess,
    onError
  )

export const usePublishWorkflow = (onSuccess?: (data: ApprovalFlowDataI) => void, onError?: (error: Error) => void) =>
  useApprovalFlowMutation<ApprovalFlowDataI>(
    ApprovalFlowSettingServices.publishWorkflow,
    'Failed to publish workflow',
    onSuccess,
    onError
  )

export const useDiscardWorkflowDraft = (
  onSuccess?: (data: Record<string, unknown>) => void,
  onError?: (error: Error) => void
) =>
  useApprovalFlowMutation<Record<string, unknown>>(
    ApprovalFlowSettingServices.discardWorkflowDraft,
    'Failed to discard workflow draft',
    onSuccess,
    onError
  )
