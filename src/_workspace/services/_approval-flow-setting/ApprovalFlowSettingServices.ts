import type { AxiosResponse } from 'axios'

import axiosRequest from '@/libs/axios/axiosRequest'
import ApprovalFlowSettingAPI from '@/_workspace/api/_approval-flow-setting/ApprovalFlowSettingAPI'
import type {
  ApprovalFlowDataI,
  ApprovalFlowResponseI,
  ApprovalGroupI,
  WorkflowStepTypeI
} from '@/_workspace/types/_approval-flow-setting/ApprovalFlowSettingTypes'

export default class ApprovalFlowSettingServices {
  static getWorkflowSetting(
    data: Record<string, unknown> = {}
  ): Promise<AxiosResponse<ApprovalFlowResponseI<ApprovalFlowDataI>>> {
    return axiosRequest<ApprovalFlowResponseI<ApprovalFlowDataI>>({
      url: `${ApprovalFlowSettingAPI.API_ROOT_URL}/getWorkflowSetting`,
      data,
      method: 'POST'
    })
  }

  static getApprovalGroups(
    data: Record<string, unknown> = {}
  ): Promise<AxiosResponse<ApprovalFlowResponseI<ApprovalGroupI[]>>> {
    return axiosRequest<ApprovalFlowResponseI<ApprovalGroupI[]>>({
      url: `${ApprovalFlowSettingAPI.API_ROOT_URL}/getApprovalGroups`,
      data,
      method: 'POST'
    })
  }

  static getWorkflowStepTypes(
    data: Record<string, unknown> = {}
  ): Promise<AxiosResponse<ApprovalFlowResponseI<WorkflowStepTypeI[]>>> {
    return axiosRequest<ApprovalFlowResponseI<WorkflowStepTypeI[]>>({
      url: `${ApprovalFlowSettingAPI.API_ROOT_URL}/getWorkflowStepTypes`,
      data,
      method: 'POST'
    })
  }

  static saveWorkflowSetting(
    data: Record<string, unknown>
  ): Promise<AxiosResponse<ApprovalFlowResponseI<ApprovalFlowDataI>>> {
    return axiosRequest<ApprovalFlowResponseI<ApprovalFlowDataI>>({
      url: `${ApprovalFlowSettingAPI.API_ROOT_URL}/saveWorkflowSetting`,
      data,
      method: 'POST'
    })
  }

  static createWorkflowDraft(
    data: Record<string, unknown>
  ): Promise<AxiosResponse<ApprovalFlowResponseI<ApprovalFlowDataI>>> {
    return axiosRequest<ApprovalFlowResponseI<ApprovalFlowDataI>>({
      url: `${ApprovalFlowSettingAPI.API_ROOT_URL}/createWorkflowDraft`,
      data,
      method: 'POST'
    })
  }

  static saveWorkflowDraft(
    data: Record<string, unknown>
  ): Promise<AxiosResponse<ApprovalFlowResponseI<ApprovalFlowDataI>>> {
    return axiosRequest<ApprovalFlowResponseI<ApprovalFlowDataI>>({
      url: `${ApprovalFlowSettingAPI.API_ROOT_URL}/saveWorkflowDraft`,
      data,
      method: 'POST'
    })
  }

  static validateWorkflowDraft(
    data: Record<string, unknown>
  ): Promise<AxiosResponse<ApprovalFlowResponseI<{ ISSUES?: string[] }>>> {
    return axiosRequest<ApprovalFlowResponseI<{ ISSUES?: string[] }>>({
      url: `${ApprovalFlowSettingAPI.API_ROOT_URL}/validateWorkflowDraft`,
      data,
      method: 'POST'
    })
  }

  static publishWorkflow(
    data: Record<string, unknown>
  ): Promise<AxiosResponse<ApprovalFlowResponseI<ApprovalFlowDataI>>> {
    return axiosRequest<ApprovalFlowResponseI<ApprovalFlowDataI>>({
      url: `${ApprovalFlowSettingAPI.API_ROOT_URL}/publishWorkflow`,
      data,
      method: 'POST'
    })
  }

  static discardWorkflowDraft(
    data: Record<string, unknown>
  ): Promise<AxiosResponse<ApprovalFlowResponseI<Record<string, unknown>>>> {
    return axiosRequest<ApprovalFlowResponseI<Record<string, unknown>>>({
      url: `${ApprovalFlowSettingAPI.API_ROOT_URL}/discardWorkflowDraft`,
      data,
      method: 'POST'
    })
  }
}
