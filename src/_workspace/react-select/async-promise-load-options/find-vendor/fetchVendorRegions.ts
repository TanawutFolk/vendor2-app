export interface VendorRegionOption {
  label: string
  value: 'Local' | 'Oversea'
}

export const fetchVendorRegions = async (inputValue: string) => {
  // Note: If you have an API route for regions in the future, you can replace this with axios.get(...)
  const options: VendorRegionOption[] = [
    { label: 'Local', value: 'Local' },
    { label: 'Oversea', value: 'Oversea' }
  ]

  return new Promise<VendorRegionOption[]>(resolve => {
    setTimeout(() => {
      if (inputValue) {
        resolve(options.filter(i => i.label.toLowerCase().includes(inputValue.toLowerCase())))
      } else {
        resolve(options)
      }
    }, 300)
  })
}
