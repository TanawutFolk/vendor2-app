export type BlacklistGroup = 'US' | 'CN'

export interface BlacklistRow {
    blacklist_id: number
    vendor_name: string
    group_code: BlacklistGroup
    source_name?: string | null
    entity_number?: string | null
    entity_type?: string | null
    programs?: string | null
    country?: string | null
    wmd_type?: string | null
    description?: string | null
    create_by?: string | null
    update_by?: string | null
    in_use?: 0 | 1
    alias_count?: number
    updated_date: string
    create_date?: string
}

export interface BlacklistSearchFilters {
    vendor_name: string
    group_code: 'ALL' | BlacklistGroup
}

export interface UploadBlacklistPayload {
    format: BlacklistGroup
    file: File
}

export interface UploadBlacklistImportPayload {
    format: BlacklistGroup
    formData: FormData
}
