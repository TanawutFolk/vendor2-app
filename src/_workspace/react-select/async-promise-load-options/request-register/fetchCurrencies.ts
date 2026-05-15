import RegisterRequestServices from '@_workspace/services/_register-request/RegisterRequestServices'

export interface CurrencyOption {
    value: string
    label: string
    CURRENCY_ID?: number
}

export const fetchCurrencies = (inputValue: string) =>
    new Promise<CurrencyOption[]>(resolve => {
        RegisterRequestServices.getCurrencies()
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
                console.error('Error fetching currencies:', error)
                resolve([])
            })
    })
