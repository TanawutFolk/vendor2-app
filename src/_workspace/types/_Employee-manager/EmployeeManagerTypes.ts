export type AssigneeRow = {
  APPROVAL_GROUP_MEMBER_ID?: number
  APPROVAL_GROUP_ID?: number
  EMPCODE?: string
  EMPNAME?: string
  EMPEMAIL?: string
  GROUP_CODE?: string
  GROUP_NAME?: string
  INUSE?: number | string
  ASSIGNEES_TO_ID?: number
}

export type GroupOption = {
  label: string
  value: string
}

export type GroupOptionSource = {
  APPROVAL_GROUP_ID?: number
  label?: string
  GROUP_NAME?: string
  value?: string
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
