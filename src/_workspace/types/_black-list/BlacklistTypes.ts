export interface BlacklistI {
  BLACKLIST_ID: number
  VENDOR_NAME: string
  GROUP_CODE: 'US' | 'CN'
  SOURCE_NAME?: string | null
  ENTITY_NUMBER?: string | null
  ENTITY_TYPE?: string | null
  PROGRAMS?: string | null
  COUNTRY?: string | null
  WMD_TYPE?: string | null
  DESCRIPTION?: string | null
  CREATE_BY?: string | null
  UPDATE_BY?: string | null
  IN_USE?: 0 | 1
  ALIAS_COUNT?: number
  UPDATED_DATE: string
  CREATE_DATE?: string
}
