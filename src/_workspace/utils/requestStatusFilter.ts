type RequestStatusOptionLike =
  | {
      M_REQUEST_STATUS_ID?: unknown
      value?: unknown
      label?: unknown
    }
  | null
  | undefined

export type RequestStatusFilterItem = {
  id: string
  value: number | null
}

export const normalizeRequestStatusOption = (option: unknown) => {
  if (!option || typeof option !== 'object') return null

  const value = option as { M_REQUEST_STATUS_ID?: unknown; value?: unknown; label?: unknown }
  const statusId = Number(value.M_REQUEST_STATUS_ID)
  const statusValue = String(value.value ?? '').trim()
  const label = String(value.label ?? '').trim()

  if (!Number.isInteger(statusId) || statusId <= 0 || !statusValue || !label) return null

  return { M_REQUEST_STATUS_ID: statusId, value: statusValue, label }
}

export const buildRequestStatusFilter = (
  option: RequestStatusOptionLike,
  statusIdField = 'CURRENT_M_REQUEST_STATUS_ID'
): RequestStatusFilterItem => {
  const statusId = Number(option?.M_REQUEST_STATUS_ID)

  if (Number.isInteger(statusId) && statusId > 0) {
    return { id: statusIdField, value: statusId }
  }

  return { id: statusIdField, value: null }
}
