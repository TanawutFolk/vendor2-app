const FFT_STATUS_LABELS: Record<string, string> = {
  '0': 'Not Registered',
  '1': 'Registered',
  '2': 'Cannot Register'
}

export const VENDOR_STATUS_CODE = {
  NOT_REGISTERED: 'NOT_REGISTERED',
  REGISTERED: 'REGISTERED',
  IN_PROGRESS: 'IN_PROGRESS',
  CANNOT_REGISTER: 'CANNOT_REGISTER'
} as const

export type VendorStatusCode = (typeof VENDOR_STATUS_CODE)[keyof typeof VENDOR_STATUS_CODE]

const normalizeStatus = (value: unknown) =>
  String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const formatFftStatus = (fftStatus: unknown) => {
  const fftStatusKey = normalizeStatus(fftStatus)

  return FFT_STATUS_LABELS[fftStatusKey] || fftStatusKey || '-'
}

export const normalizeVendorStatusCode = (value: unknown): VendorStatusCode => {
  const normalized = normalizeStatus(value).toUpperCase().replace(/\s+/g, '_')

  switch (normalized) {
    case '1':
    case VENDOR_STATUS_CODE.REGISTERED:
      return VENDOR_STATUS_CODE.REGISTERED
    case VENDOR_STATUS_CODE.IN_PROGRESS:
      return VENDOR_STATUS_CODE.IN_PROGRESS
    case '2':
    case VENDOR_STATUS_CODE.CANNOT_REGISTER:
      return VENDOR_STATUS_CODE.CANNOT_REGISTER
    case '0':
    case VENDOR_STATUS_CODE.NOT_REGISTERED:
    default:
      return VENDOR_STATUS_CODE.NOT_REGISTERED
  }
}
