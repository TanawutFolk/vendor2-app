export const STATUS_MASTER_TYPE = {
  APPROVAL_STEP: 'APPROVAL_STEP',
  REQUEST_STATE: 'REQUEST_STATE',
  GPR_C_FLOW: 'GPR_C_FLOW',
  ACTION_RESULT: 'ACTION_RESULT',
  VENDOR: 'VENDOR'
} as const

export const ACTION_RESULT_STATUS_CODE = {
  PENDING: 'PENDING',
  INCOMPLETE: 'INCOMPLETE',
  COMPLETED: 'COMPLETED'
} as const

export type StatusMasterType = (typeof STATUS_MASTER_TYPE)[keyof typeof STATUS_MASTER_TYPE]

export interface StatusMasterRow {
  MASTER_TYPE: StatusMasterType
  STATUS_ID: number
  STATUS_CODE: string
  STATUS_LABEL_EN: string
  STATUS_LABEL_TH?: string | null
  IS_TERMINAL?: number | null
  SORT_ORDER: number
  DESCRIPTION?: string | null
}

export interface StatusMasterOption extends StatusMasterRow {
  value: number
  label: string
}

export interface StatusMasterResponseI {
  Status: boolean
  ResultOnDb: StatusMasterRow[]
  TotalCountOnDb: number
  MethodOnDb: string
  Message: string
}

export const normalizeStatusMasterOption = (value: unknown): StatusMasterOption | null => {
  if (!value || typeof value !== 'object') return null

  const option = value as Partial<StatusMasterOption>
  const statusId = Number(option.STATUS_ID ?? option.value)
  const minimumStatusId = option.MASTER_TYPE === STATUS_MASTER_TYPE.VENDOR ? 0 : 1
  if (!Number.isInteger(statusId) || statusId < minimumStatusId) return null

  const statusCode = String(option.STATUS_CODE || '').trim().toUpperCase()
  const label = String(option.label || option.STATUS_LABEL_EN || '').trim()
  if (!statusCode || !label) return null

  return {
    MASTER_TYPE: option.MASTER_TYPE as StatusMasterType,
    STATUS_ID: statusId,
    STATUS_CODE: statusCode,
    STATUS_LABEL_EN: String(option.STATUS_LABEL_EN || label),
    STATUS_LABEL_TH: option.STATUS_LABEL_TH ?? null,
    IS_TERMINAL: option.IS_TERMINAL ?? null,
    SORT_ORDER: Number(option.SORT_ORDER || 0),
    DESCRIPTION: option.DESCRIPTION ?? null,
    value: statusId,
    label
  }
}
