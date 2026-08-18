import { describe, expect, test } from 'bun:test'

import { getRequesterEmployeeCode, getRequesterEmployeeName } from './requesterEmployee'

describe('requester employee fields', () => {
  test('returns the requester name and employee code separately', () => {
    const requester = { FULL_NAME: 'Test Requester', EMPLOYEE_CODE: 'S00823' }

    expect(getRequesterEmployeeCode(requester)).toBe('S00823')
    expect(getRequesterEmployeeName(requester)).toBe('Test Requester')
  })

  test('supports semantic and legacy requester fields', () => {
    const requester = { REQUEST_BY_EMPLOYEE: 'Test Requester', Request_By_EmployeeCode: 'S00823' }

    expect(getRequesterEmployeeCode(requester)).toBe('S00823')
    expect(getRequesterEmployeeName(requester)).toBe('Test Requester')
  })

  test('uses a dash only for the missing field', () => {
    const requester = { REQUEST_BY_EMPLOYEECODE: 'S00823' }

    expect(getRequesterEmployeeCode(requester)).toBe('S00823')
    expect(getRequesterEmployeeName(requester)).toBe('-')
  })
})
