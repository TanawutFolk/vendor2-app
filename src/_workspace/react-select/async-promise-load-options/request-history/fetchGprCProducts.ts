import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'

export interface GprCProductOption {
  value: number
  label: string
}

export const fetchGprCProducts = async (inputValue: string): Promise<GprCProductOption[]> => {
  try {
    const response = await RegisterRequestServices.getGprCProducts({
      SEARCH_TEXT: String(inputValue || '').trim()
    })

    if (!response.data.Status || !Array.isArray(response.data.ResultOnDb)) return []

    return response.data.ResultOnDb
      .map(item => ({
        value: Number(item.value),
        label: String(item.label || '').trim()
      }))
      .filter(item => Number.isFinite(item.value) && item.value > 0 && item.label)
  } catch (error) {
    console.error('Error fetching GPR C products:', error)
    return []
  }
}
