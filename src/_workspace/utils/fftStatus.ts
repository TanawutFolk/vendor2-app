const TERMINAL_REQUEST_STATUSES = new Set([
    'COMPLETED',
    'REJECTED',
    'VENDOR DISAGREED',
    'CANCELLED'
])

const FFT_STATUS_LABELS: Record<string, string> = {
    '0': 'Not Registered',
    '1': 'Registered',
    '2': 'Cannot Register'
}

const normalizeStatus = (value: unknown) => String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const formatFftStatus = (
    fftStatus: unknown,
    options?: {
        statusCheck?: unknown
        requestStatus?: unknown
    }
) => {
    const statusCheck = normalizeStatus(options?.statusCheck)

    if (statusCheck) return statusCheck

    const fftStatusKey = normalizeStatus(fftStatus)
    const requestStatus = normalizeStatus(options?.requestStatus)

    if (requestStatus && !TERMINAL_REQUEST_STATUSES.has(requestStatus.toUpperCase())) {
        return 'In Progress'
    }

    return FFT_STATUS_LABELS[fftStatusKey] || fftStatusKey || '-'
}
