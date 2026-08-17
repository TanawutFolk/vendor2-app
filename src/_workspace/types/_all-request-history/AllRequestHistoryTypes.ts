export interface AllRequestHistorySort {
  id: string
  desc: boolean
}

export interface AllRequestHistorySearchRequest {
  REQUESTER_SECTION: string | null
  REQUEST_YEAR: number | null
  ORDER: AllRequestHistorySort[]
  START: number
  LIMIT: number
}

export interface AllRequestHistoryFilterOptionRow {
  REQUESTER_SECTION: string | null
  REQUEST_YEAR: number | null
}

export interface AllRequestHistoryRow extends Record<string, unknown> {
  REQUEST_REGISTER_VENDOR_ID: number
  REQUEST_NUMBER?: string
  REQUESTER_SECTION?: string
  REQUEST_YEAR?: number
  REQUEST_STATUS?: string
  COMPANY_NAME?: string
  EMPLOYEE_CODE?: string
  FULL_NAME?: string
  SUPPORTPRODUCT_PROCESS?: string
  ASSIGN_TO?: string
  DOCUMENTS_COUNT?: number
  CREATE_DATE?: string
}

export type AllRequestHistoryDetail = Record<string, unknown>
