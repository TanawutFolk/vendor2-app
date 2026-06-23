const FFT_STATUS_LABELS: Record<string, string> = {
    '0': 'Not Registered',
    '1': 'Registered',
    '2': 'Cannot Register'
}

const normalizeStatus = (value: unknown) => String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const formatFftStatus = (fftStatus: unknown) => {
    const fftStatusKey = normalizeStatus(fftStatus)

    return FFT_STATUS_LABELS[fftStatusKey] || fftStatusKey || '-'
}
