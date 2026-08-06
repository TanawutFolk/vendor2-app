import type { StatusMasterOption } from '@/_workspace/types/StatusMasterTypes'

export const VENDOR_STATUS_MASTER_KEY = {
  NOT_REGISTERED: 'NOT_REGISTERED',
  REGISTERED: 'REGISTERED',
  IN_PROGRESS: 'IN_PROGRESS',
  CANNOT_REGISTER: 'CANNOT_REGISTER'
} as const

export type VendorStatusMasterKey = keyof typeof VENDOR_STATUS_MASTER_KEY
export type VendorStatusMasterIds = Record<VendorStatusMasterKey, number | null>

const toVendorStatusId = (value: unknown): number | null => {
  const id = Number(value)
  return Number.isInteger(id) && id >= 0 ? id : null
}

const normalizeCode = (value: unknown) => String(value ?? '').trim().toUpperCase()

export const buildVendorStatusMasterIds = (options: StatusMasterOption[] = []): VendorStatusMasterIds =>
  Object.keys(VENDOR_STATUS_MASTER_KEY).reduce((result, key) => {
    const typedKey = key as VendorStatusMasterKey
    const code = VENDOR_STATUS_MASTER_KEY[typedKey]
    const matched = options.find(option => normalizeCode(option.STATUS_CODE) === code)
    result[typedKey] = toVendorStatusId(matched?.STATUS_ID)
    return result
  }, {} as VendorStatusMasterIds)

export const getVendorStatusMasterId = (vendor: unknown): number | null => {
  if (vendor === null || vendor === undefined || typeof vendor !== 'object') return toVendorStatusId(vendor)
  const row = vendor as Record<string, unknown>
  return toVendorStatusId(row.M_VENDOR_STATUS_ID ?? row.m_vendor_status_id)
}

export const isVendorStatusMaster = (vendor: unknown, statusId: number | null | undefined) => {
  const actualId = getVendorStatusMasterId(vendor)
  const expectedId = toVendorStatusId(statusId)
  return actualId !== null && expectedId !== null && actualId === expectedId
}
