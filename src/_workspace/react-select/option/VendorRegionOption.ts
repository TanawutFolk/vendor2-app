export interface VendorRegionOptionI {
  value: 'Local' | 'Oversea'
  label: 'Local' | 'Oversea'
}

const VendorRegionOption: VendorRegionOptionI[] = [
  { value: 'Local', label: 'Local' },
  { value: 'Oversea', label: 'Oversea' }
]

export default VendorRegionOption
