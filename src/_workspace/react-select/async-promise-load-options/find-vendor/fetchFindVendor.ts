import FindVendorServices from '@/_workspace/services/_find-vendor/FindVendorServices'

// Types
export interface VendorTypeOption {
    value: number
    label: string
}

export interface ProvinceOption {
    value: string
    label: string
}

export interface ProductGroupOption {
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
