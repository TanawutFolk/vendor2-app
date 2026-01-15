const StatusColumn: {
  value: number
  label: string
  color: 'default' | 'success' | 'info' | 'warning' | 'error' | 'primary' | 'secondary' | 'purple'
}[] = [
  {
    value: 4,
    label: 'Draft',
    color: 'purple'
  },
  {
    value: 2,
    label: 'Using',
    color: 'warning'
  },
  {
    value: 1,
    label: 'Can use',
    color: 'success'
  },
  {
    value: 3,
    label: 'Can use (Used)',
    color: 'info'
  },
  {
    value: 0,
    label: 'Cancel',
    color: 'secondary'
  }
]

export default StatusColumn
