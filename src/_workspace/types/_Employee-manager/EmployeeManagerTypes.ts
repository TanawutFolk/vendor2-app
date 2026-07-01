export type AssigneeRow = {
    empcode?: string
    empName?: string
    empEmail?: string
    group_code?: string
    group_name?: string
    INUSE?: number | string
    Assignees_id?: number
}

export type GroupOption = {
    label: string
    value: string
}

export type GroupOptionSource = {
    label?: string
    LABEL?: string
    group_name?: string
    GROUP_NAME?: string
    value?: string
    VALUE?: string
    group_code?: string
    GROUP_CODE?: string
}

export interface AddEditFormProps {
    open: boolean
    onClose: () => void
    onSaved?: () => void
    initialData?: AssigneeRow | null
}

export type SelectOption = {
    label: string
    value: string
}

export type AssigneeApiRow = AssigneeRow & {
    ASSIGNEES_TO_ID?: number
    EMPCODE?: string
    EMPNAME?: string
    EMPEMAIL?: string
    GROUP_CODE?: string
    GROUP_NAME?: string
}
