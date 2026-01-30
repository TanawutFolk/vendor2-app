import FindVendorServices from '@/_workspace/services/_find-vendor/FindVendorServices'

// Types
export interface ProvinceOption {
    value: string
    label: string
}

/**
 * Fetch provinces for AsyncSelect
 * @param inputValue - Search input value for filtering
 * @returns Promise<ProvinceOption[]>
 */
export const fetchProvinces = (inputValue: string) =>
    new Promise<ProvinceOption[]>(resolve => {
        FindVendorServices.getProvinces()
            .then(response => {
                if (response.data.Status) {
                    const filtered = response.data.ResultOnDb.filter(item =>
                        item.label.toLowerCase().includes(inputValue.toLowerCase())
                    )
                    resolve(filtered)
                } else {
                    resolve([])
                }
            })
            .catch(error => {
                console.error('Error fetching provinces:', error)
                resolve([])
            })
    })
