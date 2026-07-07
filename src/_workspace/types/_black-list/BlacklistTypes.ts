export type BlacklistGroup = 'US' | 'CN'

export interface BlacklistRow {
    BLACKLIST_ID: number
    VENDOR_NAME: string
    GROUP_CODE: BlacklistGroup
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

export interface UploadBlacklistModalProps {
    open: boolean
    onClose: () => void
    onSubmit: (payload: UploadBlacklistPayload) => void | Promise<void>
}

export interface SearchResultProps {
    uploading: boolean
    uploadProgress: number
    onUpload: (payload: UploadBlacklistPayload) => void | Promise<void>
}

export type AgGridColumnFilter = {
    column: string;
    columnFns?: string;
    value: string | string[];
}

export type AgGridFilterModelValue = {
    filterType?: 'text' | 'number' | 'date' | 'set';
    type?: string;
    filter?: string | number;
    dateFrom?: string;
    values?: string[];
}
