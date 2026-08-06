import type { StatusMasterOption } from '@/_workspace/types/StatusMasterTypes'

export const ACTION_RESULT_STATUS_MASTER_KEY = {
  PENDING: 'PENDING',
  INCOMPLETE: 'INCOMPLETE',
  COMPLETED: 'COMPLETED'
} as const

export type ActionResultStatusMasterIds = Record<keyof typeof ACTION_RESULT_STATUS_MASTER_KEY, number | null>

const normalizeCode = (value: unknown) => String(value ?? '').trim().toUpperCase()

export const buildActionResultStatusMasterIds = (
  options: StatusMasterOption[] = []
): ActionResultStatusMasterIds =>
  Object.keys(ACTION_RESULT_STATUS_MASTER_KEY).reduce(
    (ids, key) => {
      const typedKey = key as keyof typeof ACTION_RESULT_STATUS_MASTER_KEY
      const option = options.find(
        item => normalizeCode(item.STATUS_CODE) === ACTION_RESULT_STATUS_MASTER_KEY[typedKey]
      )
      const statusId = Number(option?.STATUS_ID)
      ids[typedKey] = Number.isInteger(statusId) && statusId > 0 ? statusId : null
      return ids
    },
    {} as ActionResultStatusMasterIds
  )
