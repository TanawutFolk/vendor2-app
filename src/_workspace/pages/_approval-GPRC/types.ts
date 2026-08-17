export type GprCQueueRow = {
  REQUEST_REGISTER_VENDOR_ID?: number
  REQUEST_NUMBER?: string
  REQUEST_STATUS?: string
  M_REQUEST_STATUS_ID?: number
  M_REQUEST_STATE_ID?: number
  REQUEST_STATE?: string
  REQUEST_VENDOR_GPR_C_FLOWS_ID?: number
  M_GPR_C_FLOW_STATUS_ID?: number
  FLOW_STATUS?: string
  REQUEST_VENDOR_GPR_C_STEPS_ID?: number
  STEP_CODE?: string
  STEP_NAME?: string
  STEP_ORDER?: number
  APPROVER_EMPCODE?: string
  APPROVER_NAME?: string
  M_APPROVAL_STEP_STATUS_ID?: number
  STEP_STATUS?: string
  COMPANY_NAME?: string
  CONTACT_NAME?: string
  VENDOR_EMAIL?: string
  SUPPORTPRODUCT_PROCESS?: string
  PURCHASE_FREQUENCY?: string
  ADDRESS?: string
  VENDOR_REGION?: string
  TEL_PHONE?: string
  [key: string]: unknown
}

export type GprCActionRequiredRow = {
  REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID?: number
  REQUEST_REGISTER_VENDOR_ID?: number
  STAGE_NAME?: string
  STAGE_CODE?: string
  REQUIRED_DETAIL?: string
  M_ACTION_RESULT_STATUS_ID?: number
  RESULT_STATUS?: string
  REQUEST_NUMBER?: string
  REQUEST_STATUS?: string
  M_REQUEST_STATUS_ID?: number
  M_REQUEST_STATE_ID?: number
  REQUEST_STATE?: string
  COMPANY_NAME?: string
  [key: string]: unknown
}

export type GprCDialogMode = 'APPROVE' | 'RECHECK' | 'REJECT'
