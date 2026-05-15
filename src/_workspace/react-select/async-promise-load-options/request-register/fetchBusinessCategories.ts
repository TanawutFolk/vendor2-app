import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

export interface BusinessCategoryOption {
    value: string
    label: string
    BUSINESS_CATEGORY_ID?: number
    DESCRIPTION?: string | null
}

export const fetchBusinessCategories = (inputValue: string) =>
    new Promise<BusinessCategoryOption[]>(resolve => {
        RegisterRequestServices.getBusinessCategories()
            .then(response => {
                if (!response.data.Status) {
                    resolve([])
                    return
                }

                const keyword = inputValue.trim().toLowerCase()
                const filtered = response.data.ResultOnDb.filter(item =>
                    !keyword || item.label.toLowerCase().includes(keyword)
                )

                resolve(filtered)
            })
            .catch(error => {
                console.error('Error fetching business categories:', error)
                resolve([])
            })
    })
