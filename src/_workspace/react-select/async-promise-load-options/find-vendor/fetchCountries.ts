import FindVendorServices from '@/_workspace/services/_find-vendor/FindVendorServices'

export interface CountryOption {
  value: string
  label: string
  INFO_COUNTRY_ID?: number
  DESCRIPTION?: string | null
}

export const fetchCountries = (inputValue: string) =>
  new Promise<CountryOption[]>(resolve => {
    FindVendorServices.getCountries()
      .then(response => {
        if (!response.data.Status) {
          resolve([])
          return
        }

        const keyword = inputValue.trim().toLowerCase()
        const filtered = response.data.ResultOnDb.map(item => ({ ...item, value: String(item.value) })).filter(
          item => !keyword || item.label.toLowerCase().includes(keyword)
        )

        resolve(filtered)
      })
      .catch(error => {
        console.error('Error fetching countries:', error)
        resolve([])
      })
  })
