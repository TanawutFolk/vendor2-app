export const fetchVendorRegions = async (inputValue: string) => {
    // Note: If you have an API route for regions in the future, you can replace this with axios.get(...)
    const options = [
        { label: 'Local', value: 'Local' },
        { label: 'Oversea', value: 'Oversea' }
    ]

    return new Promise<{ label: string; value: string }[]>((resolve) => {
        setTimeout(() => {
            if (inputValue) {
                resolve(options.filter(i => i.label.toLowerCase().includes(inputValue.toLowerCase())))
            } else {
                resolve(options)
            }
        }, 300)
    })
}
