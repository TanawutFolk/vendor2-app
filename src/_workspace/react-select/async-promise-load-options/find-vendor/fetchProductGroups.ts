import FindVendorServices from '@/_workspace/services/_find-vendor/FindVendorServices'

// Types
export interface ProductGroupOption {
    value: number
    label: string
}

/**
 * Fetch product groups for AsyncSelect
 * @param inputValue - Search input value for filtering
 * @returns Promise<ProductGroupOption[]>
 */
export const fetchProductGroups = (inputValue: string) =>
    new Promise<ProductGroupOption[]>(resolve => {
        FindVendorServices.getProductGroups()
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
                console.error('Error fetching product groups:', error)
                resolve([])
            })
    })
