type RequesterSource = Record<string, unknown> | null | undefined

const hasValue = (value: unknown) => value !== null && value !== undefined && String(value).trim() !== ''

const readValue = (source: RequesterSource, keys: string[]) => {
  if (!source) return undefined

  for (const key of keys) {
    const matchedKey = Object.keys(source).find(sourceKey => sourceKey.toUpperCase() === key)
    const value = matchedKey ? source[matchedKey] : undefined
    if (hasValue(value)) return value
  }

  return undefined
}

const getRequesterEmployee = (...sources: RequesterSource[]) => {
  let employeeCode: unknown
  let employeeName: unknown

  for (const source of sources) {
    employeeCode ??= readValue(source, [
      'REQUEST_BY_EMPLOYEECODE',
      'REQUEST_BY_EMPLOYEE_CODE',
      'EMPLOYEE_CODE'
    ])
    employeeName ??= readValue(source, [
      'REQUEST_BY_EMPLOYEE',
      'REQUEST_BY_EMPLOYEE_NAME',
      'FULL_NAME',
      'REQUESTER_NAME'
    ])
  }

  if (employeeName && typeof employeeName === 'object') {
    const employee = employeeName as Record<string, unknown>
    employeeCode ??= readValue(employee, [
      'REQUEST_BY_EMPLOYEECODE',
      'REQUEST_BY_EMPLOYEE_CODE',
      'EMPLOYEE_CODE',
      'EMPCODE'
    ])
    employeeName = readValue(employee, ['FULL_NAME', 'EMPLOYEE_NAME', 'EMPNAME'])
  }

  return {
    employeeCode: String(employeeCode || '').trim() || '-',
    employeeName: String(employeeName || '').trim() || '-'
  }
}

export const getRequesterEmployeeCode = (...sources: RequesterSource[]) =>
  getRequesterEmployee(...sources).employeeCode

export const getRequesterEmployeeName = (...sources: RequesterSource[]) =>
  getRequesterEmployee(...sources).employeeName
