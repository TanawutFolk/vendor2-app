import FindVendorServices from '@/_workspace/services/_find-vendor/FindVendorServices'

// Types
export interface VendorTypeOption {
    value: number
    label: string
}

/**
 * Fetch vendor types for AsyncSelect
 * @param inputValue - Search input value for filtering
 * @returns Promise<VendorTypeOption[]>
 */
export const fetchVendorTypes = (inputValue: string) =>
    new Promise<VendorTypeOption[]>(resolve => {
        FindVendorServices.getVendorTypes()
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
                console.error('Error fetching vendor types:', error)
                resolve([])
            })
    })
